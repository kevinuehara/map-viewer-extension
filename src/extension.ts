import * as vscode from 'vscode';

// RegExp (ex: 40.748817, -73.985428)
const latLonRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "open-leaflet-map" is now active.');

    let disposable = vscode.commands.registerCommand('extension.openMapFromSelection', () => {
        const editor = vscode.window.activeTextEditor;
        
        if (editor) {
            const selectedText = editor.document.getText(editor.selection);
            
            const match = selectedText.match(latLonRegex);
            
            if (match) {
                const latitude = match[1];
                const longitude = match[2];

                const panel = vscode.window.createWebviewPanel(
                    'leafletMap', 
                    'Leaflet Map',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                        localResourceRoots: [vscode.Uri.file(context.extensionPath)]
                    }
                );

                panel.webview.html = getLeafletMapHtml(latitude, longitude);
            } else {
                vscode.window.showErrorMessage('Selected text is not a valid latitude/longitude.');
            }
        }
    });

    context.subscriptions.push(disposable);
}

function getLeafletMapHtml(latitude: string, longitude: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Leaflet Map</title>
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map').setView([${latitude}, ${longitude}], 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([${latitude}, ${longitude}]).addTo(map)
                    .bindPopup('${latitude}, ${longitude}')
                    .openPopup();
            </script>
        </body>
        </html>
    `;
}

export function deactivate() {
    console.log('Extension "open-leaflet-map-viewer" is now deactivated.');
}
