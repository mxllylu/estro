# AstroLocal Chrome Extension

This is a Chrome extension that provides personalized astrological activity recommendations.

## Setup

1.  Clone this repository.
2.  Open the Chrome browser and navigate to `chrome://extensions`.
3.  Enable "Developer mode" in the top right corner.
4.  Click on "Load unpacked" and select the directory where you cloned this repository.

## Getting Credentials

To use the "Export to Sheets" and location search functionalities, you need to get your own Google API key and client ID, and a Google Maps API key.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the Google Sheets API and the Google Maps JavaScript API for your project.
4.  Create an API key and a client ID.
5.  Replace the placeholder values in the `manifest.json` and `service-worker.js` files with your own credentials.

## Usage

1.  Click on the extension icon in the Chrome toolbar.
2.  Enter your zodiac sign and click "Save".
3.  The extension will display your daily forecast and recommended activities.
4.  Click on "Export to Sheets" to export the recommendations to a new Google Sheet.
