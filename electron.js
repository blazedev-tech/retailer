const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextServer;
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_START_URL;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'public/icon.png'),
    show: false,
  });

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    // In development mode with ELECTRON_START_URL set
    if (process.env.ELECTRON_START_URL) {
      resolve();
      return;
    }

    // In production, use node directly to start Next.js server
    const nodeCommand = process.platform === 'win32' ? 'node.exe' : 'node';
    const nextServerPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
    
    nextServer = spawn(nodeCommand, [nextServerPath, 'start', '-p', '3000'], {
      cwd: __dirname,
      env: { ...process.env, PORT: '3000' },
      shell: false,
    });

    let serverReady = false;

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('ready') || data.toString().includes('started')) {
        if (!serverReady) {
          serverReady = true;
          setTimeout(resolve, 1000);
        }
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextServer.on('close', (code) => {
      console.log(`Next.js process exited with code ${code}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Next.js server timeout'));
      }
    }, 30000);
  });
}

app.whenReady().then(async () => {
  try {
    await startNextServer();
    createWindow();
  } catch (error) {
    console.error('Failed to start:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});
