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
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import sqlite3 from 'sqlite3';

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

//DATABASE PORTION

// Open the database connection
const dbPath = path.join(__dirname, 'test.db');
const db = new sqlite3.Database(dbPath);

// Handle database queries
ipcMain.handle('query-database', async (event, query) => {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('insert-data', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Vehicles (User_ID, Vehicle_Type_ID, Nickname_ID, Nickname, Make, Model, Year) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [data.User_ID, data.Vehicle_Type_ID, data.Nickname_ID, data.Nickname, data.Make, data.Model, data.Year], (err) => {
      if (err) reject(err);
      else resolve('Vehicle data inserted successfully');
    });
  });
});

ipcMain.handle('delete-data', async (event, id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM Vehicles WHERE Nickname_ID = ?`;
    db.run(query, [id], (err) => {
      if (err) reject(err);
      else resolve('Vehicle data deleted successfully');
    });
  });
});

ipcMain.handle('update-data', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Vehicles 
                   SET User_ID = ?, Vehicle_Type_ID = ?, Nickname = ?, Make = ?, Model = ?, Year = ? 
                   WHERE Nickname_ID = ?`;
    db.run(query, [data.User_ID, data.Vehicle_Type_ID, data.Nickname, data.Make, data.Model, data.Year, data.Nickname_ID], (err) => {
      if (err) reject(err);
      else resolve('Vehicle data updated successfully');
    });
  });
});


// Query all Shock Sets
ipcMain.handle('query-shock-sets', async (event, query) => {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Insert new Shock Set (with Shock_Set_ID)
ipcMain.handle('insert-shock-set', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Shocks_Set (Shock_Set_ID, User_ID, Vehicle_ID, Shock_Set_Nickname) 
                   VALUES (?, ?, ?, ?)`;
    db.run(query, [data.Shock_Set_ID, data.User_ID, data.Vehicle_ID, data.Shock_Set_Nickname], (err) => {
      if (err) reject(err);
      else resolve('Shock Set inserted successfully');
    });
  });
});

// Update an existing Shock Set
ipcMain.handle('update-shock-set', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Shocks_Set 
                   SET User_ID = ?, Vehicle_ID = ?, Shock_Set_Nickname = ? 
                   WHERE Shock_Set_ID = ?`;
    db.run(query, [data.User_ID, data.Vehicle_ID, data.Shock_Set_Nickname, data.Shock_Set_ID], (err) => {
      if (err) reject(err);
      else resolve('Shock Set updated successfully');
    });
  });
});


// Delete a Shock Set by ID
ipcMain.handle('delete-shock-set', async (event, id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM Shocks_Set WHERE Shock_Set_ID = ?`;
    db.run(query, [id], (err) => {
      if (err) reject(err);
      else resolve('Shock Set deleted successfully');
    });
  });
});


// Insert new Shock
ipcMain.handle('insert-shock', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Shocks (Shock_Set_ID, Shock_Brand, Shock_Name, Shock_Location, isAdjustable, Adjuster_Amount) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [data.Shock_Set_ID, data.Shock_Brand, data.Shock_Name, data.Shock_Location, data.isAdjustable, data.Adjuster_Amount], (err) => {
      if (err) reject(err);
      else resolve('Shock inserted successfully');
    });
  });
});

// Update an existing Shock
ipcMain.handle('update-shock', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Shocks 
                   SET Shock_Brand = ?, Shock_Name = ?, Shock_Location = ?, isAdjustable = ?, Adjuster_Amount = ? 
                   WHERE Shock_ID = ?`;
    db.run(query, [data.Shock_Brand, data.Shock_Name, data.Shock_Location, data.isAdjustable, data.Adjuster_Amount, data.Shock_ID], (err) => {
      if (err) reject(err);
      else resolve('Shock updated successfully');
    });
  });
});

// Delete a Shock by ID
ipcMain.handle('delete-shock', async (event, id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM Shocks WHERE Shock_ID = ?`;
    db.run(query, [id], (err) => {
      if (err) reject(err);
      else resolve('Shock deleted successfully');
    });
  });
});

// Query all Shocks for a specific Shock Set
ipcMain.handle('query-shocks', async (event, shockSetId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Shocks WHERE Shock_Set_ID = ?`;
    db.all(query, [shockSetId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

//Adjusters

// Insert a new Adjuster
ipcMain.handle('insert-adjuster', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Adjusters (Shock_ID, Adjuster_ID, Adjuster_Nickname, Adjuster_Type, Adjuster_Max) 
                   VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [data.Shock_ID, data.Adjuster_ID, data.Adjuster_Nickname, data.Adjuster_Type, data.Adjuster_Max], (err) => {
      if (err) reject(err);
      else resolve('Adjuster inserted successfully');
    });
  });
});

// Query Adjusters for a specific Shock
ipcMain.handle('query-adjusters', async (event, shockId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Adjusters WHERE Shock_ID = ?`;
    db.all(query, [shockId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// Update an existing Adjuster
ipcMain.handle('update-adjuster', async (event, data) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE Adjusters 
                   SET Adjuster_Nickname = ?, Adjuster_Type = ?, Adjuster_Max = ? 
                   WHERE Adjuster_ID = ?`;
    db.run(query, [data.Adjuster_Nickname, data.Adjuster_Type, data.Adjuster_Max, data.Adjuster_ID], (err) => {
      if (err) reject(err);
      else resolve('Adjuster updated successfully');
    });
  });
});

// Delete an Adjuster by ID
ipcMain.handle('delete-adjuster', async (event, id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM Adjusters WHERE Adjuster_ID = ?`;
    db.run(query, [id], (err) => {
      if (err) reject(err);
      else resolve('Adjuster deleted successfully');
    });
  });
});


//DATABASE PORTION END

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


  