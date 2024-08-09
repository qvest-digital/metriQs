const { app, BrowserWindow } = require('electron')

const env = process.env.NODE_ENV || 'development';

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
      nodeIntegration: true,
      webSecurity: false, // Deaktiviert Web Security, for example for CORS
    }
  });

  mainWindow.webContents.openDevTools()

  if(env.toLowerCase() === 'development') {
    mainWindow.loadURL('http://localhost:4200')
  } else {
    mainWindow.loadFile(/* Angular dist folder path */'dist/browser/index.html')
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
