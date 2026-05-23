const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  onFullscreenChange: (callback) => ipcRenderer.on('desktop-fullscreen-change', (_event, value) => callback(value)),
  onEscape: (callback) => ipcRenderer.on('desktop-escape', () => callback())
});

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('desktop-escape', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });
});
