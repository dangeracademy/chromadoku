'use strict';

// The game is pure HTML/CSS/JS with no Node dependencies, so the preload only
// exposes a read-only marker in case the page ever wants to know it's desktop.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('chromadoku', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron
});
