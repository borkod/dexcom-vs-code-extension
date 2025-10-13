// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {dexcomConfig, updateConfig} from "./dexcom/config";
import { DexcomClient } from './dexcom/client';
import { GlucoseMeasurement } from './dexcom/types';
import { log } from 'console';

let myStatusBarItem: vscode.StatusBarItem;

// Variable to hold the timeout ID
let updateTimeout: NodeJS.Timeout;

// Output channel for logging
let logOutputChannel : vscode.LogOutputChannel;

let myConfig: dexcomConfig;

// Multipliers for the low and high glucose thresholds
let lowGlucoseMultiplier = 0.85;
let highGlucoseMultiplier = 1.3;


let currentResult: GlucoseMeasurement = {
	mgdl: 0,
	mmol: 0,
	timestamp: "",
	trend: "",
	isHigh: false,
	isLow: false,
};

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // Create a new output channel for logging
	logOutputChannel = vscode.window.createOutputChannel("Dexcom CGM Extension Output", {log: true});

    logOutputChannel.info('Extension "dexcom-status-bar" is now active!');

    // Set the configuration for the extension
	// Get the configuration object for the extension
    const config = vscode.workspace.getConfiguration('dexcom-vs-code-extension');
    logOutputChannel.info('Updating configuration.');
	myConfig = updateConfig(config);

    // Listening to configuration changes
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('dexcom-vs-code-extension')) {
			myConfig = updateConfig(config);
			updateStatusBarItem();
		}
	}));

    // Register the command to show the date of the last entry
	const myCommandId = 'dexcom-vs-code-extension.update-and-show-date';
	const disposable = vscode.commands.registerCommand(myCommandId, () => {
		updateStatusBarItemAndShowDate();
	});
	
    // create a new status bar item
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);

    // update status bar item once at start
	myStatusBarItem.text = `---`;
	myStatusBarItem.show();
	updateStatusBarItem();
	// Manage the timeout lifecycle
    context.subscriptions.push({
        dispose: () => {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
        }
    });

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Function to schedule the next update
function scheduleUpdate() {
	// Clear any existing timeout to prevent multiple timers
	if (updateTimeout) {
		clearTimeout(updateTimeout);
	}
    // Calculate the interval in milliseconds
    const interval = myConfig.updateInterval * 60 * 1000;
    // Schedule the next update
    updateTimeout = setTimeout(() => {
        updateStatusBarItem();
    }, interval);
}

// Function to update the status bar item and show the date of the last entry
function updateStatusBarItemAndShowDate(): void {
	updateStatusBarItem().then(() => {
		if (currentResult.mmol > 0) {
			vscode.window.showInformationMessage(`Dexcom CGM last entry at: ${currentResult.timestamp}`);
		} else {
			vscode.window.showInformationMessage(`No data available.`);
		}
	});
}

// Async function to get the latest data and update the status bar item
async function updateStatusBarItem(): Promise<void> {
	fetchData()
		.then((newResult) => {
			// Update the current result
			currentResult = newResult;
			// Update the status bar item
			if (currentResult.mmol > 0) {
				let sgv = currentResult.mgdl;
				let units = "mg/dL";
				if (myConfig.glucoseUnits === 'millimolar') {
					sgv = currentResult.mmol;
					units = "mmol/L";
				}
				// Get the trend icon based on the direction
				let icon = getTrendIcon(currentResult.trend);
				myStatusBarItem.text = `${sgv.toFixed(1)} ${units} ${icon}`;
				myStatusBarItem.show();
				showWarning();
			// If no data is available
			} else {
				myStatusBarItem.text = `---`;
				myStatusBarItem.show();
			}
		})
		// Catch any errors and log them
		.catch((error) => {
			logOutputChannel.error('Error fetching data:', error);
			currentResult = {
				mgdl: 0,
				mmol: 0,
				timestamp: "",
				trend: "",
				isHigh: false,
				isLow: false,
			};
			vscode.window.showErrorMessage(`Error fetching data: ${error.message || error}`);
			myStatusBarItem.text = `---`;
			myStatusBarItem.show();
		})
		.finally(() => {
			// Schedule the next update after completing the current one
			scheduleUpdate();
		});
}

// Function to show a warning message if the glucose level is too low or too high
function showWarning(): void {
	if (currentResult.mgdl > 0 && currentResult.isLow && myConfig.lowGlucoseWarningEnabled) {
		vscode.window.showWarningMessage(`Low blood glucose!`);
	} else if (currentResult.mgdl > 0 && currentResult.isHigh && myConfig.highGlucoseWarningEnabled) {
		vscode.window.showWarningMessage(`High blood glucose!`);
	}

	if (currentResult.mgdl > 0 && currentResult.mgdl < myConfig.lowGlucoseThreshold && currentResult.mgdl > lowGlucoseMultiplier*myConfig.lowGlucoseThreshold && myConfig.lowGlucoseWarningBackgroundEnabled) {
		myStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
	} else if (currentResult.mgdl > 0 && currentResult.mgdl < lowGlucoseMultiplier*myConfig.lowGlucoseThreshold && myConfig.lowGlucoseWarningBackgroundEnabled) {
		myStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
	} else if (currentResult.mgdl > 0 && currentResult.mgdl > myConfig.highGlucoseThreshold && currentResult.mgdl < highGlucoseMultiplier*myConfig.highGlucoseThreshold && myConfig.highGlucoseWarningBackgroundEnabled) {
		myStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
	} else if (currentResult.mgdl > 0 && currentResult.mgdl > highGlucoseMultiplier*myConfig.highGlucoseThreshold && myConfig.highGlucoseWarningBackgroundEnabled) {
		myStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
	} else {
		myStatusBarItem.backgroundColor = undefined;
	}
}

// Async function to perform the GET request
async function fetchData(): Promise<GlucoseMeasurement> {
	// initialization
	const client = new DexcomClient({
		username: myConfig.dexcomUsername,
		password: myConfig.dexcomPassword,
		// This server needs to be either "us" or "eu. If you're in the US, the server
		// should be "us". Any other country outside of the US (eg. Canada) is
		// classified as "eu" by Dexcom
		server: myConfig.dexcomRegion,
	});

	logOutputChannel.info('Fetching latest glucose value...');
	logOutputChannel.info('Using client configuration: ' + JSON.stringify(client));

	let latestGlucoseValue: GlucoseMeasurement = {
		mgdl: 0,
		mmol: 0,
		timestamp: "",
		trend: "",
		isHigh: false,
		isLow: false,
	};

	const response = await client.getEstimatedGlucoseValues();
	
	// Check for null/undefined response
	if (!response) {
		throw new Error("No response received from Dexcom API");
	}
	
	// Check for empty array
	if (!Array.isArray(response) || response.length === 0) {
		throw new Error("No glucose data available from Dexcom API");
	}
	
	// Check if the first entry has required properties
	const firstEntry = response[0];
	if (!firstEntry || typeof firstEntry.mgdl !== 'number' || typeof firstEntry.mmol !== 'number') {
		throw new Error("Invalid glucose data structure received from Dexcom API");
	}
	
	// Get the latest glucose value
	latestGlucoseValue.mgdl = firstEntry.mgdl;
	latestGlucoseValue.mmol = firstEntry.mmol;
	latestGlucoseValue.timestamp = firstEntry.timestamp;
	latestGlucoseValue.trend = firstEntry.trend;

	// Log the latest glucose value
	logOutputChannel.info(`Latest glucose value: ${latestGlucoseValue.mgdl} mg/dL`);
	// Return the latest glucose value
	if (latestGlucoseValue.mgdl < myConfig.lowGlucoseThreshold) {
		latestGlucoseValue.isLow = true;
	} else if (latestGlucoseValue.mgdl > myConfig.highGlucoseThreshold) {
		latestGlucoseValue.isHigh = true;
	}
	return latestGlucoseValue;
}

// Function to get the trend icon based on the direction
function getTrendIcon(direction: string): string {
	switch (direction.toLowerCase()) {
		case "flat":
			return '→';
		case "singleup":
			return '↑';
		case "doubleup":
			return '↑↑';
		case "singledown":
			return '↓';
		case "doubledown":
			return '↓↓';
		case "fortyfiveup":
			return '↗';
		case "fortyfivedown":
			return '↘';
		default:
			return '??';
	}
}