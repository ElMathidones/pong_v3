const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    icon: path.join(__dirname, "ball.ico"),
    resizable: true,
    center: true,
    backgroundColor: '#0a0014',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.once('ready-to-show', () => win.show());

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;

    if (input.key === 'F11') {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
      win.webContents.send('desktop-fullscreen-change', win.isFullScreen());
      return;
    }

    if (input.key === 'Escape') {
      event.preventDefault();
      win.webContents.send('desktop-escape');
    }
  });

  win.on('enter-full-screen', () => win.webContents.send('desktop-fullscreen-change', true));
  win.on('leave-full-screen', () => win.webContents.send('desktop-fullscreen-change', false));
}

ipcMain.handle('toggle-fullscreen', () => {
  if (!win) return false;
  win.setFullScreen(!win.isFullScreen());
  const isFullscreen = win.isFullScreen();
  win.webContents.send('desktop-fullscreen-change', isFullscreen);
  return isFullscreen;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
