import { WorkspaceConfiguration } from "vscode";
import { DexcomServer } from "./types";

// Configuration for the extension
export interface dexcomConfig {
	dexcomRegion: DexcomServer;
	dexcomUsername: string;
	dexcomPassword: string;
	glucoseUnits: string;
	lowGlucoseWarningEnabled: boolean;
	lowGlucoseWarningBackgroundEnabled: boolean;
	highGlucoseWarningEnabled: boolean;
	highGlucoseWarningBackgroundEnabled: boolean;
	lowGlucoseThreshold: number;
	glucoseWarningBackgroundEnabled: boolean;
	highGlucoseThreshold: number;
	updateInterval: number;
}

export function updateConfig(config: WorkspaceConfiguration): dexcomConfig
{
	return {
        glucoseUnits: config.get<string>('glucoseUnits', 'milligrams'),
		dexcomUsername: config.get<string>('dexcomUsername', ''),
		dexcomPassword: config.get<string>('dexcomPassword', ''),
		dexcomRegion: getServer(config.get<string>('dexcomRegion', '')),
		//linkUpConnection: config.get<string>('linkUpConnection', ''),
        lowGlucoseWarningEnabled: config.get<boolean>('low-glucose-warning-message.enabled', true),
		lowGlucoseWarningBackgroundEnabled: config.get<boolean>('low-glucose-warning-background-color.enabled', true),
		highGlucoseWarningEnabled: config.get<boolean>('high-glucose-warning-message.enabled', true),
		highGlucoseWarningBackgroundEnabled: config.get<boolean>('high-glucose-warning-background-color.enabled', true),
		lowGlucoseThreshold: config.get<number>('low-glucose-warning.value', 70),
		highGlucoseThreshold: config.get<number>('high-glucose-warning.value', 180),
		glucoseWarningBackgroundEnabled: config.get<boolean>('glucose-warning-background-color.enabled', true),
	    updateInterval: config.get<number>('updateInterval', 10),
	};
}

function getServer(region: string): DexcomServer {
    return region === "us" ? "us" : "eu";
}