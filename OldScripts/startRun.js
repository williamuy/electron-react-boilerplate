const { SerialPort } = require('serialport');
const crypto = require('crypto');

// Constants
const AES_KEY = Buffer.from('bf8768f5dd65d04b67f188aa3633d6d4', 'hex');
const EOM_SEQUENCE = 0x0A0A0A0A;
const DYNO_SEND_MSG_REQ_START_RUN = 0x02;
const DYNO_RECV_MSG_ACK_START_RUN = 0x02; // Assuming the device acknowledges with the same type

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

// Function to handle response
function handleResponse(response) {
  const parsed = parseDataResponse(response);
  if (!parsed) return null;

  const { pktType, data } = parsed;
  
  switch (pktType) {
    case 0x05: // Data packet
      const force = data.readFloatLE(0);
      const position = data.readFloatLE(4);
      const velocity = data.readFloatLE(8);
      const timestamp = data.readUInt32LE(12);
      const extra1 = data.readFloatLE(16);
      const extra2 = data.readFloatLE(20);

      console.log(`Force: ${force}, Position: ${position}, Velocity: ${velocity}, Timestamp: ${timestamp}, Extra1: ${extra1}, Extra2: ${extra2}`);
      break;

    case DYNO_RECV_MSG_ACK_START_RUN:
      console.log('Start run request acknowledged');
      break;

    default:
      console.log('Unexpected response type:', pktType);
      break;
  }
}

function createPort(portName) {
  return new SerialPort({ path: portName, baudRate: 9600 });
}

// Function to send the start run request
function requestStartRun(port) {
  return new Promise((resolve, reject) => {
    const packet = constructPacket(DYNO_SEND_MSG_REQ_START_RUN);
    const encryptedPacket = encryptData(packet);

    port.write(encryptedPacket, (err) => {
      if (err) {
        reject(new Error(`Error sending start run request: ${err.message}`));
      } else {
        console.log('Start run request sent');
        resolve();
      }
    });
  });
}

// Function to start streaming data from the MCU
function startDataStream(port) {
  port.on('data', (data) => {
    try {
      const decryptedResponse = decryptData(data);
      handleResponse(decryptedResponse);
    } catch (err) {
      console.error(`Error handling response: ${err.message}`);
    }
  });
}

async function main() {
  const portName = 'COM3';  // Change this to your actual port name

  const port = createPort(portName);

  try {
    await new Promise((resolve) => port.on('open', resolve));
    console.log('Port opened');

    console.log('Requesting start of run...');
    await requestStartRun(port);

    console.log('Streaming data...');
    startDataStream(port);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
