import { SerialPort } from 'serialport';
import crypto from 'crypto';

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
