/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import sqlite3 from 'sqlite3';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';


import {
  handleQueryDatabase,
  handleInsertData,
  handleDeleteData,
  handleUpdateData,
  handleQueryShockSets,
  handleInsertShockSet,
  handleUpdateShockSet,
  handleDeleteShockSet,
  handleInsertShock,
  handleUpdateShock,
  handleDeleteShock,
  handleQueryShocks,
  handleInsertAdjuster,
  handleQueryAdjusters,
  handleUpdateAdjuster,
  handleDeleteAdjuster,
} from './database';

app.on('ready', () => {
  // Call the functions to set up ipcMain handlers
  handleQueryDatabase();
  handleInsertData();
  handleDeleteData();
  handleUpdateData();
  handleQueryShockSets();
  handleInsertShockSet();
  handleUpdateShockSet();
  handleDeleteShockSet();
  handleInsertShock();
  handleUpdateShock();
  handleDeleteShock();
  handleQueryShocks();
  handleInsertAdjuster();
  handleQueryAdjusters();
  handleUpdateAdjuster();
  handleDeleteAdjuster();

  // Rest of your app initialization code
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};


import { SerialPort } from 'serialport';
import crypto from 'crypto';

 // Constants
const AES_KEY = Buffer.from('bf8768f5dd65d04b67f188aa3633d6d4', 'hex');
const EOM_SEQUENCE = 0x0A0A0A0A;
const DYNO_SEND_MSG_PING = 0x01;
const DYNO_RECV_MSG_ACK_PING = 0x01;

// Helper functions for constructing, encrypting, decrypting packets
function constructPacket(pktType: number, data: Buffer = Buffer.alloc(0)): Buffer {
  let fullLen = Math.max(data.length, 8) + 8; // Ensure at least 8 bytes of data
  if (fullLen % 16 !== 0) {
    fullLen += 16 - (fullLen % 16);
  }

  const toSend = Buffer.alloc(fullLen);
  toSend.writeUInt16LE(fullLen, 0);
  toSend.writeUInt16LE(pktType, 2);

  if (data.length > 0) {
    data.copy(toSend, 4);
  }

  toSend.writeUInt32LE(EOM_SEQUENCE, fullLen - 4);
  return toSend;
}

function encryptData(data: Buffer): Buffer {
  const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data), cipher.final()]);
}

function decryptData(data: Buffer): Buffer {
  const decipher = crypto.createDecipheriv('aes-128-ecb', AES_KEY, null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

function parseDataResponse(data: Buffer) {
  if (data.length < 16) {
    console.log('Invalid data packet length');
    return null;
  }

  const pktLen = data.readUInt16LE(0);
  const pktType = data.readUInt16LE(2);
  const pktEom = data.readUInt32LE(pktLen - 4);

  if (pktEom !== EOM_SEQUENCE) {
    console.log('EOM sequence not matching... Skipping');
    return null;
  }

  return { pktLen, pktType, data: data.slice(4, pktLen - 4) };
}

function handlePingResponse(response: Buffer) {
  const parsed = parseDataResponse(response);
  if (!parsed) return null;

  const { pktType } = parsed;
  if (pktType === DYNO_RECV_MSG_ACK_PING) {
    console.log('Ping acknowledged');
    return { type: 'ack_ping' };
  } else {
    console.log('Unexpected response type:', pktType);
    return null;
  }
}

function sendPing(portName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    port.on('open', () => {
      console.log('Port opened:', portName);

      const packet = constructPacket(DYNO_SEND_MSG_PING);
      const encryptedPacket = encryptData(packet);

      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for ping response'));
      }, 5000); // 5 second timeout

      function onData(data: Buffer) {
        clearTimeout(timeout);
        try {
          const decryptedResponse = decryptData(data);
          const response = handlePingResponse(decryptedResponse);
          if (response) {
            resolve(response);
          } else {
            reject(new Error('Invalid ping response'));
          }
        } catch (err) {
          if (err instanceof Error) {
            reject(new Error(`Decryption error: ${err.message}`));
          } else {
            reject(new Error('Decryption error: Unknown error'));
          }
        }
      }

      port.once('data', onData);

      port.write(encryptedPacket, (err) => {
        if (err) {
          clearTimeout(timeout);
          port.removeListener('data', onData);
          reject(new Error(`Error sending ping: ${err.message}`));
        } else {
          console.log('Ping sent');
        }
      });
    });

    port.on('error', (err) => {
      reject(new Error(`Port error: ${err.message}`));
    });
  });
}

// IPC handler for serial communication
ipcMain.handle('send-ping', async (event, portName: string) => {
  try {
    const result = await sendPing(portName);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
});


const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
