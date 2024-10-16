import { SerialPort } from 'serialport';
import crypto from 'crypto';
import { HardwareInfo } from './preload';

// Constants
const AES_KEY = Buffer.from('bf8768f5dd65d04b67f188aa3633d6d4', 'hex');
const EOM_SEQUENCE = 0x0A0A0A0A;
const DYNO_SEND_MSG_PING = 0x01;
const DYNO_RECV_MSG_ACK_PING = 0x01;

// Helper functions for constructing, encrypting, decrypting packets
export function constructPacket(pktType: number, data: Buffer = Buffer.alloc(0)): Buffer {
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

export function encryptData(data: Buffer): Buffer {
  const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data), cipher.final()]);
}

export function decryptData(data: Buffer): Buffer {
  const decipher = crypto.createDecipheriv('aes-128-ecb', AES_KEY, null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

export function parseDataResponse(data: Buffer) {
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

export function handlePingResponse(response: Buffer) {
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
export function sendPing(portName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const port = new SerialPort({ path: portName, baudRate: 9600 });
  
      const closePort = () => {
        if (port.isOpen) {
          port.close((err) => {
            if (err) {
              console.error('Error closing port:', err);
            } else {
              console.log('Port closed successfully');
            }
          });
        }
      };
  
      port.on('open', () => {
        console.log('Port opened:', portName);
  
        const packet = constructPacket(DYNO_SEND_MSG_PING);
        const encryptedPacket = encryptData(packet);
  
        const timeout = setTimeout(() => {
          closePort();
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
          } finally {
            closePort();
          }
        }
  
        port.once('data', onData);
  
        port.write(encryptedPacket, (err) => {
          if (err) {
            clearTimeout(timeout);
            port.removeListener('data', onData);
            closePort();
            reject(new Error(`Error sending ping: ${err.message}`));
          } else {
            console.log('Ping sent');
          }
        });
      });
  
      port.on('error', (err) => {
        closePort();
        reject(new Error(`Port error: ${err.message}`));
      });
    });
  }


const DYNO_SEND_MSG_REQUEST_HW_INFO = 0x0e;
const DYNO_RECV_MSG_RETURN_HW_INFO = 0x08;

export function requestHardwareInfo(portName: string): Promise<HardwareInfo> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    const closePort = () => {
      if (port.isOpen) {
        port.close((err) => {
          if (err) {
            console.error('Error closing port:', err);
          } else {
            console.log('Port closed successfully');
          }
        });
      }
    };

    port.on('open', () => {
      console.log('Port opened:', portName);

      const packet = constructPacket(DYNO_SEND_MSG_REQUEST_HW_INFO);
      const encryptedPacket = encryptData(packet);

      const timeout = setTimeout(() => {
        closePort();
        reject(new Error('Timeout waiting for hardware info response'));
      }, 5000); // 5 second timeout

      function onData(data: Buffer) {
        clearTimeout(timeout);
        try {
          const decryptedResponse = decryptData(data);
          const response = handleHardwareInfoResponse(decryptedResponse);
          if (response) {
            resolve(response);
          } else {
            reject(new Error('Invalid hardware info response'));
          }
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
          closePort();
        }
      }

      port.once('data', onData);

      port.write(encryptedPacket, (err) => {
        if (err) {
          clearTimeout(timeout);
          port.removeListener('data', onData);
          closePort();
          reject(new Error(`Error sending hardware info request: ${err.message}`));
        } else {
          console.log('Hardware info request sent');
        }
      });
    });

    port.on('error', (err) => {
      closePort();
      reject(new Error(`Port error: ${err.message}`));
    });
  });
}
function handleHardwareInfoResponse(response: Buffer): HardwareInfo | null {
  const parsed = parseDataResponse(response);
  if (!parsed) return null;

  const { pktType, data } = parsed;
  if (pktType === DYNO_RECV_MSG_RETURN_HW_INFO) {
    const serialNumber = data.slice(0, 16).toString('utf8').replace(/\0/g, '');
    const ex1Enabled = data.readUInt8(16) !== 0;
    const ex2Enabled = data.readUInt8(17) !== 0;
    return { serialNumber, ex1Enabled, ex2Enabled };
  } else {
    console.log('Unexpected response type:', pktType);
    return null;
  }
}

const DYNO_SEND_MSG_LEVER_POSITION = 0x05;

export function sendLeverPosition(portName: string, position: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    const closePort = () => {
      if (port.isOpen) {
        port.close((err) => {
          if (err) {
            console.error('Error closing port:', err);
          } else {
            console.log('Port closed successfully');
          }
        });
      }
    };

    port.on('open', () => {
      console.log('Port opened:', portName);

      const data = Buffer.alloc(8);
      data.writeUInt8(position, 0);
      const packet = constructPacket(DYNO_SEND_MSG_LEVER_POSITION, data);
      const encryptedPacket = encryptData(packet);

      const timeout = setTimeout(() => {
        closePort();
        reject(new Error('Timeout waiting for lever position response'));
      }, 5000); // 5 second timeout

      function onData(data: Buffer) {
        clearTimeout(timeout);
        try {
          const decryptedResponse = decryptData(data);
          const response = handleLeverPositionResponse(decryptedResponse);
          if (response) {
            resolve(response);
          } else {
            reject(new Error('Invalid lever position response'));
          }
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
          closePort();
        }
      }

      port.once('data', onData);

      port.write(encryptedPacket, (err) => {
        if (err) {
          clearTimeout(timeout);
          port.removeListener('data', onData);
          closePort();
          reject(new Error(`Error sending lever position: ${err.message}`));
        } else {
          console.log('Lever position sent');
        }
      });
    });

    port.on('error', (err) => {
      closePort();
      reject(new Error(`Port error: ${err.message}`));
    });
  });
}

function handleLeverPositionResponse(response: Buffer) {
  const parsed = parseDataResponse(response);
  if (!parsed) return null;

  const { pktType } = parsed;
  if (pktType === DYNO_SEND_MSG_LEVER_POSITION) {
    console.log('Lever position acknowledged');
    return { type: 'ack_lever_position' };
  } else {
    console.log('Unexpected response type:', pktType);
    return null;
  }
}
const DYNO_SEND_MSG_START_RUN = 0x02;
const DYNO_SEND_MSG_END_RUN = 0x03;
const DYNO_RECV_MSG_DATA = 0x05;

// export function startRun(portName: string): Promise<any> {
//   return sendCommand(portName, DYNO_SEND_MSG_START_RUN, 'start run');
// }

// export function endRun(portName: string): Promise<any> {
//   return sendCommand(portName, DYNO_SEND_MSG_END_RUN, 'end run');
// }

function sendCommand(portName: string, commandType: number, commandName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    const closePort = () => {
      if (port.isOpen) {
        port.close((err) => {
          if (err) {
            console.error(`Error closing port: ${err}`);
          } else {
            console.log('Port closed successfully');
          }
        });
      }
    };

    port.on('open', () => {
      console.log('Port opened:', portName);

      const packet = constructPacket(commandType);
      const encryptedPacket = encryptData(packet);

      const timeout = setTimeout(() => {
        closePort();
        reject(new Error(`Timeout waiting for ${commandName} response`));
      }, 5000); // 5 second timeout

      function onData(data: Buffer) {
        clearTimeout(timeout);
        try {
          const decryptedResponse = decryptData(data);
          const response = handleCommandResponse(decryptedResponse, commandType);
          if (response) {
            resolve(response);
          } else {
            reject(new Error(`Invalid ${commandName} response`));
          }
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
          closePort();
        }
      }

      port.once('data', onData);

      port.write(encryptedPacket, (err) => {
        if (err) {
          clearTimeout(timeout);
          port.removeListener('data', onData);
          closePort();
          reject(new Error(`Error sending ${commandName}: ${err.message}`));
        } else {
          console.log(`${commandName} command sent`);
        }
      });
    });

    port.on('error', (err) => {
      closePort();
      reject(new Error(`Port error: ${err.message}`));
    });
  });
}

function handleCommandResponse(response: Buffer, commandType: number) {
  const parsed = parseDataResponse(response);
  if (!parsed) return null;

  const { pktType } = parsed;
  if (pktType === commandType) {
    console.log(`Command acknowledged: ${commandType}`);
    return { type: `ack_${commandType === DYNO_SEND_MSG_START_RUN ? 'start_run' : 'end_run'}` };
  } else {
    console.log('Unexpected response type:', pktType);
    return null;
  }
}

import { app, dialog, ipcMain } from 'electron';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

let csvWriter: any;
let intervalCounter = 0;
let testLogId: string;

// Function to choose save path
export function chooseSavePath(): Promise<string> {
  return dialog.showSaveDialog({
    title: 'Select the file path to save the CSV',
    defaultPath: path.join(app.getPath('documents'), 'test_data.csv'),
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  }).then(result => {
    if (result.canceled || !result.filePath) {
      throw new Error('No file path selected');
    }
    return result.filePath;
  });
}

// Function to initialize CSV writer
function initializeCsvWriter(filePath: string) {
  csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'intervalNumber', title: 'Interval number' },
      { id: 'testLogId', title: 'Test Log ID' },
      { id: 'force', title: 'Force' },
      { id: 'position', title: 'Position' },
      { id: 'velocity', title: 'Velocity' },
      { id: 'timeSinceStart', title: 'Time since start' },
      { id: 'measuredTemp', title: 'Measured Temp' },
      { id: 'measuredPressure', title: 'Measured Pressure' }
    ],
    append: true
  });
}

// Function to generate a unique Test Log ID
function generateTestLogId(): string {
  return `${Date.now()}`;
}

// Function to save data point
async function saveDataPoint(data: any) {
  intervalCounter++;
  await csvWriter.writeRecords([{
    intervalNumber: intervalCounter,
    testLogId: testLogId,
    force: data.force,
    position: data.position,
    velocity: data.velocity,
    timeSinceStart: data.timeSinceStart,
    measuredTemp: data.extra1, // Assuming extra1 is measured temp
    measuredPressure: data.extra2 // Assuming extra2 is measured pressure
  }]);
}

export function startRun(portName: string): Promise<SerialPort> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    port.on('open', () => {
      console.log('Port opened:', portName);

      const packet = constructPacket(DYNO_SEND_MSG_START_RUN);
      const encryptedPacket = encryptData(packet);

      port.write(encryptedPacket, (err) => {
        if (err) {
          port.close();
          reject(new Error(`Error sending start run command: ${err.message}`));
        } else {
          console.log('Start run command sent');
          
          port.on('data', (data: Buffer) => {
            try {
              const decryptedResponse = decryptData(data);
              const response = handleDataResponse(decryptedResponse);
              if (response) {
                console.log('Incoming data:', response);
                // Instead of console.log, insert data into the database
                ipcMain.emit('insert-test-log', null, {
                  Interval: response.timeSinceStart, // Assuming timeSinceStart can be used as Interval
                  Test_ID: Date.now(), // Generate a unique Test_ID
                  Force: response.force,
                  Position: response.position,
                  Velocity: response.velocity,
                  Time_Since_Start: response.timeSinceStart,
                  Ex1: response.extra1,
                  Ex2: response.extra2
                });
              }
            } catch (err) {
              console.error('Error processing incoming data:', err);
            }
          });

          resolve(port);
        }
      });
    });

    port.on('error', (err) => {
      reject(new Error(`Port error: ${err.message}`));
    });
  });
}

export function endRun(port: SerialPort): Promise<void> {
  return new Promise((resolve, reject) => {
    const packet = constructPacket(DYNO_SEND_MSG_END_RUN);
    const encryptedPacket = encryptData(packet);

    port.write(encryptedPacket, (err) => {
      if (err) {
        reject(new Error(`Error sending end run command: ${err.message}`));
      } else {
        console.log('End run command sent');
        
        // Remove all listeners to stop processing incoming data
        port.removeAllListeners('data');

        // Close the port
        port.close((closeErr) => {
          if (closeErr) {
            console.error('Error closing port:', closeErr);
            reject(new Error(`Error closing port: ${closeErr.message}`));
          } else {
            console.log('Port closed successfully');
            resolve();
          }
        });
      }
    });
  });
}

export function checkConnection(portName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const port = new SerialPort({ path: portName, baudRate: 9600 });
  
      const timeout = setTimeout(() => {
        port.close();
        resolve(false);
      }, 2000);
  
      port.on('open', () => {
        clearTimeout(timeout);
        port.close();
        resolve(true);
      });
  
      port.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  function handleDataResponse(response: Buffer) {
    const parsed = parseDataResponse(response);
    if (!parsed) return null;
  
    const { pktType, data } = parsed;
    if (pktType === DYNO_RECV_MSG_DATA) {
      const force = data.readFloatLE(0);
      const position = data.readFloatLE(4);
      const velocity = data.readFloatLE(8);
      const timeSinceStart = data.readUInt32LE(12);
      const extra1 = data.readFloatLE(16);
      const extra2 = data.readFloatLE(20);
  
      return { force, position, velocity, timeSinceStart, extra1, extra2 };
    } else {
      console.log('Unexpected response type:', pktType);
      return null;
    }
  }