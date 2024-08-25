const { app, BrowserWindow, globalShortcut } = require('electron');
const url = require('url');
const path = require('path');
const { spawn } = require('child_process');

let ahkProcess;

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Electron App',
    width: 800,
    height: 600,
    kiosk: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, '/electron-cra/build/index.html'),
    protocol: 'file:',
  });

  mainWindow.loadURL(startUrl);


  const timeToClose = 10000; 

  // Schedule the app to close after the specified time
  setTimeout(() => {
    mainWindow.close(); // Close the window
    app.quit(); // Quit the application
  }, timeToClose);

  // Register a global shortcut to manually close the app
  globalShortcut.register('Control+Shift+Q', () => {
    mainWindow.close(); // Close the window
    app.quit(); // Quit the application
  });

  // Run the AutoHotkey script to disable keys
  const ahkScriptPath = path.join(__dirname, 'disableKeys.exe');
  ahkProcess = spawn(ahkScriptPath);

  ahkProcess.on('error', (err) => {
    console.error('Failed to start AHK process:', err);
  });

  ahkProcess.on('exit', (code, signal) => {
    console.log(`AHK process exited with code ${code} and signal ${signal}`);
  });
}

app.whenReady().then(createMainWindow);

app.on('will-quit', () => {
  // Unregister all shortcuts to avoid memory leaks
  globalShortcut.unregisterAll();

  if (ahkProcess) {
    ahkProcess.kill(); // Gracefully kill the AHK process
  }
});
