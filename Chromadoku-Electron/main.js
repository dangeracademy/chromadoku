'use strict';

const { app, BrowserWindow, Menu, shell, screen } = require('electron');
const path = require('path');

const isMac = process.platform === 'darwin';
let mainWindow = null;

// The game stores everything in localStorage; giving it a named partition keeps
// saves stable across versions and separate from any other Electron app.
const PARTITION = 'persist:chromadoku';

function createWindow() {
  // The whole board plus palette wants about 1070px of height at this width.
  // Ask for that, but never open taller than the screen actually allows.
  const work = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(640, work.width - 40);
  const height = Math.min(1070, work.height - 40);

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 420,
    minHeight: 560,
    backgroundColor: '#f5f5f5',
    title: 'Chromadoku',
    show: false,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      partition: PARTITION,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });

  // External links (danger.academy, etc.) open in the real browser, never in-app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });
}

// Click a button in the game by id, from the app menu.
function clickInGame(id) {
  if (!mainWindow) return;
  mainWindow.webContents.executeJavaScript(
    `document.getElementById(${JSON.stringify(id)})?.click();`
  ).catch(() => {});
}

function buildMenu() {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Game',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'CmdOrCtrl+N',
          click: () => clickInGame('newGameBtn')
        },
        { type: 'separator' },
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', click: () => clickInGame('undoBtn') },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', click: () => clickInGame('redoBtn') },
        { label: 'Clear Board', accelerator: 'CmdOrCtrl+Backspace', click: () => clickInGame('clearBtn') },
        { label: 'Hint', accelerator: 'CmdOrCtrl+H', click: () => clickInGame('hintBtn') },
        { type: 'separator' },
        {
          label: 'Settings…',
          accelerator: 'CmdOrCtrl+,',
          click: () => clickInGame('settingsBtn')
        },
        ...(isMac ? [] : [{ type: 'separator' }, { role: 'quit' }])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: isMac
        ? [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }]
        : [{ role: 'minimize' }, { role: 'close' }]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About Chromadoku',
          click: () => clickInGame('aboutLink')
        },
        {
          label: 'danger.academy',
          click: () => shell.openExternal('https://danger.academy/')
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Single instance — focus the existing window instead of opening a second one.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    buildMenu();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (!isMac) app.quit();
  });
}
