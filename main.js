const { app, BrowserWindow } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('node:path')

const env = process.env.NODE_ENV || 'development';

const { autoUpdater } = require("electron-updater")
//FIXME: "Error: No published versions on GitHub"
//autoUpdater.checkForUpdatesAndNotify()

if (env.toLowerCase() === 'development') {
  // Remote Debugging nur im Entwicklungsmodus aktivieren
  app.commandLine.appendSwitch('remote-debugging-port', '9222');
  app.commandLine.appendSwitch('inspect', '0.0.0.0:5858');
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false, // Deaktiviert Web Security, for example for CORS
    }
  });

  if(env.toLowerCase() === 'development') {
    mainWindow.loadURL('http://localhost:4200')
    mainWindow.webContents.openDevTools()
  } else {
      const indexPath = path.join(__dirname, 'dist', 'metriqs', 'browser', 'index.html');
      mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
