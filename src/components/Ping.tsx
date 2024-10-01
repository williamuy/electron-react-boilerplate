import React, { useState } from 'react';

const SerialPingComponent = () => {
  const [portName, setPortName] = useState('COM3');
  const [result, setResult] = useState(null);

  const handlePing = async () => {
    try {
      const response = await window.electron.sendPing(portName);
      setResult(response);
    } catch (error) {
      console.error('Ping error:', (error as Error).message);
    }
  };

  return (
    <div>
      <h1>Serial Port Ping</h1>
      <input
        type="text"
        value={portName}
        onChange={(e) => setPortName(e.target.value)}
        placeholder="Enter COM port"
      />
      <button onClick={handlePing}>Send Ping</button>
      {result && <p>Ping Result: {JSON.stringify(result)}</p>}
    </div>
  );
};

export default SerialPingComponent;
