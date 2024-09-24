const { SerialPort } = require('serialport');
const crypto = require('crypto');

// Constants
const AES_KEY = Buffer.from('bf8768f5dd65d04b67f188aa3633d6d4', 'hex');
const EOM_SEQUENCE = 0x0A0A0A0A;
const DYNO_SEND_MSG_ZERO_LOAD_CELL = 0x0A;
const DYNO_RECV_MSG_READY = 0x04;

// Helper function to construct a packet
function constructPacket(pktType, data = Buffer.alloc(0)) {
  let fullLen = Math.max(data.length, 8) + 8;
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
  console.log('Raw decrypted data:', data.toString('hex'));
  if (data.length < 16) {
    console.log('Invalid data packet length');
    return null;
  }

  const pktLen = data.readUInt16LE(0);
  const pktType = data.readUInt16LE(2);
  const pktEom = data.readUInt32LE(pktLen - 4);

  console.log(`Packet Length: ${pktLen}, Packet Type: ${pktType}, EOM: ${pktEom.toString(16)}`);

  if (pktEom !== EOM_SEQUENCE) {
    console.log('EOM sequence not matching... Skipping');
    return null;
  }

  return { pktLen, pktType, data: data.slice(4, pktLen - 4) };
}

// Function to handle response
function handleResponse(response) {
  const parsed = parseDataResponse(response);
  if (!parsed) return null;

  const { pktType } = parsed;
  switch (pktType) {
    case DYNO_RECV_MSG_READY:
      console.log('Device ready, load cell zeroed successfully');
      return { type: 'ready' };
    default:
      console.log('Unexpected response type:', pktType);
      return null;
  }
}

function createPort(portName) {
  return new SerialPort({ path: portName, baudRate: 9600 });
}

function requestZeroLoadCell(port) {
  return new Promise((resolve, reject) => {
    const packet = constructPacket(DYNO_SEND_MSG_ZERO_LOAD_CELL);
    const encryptedPacket = encryptData(packet);

    console.log('Sending encrypted packet:', encryptedPacket.toString('hex'));

    const timeout = setTimeout(() => {
      reject(new Error('Timeout waiting for zero load cell response'));
    }, 3000); // Increased to 10 seconds

    function onData(data) {
      console.log('Raw data received:', data.toString('hex'));
      clearTimeout(timeout);
      try {
        const decryptedResponse = decryptData(data);
        const response = handleResponse(decryptedResponse);
        if (response) {
          resolve(response);
        } else {
          reject(new Error('Invalid zero load cell response'));
        }
      } catch (err) {
        reject(new Error(`Decryption error: ${err.message}`));
      }
    }

    port.on('data', onData);

    port.write(encryptedPacket, (err) => {
      if (err) {
        clearTimeout(timeout);
        port.removeListener('data', onData);
        reject(new Error(`Error sending zero load cell request: ${err.message}`));
      } else {
        console.log('Zero load cell request sent');
        port.drain(() => {
          console.log('Buffer flushed');
        });
      }
    });
  });
}

async function main() {
  const portName = 'COM3';  // Change this to your actual port name
  const port = createPort(portName);

  try {
    await new Promise((resolve, reject) => {
      port.on('open', resolve);
      port.on('error', reject);
    });
    console.log('Port opened');

    console.log('Requesting to zero load cell...');
    const result = await requestZeroLoadCell(port);
    console.log('Zero load cell result:', result);
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
