const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let nextServer;
let httpServer;
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_START_URL;

// Write logs to file for debugging
const logFile = path.join(app.getPath('userData'), 'app.log');
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (e) {
    // Ignore write errors
  }
}

function createWindow() {
  log('Creating window...');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'public/icon.png'),
    show: true, // Show immediately
    backgroundColor: '#ffffff',
  });

  log('Window created');

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  log(`Loading URL: ${startUrl}`);
  
  mainWindow.loadURL(startUrl).catch(err => {
    log(`Failed to load URL: ${err.message}`);
    // Show error page
    mainWindow.loadURL(`data:text/html,<html><body style="font-family: Arial; padding: 20px;"><h1>Error loading application</h1><p>${err.message}</p><p>Check log file at: ${logFile}</p></body></html>`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Page failed to load: ${errorCode} - ${errorDescription}`);
    // Retry after 2 seconds
    setTimeout(() => {
      log('Retrying to load URL...');
      mainWindow.loadURL(startUrl).catch(console.error);
    }, 2000);
  });

  mainWindow.on('closed', () => {
    log('Window closed');
    mainWindow = null;
  });

  // Open DevTools to see errors
  mainWindow.webContents.openDevTools();
  log('DevTools opened');
}

function startNextServerWithExpress() {
  return new Promise((resolve, reject) => {
    try {
      log('Attempting to start server with Express...');
      const express = require('express');
      const next = require('next');
      
      const nextApp = next({ 
        dev: false, 
        dir: __dirname,
        quiet: false 
      });
      const handle = nextApp.getRequestHandler();

      nextApp.prepare().then(() => {
        log('Next.js prepared');
        const server = express();
        
        server.all('*', (req, res) => {
          return handle(req, res);
        });

        httpServer = server.listen(3000, (err) => {
          if (err) {
            log(`Express server error: ${err.message}`);
            reject(err);
          } else {
            log('Express server started on port 3000');
            resolve();
          }
        });
      }).catch(err => {
        log(`Next.js prepare error: ${err.message}`);
        reject(err);
      });
    } catch (err) {
      log(`Express start error: ${err.message}`);
      reject(err);
    }
  });
}

function startNextServerWithSpawn() {
  return new Promise((resolve, reject) => {
    log('Attempting to start server with spawn...');
    // In production, use node directly to start Next.js server
    const nodeCommand = process.platform === 'win32' ? 'node.exe' : 'node';
    const nextServerPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
    
    log(`Node command: ${nodeCommand}`);
    log(`Next.js path: ${nextServerPath}`);
    log(`CWD: ${__dirname}`);
    
    nextServer = spawn(nodeCommand, [nextServerPath, 'start', '-p', '3000'], {
      cwd: __dirname,
      env: { ...process.env, PORT: '3000' },
      shell: false,
    });

    let serverReady = false;

    nextServer.stdout.on('data', (data) => {
      const message = data.toString();
      log(`Next.js stdout: ${message}`);
      if (message.includes('ready') || message.includes('started')) {
        if (!serverReady) {
          serverReady = true;
          setTimeout(resolve, 1000);
        }
      }
    });

    nextServer.stderr.on('data', (data) => {
      log(`Next.js stderr: ${data.toString()}`);
    });

    nextServer.on('close', (code) => {
      log(`Next.js process exited with code ${code}`);
    });

    nextServer.on('error', (error) => {
      log(`Next.js spawn error: ${error.message}`);
      reject(error);
    });

    setTimeout(() => {
      if (!serverReady) {
        log('Next.js server timeout after 30 seconds');
        reject(new Error('Next.js server timeout'));
      }
    }, 30000);
  });
}

function startNextServer() {
  // In development mode with ELECTRON_START_URL set
  if (process.env.ELECTRON_START_URL) {
    log('Using ELECTRON_START_URL, skipping server start');
    return Promise.resolve();
  }

  // Try Express first, fallback to spawn
  return startNextServerWithExpress().catch(err => {
    log(`Express method failed: ${err.message}, trying spawn method...`);
    return startNextServerWithSpawn();
  });
}

app.whenReady().then(async () => {
  log('=== Electron app ready ===');
  log(`App path: ${app.getAppPath()}`);
  log(`User data path: ${app.getPath('userData')}`);
  log(`Is Dev: ${isDev}`);
  log(`Platform: ${process.platform}`);
  log(`Node version: ${process.version}`);
  log(`Electron version: ${process.versions.electron}`);
  log(`Log file: ${logFile}`);
  
  // Create window FIRST so user sees something
  createWindow();
  
  // Then start server
  if (!isDev) {
    try {
      log('Starting Next.js server...');
      await startNextServer();
      log('Next.js server started successfully');
      // Reload the window to load the app
      if (mainWindow) {
        mainWindow.loadURL('http://localhost:3000');
      }
    } catch (error) {
      log(`FATAL: Failed to start server: ${error.message}`);
      log(`Stack: ${error.stack}`);
      // Show error in window
      if (mainWindow) {
        mainWindow.loadURL(`data:text/html,<html><body style="font-family: Arial; padding: 20px;">
          <h1>Failed to start server</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Log file:</strong> ${logFile}</p>
          <details>
            <summary>Stack trace</summary>
            <pre>${error.stack}</pre>
          </details>
          <h2>Troubleshooting:</h2>
          <ul>
            <li>Make sure port 3000 is not in use</li>
            <li>Try running as administrator</li>
            <li>Check the log file above for details</li>
            <li>Reinstall the application</li>
          </ul>
        </body></html>`);
      }
    }
  }

  app.on('activate', () => {
    log('App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (httpServer) {
    log('Closing HTTP server');
    httpServer.close();
  }
  if (nextServer) {
    log('Killing Next.js process');
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  log('App quitting...');
  if (httpServer) {
    httpServer.close();
  }
  if (nextServer) {
    nextServer.kill();
  }
});

// Log unhandled errors
process.on('uncaughtException', (error) => {
  log(`UNCAUGHT EXCEPTION: ${error.message}`);
  log(`Stack: ${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`UNHANDLED REJECTION: ${reason}`);
});
