# Electron Desktop Application - Build Guide

## Overview

This guide explains how to build the Retailer Management System as a standalone desktop application for Windows, macOS, and Linux.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** (comes with Node.js)
3. **Git** (optional, for cloning)

### Platform-Specific Requirements

- **Windows**: No additional requirements
- **macOS**: Xcode Command Line Tools (for macOS builds)
- **Linux**: Standard build tools (`build-essential` on Debian/Ubuntu)

## Quick Start

### Option 1: Using Build Scripts (Recommended)

#### On Linux/macOS:
```bash
chmod +x build-electron.sh
./build-electron.sh
```

#### On Windows:
```batch
build-electron.bat
```

The script will guide you through the build process interactively.

### Option 2: Manual Build

1. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

2. **Build Next.js application:**
```bash
npm run build
```

3. **Build Electron app:**
```bash
# For Windows
npx electron-builder --win

# For macOS
npx electron-builder --mac

# For Linux
npx electron-builder --linux

# For all platforms
npx electron-builder -mwl
```

## Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build Next.js for production |
| `npm run start` | Start Next.js production server |
| `npm run electron` | Run Electron app (requires dev server) |
| `npm run electron:dev` | Start dev server and Electron together |
| `npm run electron:build` | Build Electron app for current platform |
| `npm run electron:build:all` | Build for Windows, macOS, and Linux |

## Build Output

After building, the `dist/` folder will contain:

### Windows
- `Retailer Management System Setup X.X.X.exe` - Installer
- `Retailer Management System X.X.X.exe` - Portable version

### macOS
- `Retailer Management System-X.X.X.dmg` - DMG installer
- `Retailer Management System-X.X.X-mac.zip` - ZIP archive

### Linux
- `retailer-management-system-X.X.X.AppImage` - AppImage (runs on all distros)
- `retailer-management-system_X.X.X_amd64.deb` - Debian/Ubuntu package

## Configuration

### Electron Builder Configuration

The build configuration is in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.retailer.app",
    "productName": "Retailer Management System",
    "files": [
      "electron.js",
      ".next/**/*",
      "node_modules/**/*",
      "package.json",
      "public/**/*",
      "retailer.db"
    ],
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg", "zip"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

### Customization

**Change App Name:**
Edit `productName` in `package.json`

**Change App ID:**
Edit `appId` in `package.json`

**Change Icon:**
Replace `public/icon.png` with your own icon (256x256 recommended)

## Development

### Running in Development Mode

```bash
npm run electron:dev
```

This will:
1. Start the Next.js development server on port 3000
2. Wait for the server to be ready
3. Launch the Electron window

### Hot Reload

The development mode supports hot reload:
- Changes to Next.js code will automatically refresh
- Changes to `electron.js` require restarting the app

## Troubleshooting

### Build Errors

**Error: "Cannot find module 'electron'"**
```bash
npm install --save-dev electron
```

**Error: "Python not found"**
- Install Python 3.x and add to PATH

**Error: "node-gyp rebuild failed"**
```bash
npm install --global node-gyp
npm install --legacy-peer-deps
```

### Database Issues

The SQLite database (`retailer.db`) is included in the build. 
- Fresh installs start with an empty database
- To include sample data, populate the database before building

### Port Already in Use

If port 3000 is busy:
1. Stop any running Next.js servers
2. Change the port in `electron.js` and package scripts

## Distribution

### Windows
- Share the `.exe` installer with users
- They can install without admin rights (NSIS allows user-level install)
- Portable version requires no installation

### macOS
- Share the `.dmg` file
- Users drag the app to Applications folder
- For distribution outside App Store, you may need to sign the app

### Linux
- **AppImage**: Works on all distributions, no installation needed
- **.deb**: For Debian/Ubuntu users via `dpkg -i` or double-click
- Users may need to make AppImage executable: `chmod +x file.AppImage`

## Database Location

The database is stored in:
- **Windows**: `%APPDATA%/retailer/retailer.db`
- **macOS**: `~/Library/Application Support/retailer/retailer.db`
- **Linux**: `~/.config/retailer/retailer.db`

To backup data, copy the `retailer.db` file from these locations.

## Security Notes

1. The app runs Next.js server locally (localhost:3000)
2. No internet connection required after installation
3. All data stays on the user's computer
4. SQLite database is not encrypted by default

## Advanced Configuration

### Auto-Updater

To add auto-update functionality:
1. Set up a release server
2. Configure `publish` in `package.json`
3. Implement update checking in `electron.js`

### Code Signing

**Windows:**
```bash
electron-builder --win --publish never --config.win.sign=./sign.js
```

**macOS:**
```bash
electron-builder --mac --publish never --config.mac.identity="Developer ID Application: Your Name"
```

### Custom Build Targets

Edit `package.json` to change build targets:
```json
{
  "build": {
    "win": {
      "target": ["nsis", "portable", "msi"]
    }
  }
}
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Electron Builder docs: https://www.electron.build/
3. Check Next.js docs: https://nextjs.org/docs

## Version History

- **0.1.0**: Initial Electron build support
  - Windows, macOS, Linux support
  - Automated build scripts
  - QR code scanning
  - Batch ID system

---

**Happy Building! 🚀**
