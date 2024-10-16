// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example' | 'query-database';


export type HardwareInfo = {
  serialNumber: string;
  ex1Enabled: boolean;
  ex2Enabled: boolean;
};


const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  // Add this new method for database queries
  queryDatabase: (query: string) => ipcRenderer.invoke('query-database', query),
  insertData: (data: any) => ipcRenderer.invoke('insert-data', data),
  deleteData: (id: number) => ipcRenderer.invoke('delete-data', id), // Add delete functionality
  updateData: (data: any) => ipcRenderer.invoke('update-data', data),
  
  insertShockSet: (data: any) => ipcRenderer.invoke('insert-shock-set', data),
  updateShockSet: (data: any) => ipcRenderer.invoke('update-shock-set', data),
  deleteShockSet: (id: number) => ipcRenderer.invoke('delete-shock-set', id),

// Shocks IPC methods
  queryShocks: (shockSetId: number) => ipcRenderer.invoke('query-shocks', shockSetId),
  insertShock: (data: any) => ipcRenderer.invoke('insert-shock', data),
  updateShock: (data: any) => ipcRenderer.invoke('update-shock', data),
  deleteShock: (id: number) => ipcRenderer.invoke('delete-shock', id),
  // Adjusters IPC methods
  queryAdjusters: (shockId: number) => ipcRenderer.invoke('query-adjusters', shockId),
  insertAdjuster: (data: any) => ipcRenderer.invoke('insert-adjuster', data),
  updateAdjuster: (data: any) => ipcRenderer.invoke('update-adjuster', data),
  deleteAdjuster: (id: number) => ipcRenderer.invoke('delete-adjuster', id),

  sendPing: (portName: any) => ipcRenderer.invoke('send-ping', portName),
  requestHardwareInfo: (portName: string) => ipcRenderer.invoke('request-hardware-info', portName),
  sendLeverPosition: (portName: string, position: number) => ipcRenderer.invoke('send-lever-position', portName, position),
  startRun: (portName: string) => ipcRenderer.invoke('start-run', portName),
  endRun: (portName: string) => ipcRenderer.invoke('end-run'),
  checkConnection: (portName: string) => ipcRenderer.invoke('check-connection', portName),


  queryTestLogs: () => ipcRenderer.invoke('query-test-logs'),
  insertTestLog: (data: any) => ipcRenderer.invoke('insert-test-log', data),
  updateTestLog: (data: any) => ipcRenderer.invoke('update-test-log', data),
  deleteTestLog: (interval: number, testId: number) => ipcRenderer.invoke('delete-test-log', interval, testId),


  queryTestRecords: (userId?: number) => ipcRenderer.invoke('query-test-records', userId),
  insertTestRecord: (data: any) => ipcRenderer.invoke('insert-test-record', data),
  updateTestRecord: (data: any) => ipcRenderer.invoke('update-test-record', data),
  deleteTestRecord: (userId: number, testId: number) => ipcRenderer.invoke('delete-test-record', userId, testId),

  
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;