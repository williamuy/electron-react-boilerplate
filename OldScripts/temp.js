const { SerialPort } = require('serialport');
const crypto = require('crypto');

// Constants
const AES_KEY = Buffer.from('bf8768f5dd65d04b67f188aa3633d6d4', 'hex');
const EOM_SEQUENCE = 0x0A0A0A0A;
const DYNO_SEND_MSG_REQ_START_RUN = 0x02;
const DYNO_SEND_MSG_REQ_END_RUN = 0x03;
const DYNO_RECV_MSG_ACK_START_RUN = 0x02;
const DYNO_RECV_MSG_ACK_END_RUN = 0x03;
const DYNO_RECV_MSG_DATA = 0x05;

// Helper functions (constructPacket, encryptData, decryptData) remain the same

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

function handleResponse(response) {
  const parsed = parseDataResponse(response);
  if (!parsed) return null;

  const { pktType, data } = parsed;
  switch (pktType) {
    case DYNO_RECV_MSG_ACK_START_RUN:
      return { type: 'ack_start_run' };
    case DYNO_RECV_MSG_ACK_END_RUN:
      return { type: 'ack_end_run' };
    case DYNO_RECV_MSG_DATA:
      if (data.length >= 24) {
        return {
          type: 'data',
          force: data.readFloatLE(0),
          position: data.readFloatLE(4),
          velocity: data.readFloatLE(8),
          timeSinceStart: data.readUInt32LE(12),
          extra1: data.readFloatLE(16),
          extra2: data.readFloatLE(20)
        };
      } else {
        console.log('Invalid data packet size');
        return null;
      }
    default:
      console.log('Unexpected response type:', pktType);
      return null;
  }
}

function createPort(portName) {
  return new SerialPort({ path: portName, baudRate: 9600 });
}

function sendRequest(port, pktType) {
  return new Promise((resolve, reject) => {
    const packet = constructPacket(pktType);
    const encryptedPacket = encryptData(packet);

    port.write(encryptedPacket, (err) => {
      if (err) {
        reject(new Error(`Error sending request: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}

async function streamData(port, duration = 10000) {
  console.log('Starting run...');
  await sendRequest(port, DYNO_SEND_MSG_REQ_START_RUN);

  return new Promise((resolve, reject) => {
    const dataPoints = [];
    let timeoutId;

    function onData(data) {
      try {
        const decryptedResponse = decryptData(data);
        const response = handleResponse(decryptedResponse);
        if (response) {
          if (response.type === 'data') {
            console.log('Received data point:', response);
            dataPoints.push(response);
          } else if (response.type === 'ack_end_run') {
            console.log('Run ended');
            cleanup();
            resolve(dataPoints);
          }
        }
      } catch (err) {
        cleanup();
        reject(new Error(`Decryption error: ${err.message}`));
      }
    }

    function cleanup() {
      clearTimeout(timeoutId);
      port.removeListener('data', onData);
    }

    port.on('data', onData);

    timeoutId = setTimeout(async () => {
      console.log('Ending run...');
      try {
        await sendRequest(port, DYNO_SEND_MSG_REQ_END_RUN);
      } catch (error) {
        cleanup();
        reject(new Error(`Error ending run: ${error.message}`));
      }
    }, duration);
  });
}

async function main() {
  const portName = 'COM3';  // Change this to your actual port name
  const port = createPort(portName);

  try {
    await new Promise((resolve) => port.on('open', resolve));
    console.log('Port opened');

    const dataPoints = await streamData(port, 15000);  // Run for 15 seconds
    console.log(`Received ${dataPoints.length} data points`);
    
    // Here you can process or save the data points as needed
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

main();
