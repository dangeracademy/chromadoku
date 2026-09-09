# Chromadoku — Electron

Desktop wrapper around `chromadoku-v1.1.html`. The game file itself is untouched;
it lives at `renderer/index.html`.

## Run it

```bash
cd Chromadoku-Electron
npm install
npm start
```

## Build installers

```bash
npm run dist:mac     # .dmg + .zip (arm64 + x64)
npm run dist:win     # NSIS installer + portable .exe
npm run dist:linux   # AppImage
```

Output lands in `dist/`. Cross-building for macOS requires a Mac; Windows and
Linux targets can be built from a Mac with the usual electron-builder caveats
(no code signing configured — macOS builds will be unsigned, so first launch
needs right-click → Open).

## What the wrapper adds

- Native menu bar: New Game (⌘N), Undo (⌘Z), Redo (⇧⌘Z), Clear (⌘⌫), Hint (⌘H),
  Settings (⌘,). These just click the corresponding button in the page.
- External links (danger.academy) open in the system browser, not in the app window.
- Single-instance lock — reopening focuses the existing window.
- Window opens at 640 × 1070, clamped to fit the screen. Resizable, min 420 × 560.
- Saves and stats use a named session partition (`persist:chromadoku`), so
  localStorage survives app updates.

## Files

```
main.js              Electron main process — window, menu, link handling
preload.js           Exposes window.chromadoku = { isDesktop, platform, version }
renderer/index.html  The game, verbatim copy of chromadoku-v1.1.html
build/icon.png       1024×1024 app icon (nine-color grid)
package.json         Scripts + electron-builder config
```

## Updating the game

Replace `renderer/index.html` with the newer HTML file. If you rename or remove
any of the button ids the menu relies on (`newGameBtn`, `undoBtn`, `redoBtn`,
`clearBtn`, `hintBtn`, `settingsBtn`, `aboutLink`), update `main.js` to match —
menu items silently do nothing if their id is missing.

CC0 public domain, same as the game.
