# Dexcom CGM Extension for Visual Studio Code

This Visual Studio Code extension retrieves the most recent blood glucose reading from your [Dexcom CGM](https://www.dexcom.com/) and displays it in your Visual Studio Code status bar. It can also be used to monitor glucose levels of a friend or family member if you have a [Dexcom Follow App](https://www.dexcom.com/dexcom-follow) account.

If you are not a Dexcom CGM user and use a different CGM, you may be interested in [LibreLinkUp Status Bar Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=borkod.librelinkup-vs-code-extension) or [Nightscout Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=borkod.nightscout-status-bar).

![Dexcom CGM Extension for Visual Studio Code](https://raw.githubusercontent.com/borkod/dexcom-vs-code-extension/refs/heads/main/images/dexcom-vs-code.gif)

## Features

## Features

- Periodically retrieves the most recent blood glucose reading from your Dexcom and displays it in your Visual Studio Code Status bar
- Provides visual indicator of your blood glucose levels trend
- Provides `Dexcom: Update and Show Last Entry Date` command to manually trigger an update and display the date and time of the latest reading in your Dexcom sensor
  - Command can be triggered by clicking on your blood glucose reading in the status bar or via VS Code Command Palette
- Low and high blood glucose level warnings
- Status bar background color change on low or high blood glucose level warnings
- Fully configurable settings

## Extension Settings

This extension contributes the following settings:

- `dexcom-vs-code-extension.dexcomUsername`: Dexcom (or Dexcom Follow App) Login Email (e.g. `mail@example.com`).
- `dexcom-vs-code-extension.dexcomPassword`: Dexcom (or Dexcom Follow App) Login Password.
- `dexcom-vs-code-extension.dexcomRegion`: Dexcom region. (Possible values: eu, us)
- `dexcom-vs-code-extension.glucoseUnits`: Blood glucose units. Supported units are mmol/L (Millimoles Per Litre) and mg/dL (Milligrams per 100 millilitres).
- `dexcom-vs-code-extension.high-glucose-warning-message.enabled`: Enables high glucose warning.
- `dexcom-vs-code-extension.high-glucose-warning.value`: High glucose warning threshold value (in mg/dL).
- `dexcom-vs-code-extension.low-glucose-warning-message.enabled`: Enables low glucose warning.
- `dexcom-vs-code-extension.glucose-warning-background-color.enabled`: Enable high or low glucose warning background color.
- `dexcom-vs-code-extension.low-glucose-warning.value`: Low glucose warning threshold value (in mg/dL).
- `dexcom-vs-code-extension.updateInterval`: Time interval (in minutes) between queries for updated data.

## Debugging

This extension creates `Dexcom CGM Extension Output` and `Dexcom Client Output` output channels. Several info, warning, and error log messages are written to these channels. You can view these channels to inspect actions the extension is performing.

If you encounter any problems, open a GitHub [issue](https://github.com/borkod/dexcom-vs-code-extension/issues).

## About

I was looking for a tool that would allow me to monitor my blood glucose levels without distractions. As a Visual Studio Code user, I believed that displaying the readings in the status bar would seamlessly integrate with my development environment.

I hope others find this tool helpful too!

If you would like to support this project, feel free to [buy me a coffee](https://buymeacoffee.com/borkod).