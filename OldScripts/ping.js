const { SerialPort } = require('serialport');
const crypto = require('crypto');

// Constants
const AES_KEY = Buffer.from('bf8768f5dd65d04b67f188aa3633d6d4', 'hex');
const EOM_SEQUENCE = 0x0A0A0A0A;
const DYNO_SEND_MSG_PING = 0x01;
const DYNO_RECV_MSG_ACK_PING = 0x01;

// Helper function to construct a packet
function constructPacket(pktType, data = Buffer.alloc(0)) {
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

// Function to encrypt data
function encryptData(data) {
  const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data), cipher.final()]);
}

// Function to decrypt data
function decryptData(data) {
  const decipher = crypto.createDecipheriv('aes-128-ecb', AES_KEY, null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

// Function to parse data response
function parseDataResponse(data) {
  console.log('Raw decrypted data:', data);
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

// Function to handle ping response
function handlePingResponse(response) {
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

function createPort(portName) {
  return new SerialPort({ path: portName, baudRate: 9600 });
}

function sendPing(port) {
  return new Promise((resolve, reject) => {
    const packet = constructPacket(DYNO_SEND_MSG_PING);
    const encryptedPacket = encryptData(packet);

    const timeout = setTimeout(() => {
      reject(new Error('Timeout waiting for ping response'));
    }, 5000); // 5 second timeout

    function onData(data) {
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
        reject(new Error(`Decryption error: ${err.message}`));
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
}

async function main() {
  const portName = 'COM3';  // Change this to your actual port name
  const port = createPort(portName);

  try {
    await new Promise((resolve) => port.on('open', resolve));
    console.log('Port opened');

    console.log('Sending ping...');
    const result = await sendPing(port);
    console.log('Ping result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    port.close((err) => {
      if (err) {
        console.error('Error closing port:', err.message);
      } else {
        console.log('Port closed');
      }
    });
  }
}

main();
