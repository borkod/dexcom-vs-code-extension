import { WorkspaceConfiguration } from "vscode";

// Configuration for the extension
export interface dexcomConfig {
	//dexcomRegion: string;
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
		//dexcomRegion: config.get<string>('dexcomRegion', ''),
		lowGlucoseWarningEnabled: config.get<boolean>('low-glucose-warning-message.enabled', true),
        lowGlucoseWarningBackgroundEnabled: config.get<boolean>('low-glucose-warning-background-color.enabled', true),
	    highGlucoseWarningEnabled: config.get<boolean>('high-glucose-warning-message.enabled', true),
        highGlucoseWarningBackgroundEnabled: config.get<boolean>('high-glucose-warning-background-color.enabled', true),
        lowGlucoseThreshold: config.get<number>('low-glucose-threshold', 70),
		glucoseWarningBackgroundEnabled: config.get<boolean>('glucose-warning-background-color.enabled', true),
        highGlucoseThreshold: config.get<number>('high-glucose-threshold', 180),
        updateInterval: config.get<number>('updateInterval', 10),
	};
}