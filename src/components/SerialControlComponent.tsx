import React, { useState } from 'react';

const SerialControlComponent = () => {
  const [portName, setPortName] = useState('COM3');
  const [result, setResult] = useState(null);
  const [leverPosition, setLeverPosition] = useState(1); // default lever position

  const handlePing = async () => {
    try {
      const response = await window.electron.sendPing(portName);
      setResult(response);
    } catch (error) {
      console.error('Ping error:', (error as Error).message);
    }
  };

  const handleRequestHWInfo = async () => {
    try {
      const response = await window.electron.requestHWInfo(portName);
      setResult(response);
    } catch (error) {
      console.error('HW Info error:', (error as Error).message);
    }
  };

  const handleSetLeverPosition = async () => {
    try {
      const response = await window.electron.setLeverPosition(portName, leverPosition);
      setResult(response);
    } catch (error) {
      console.error('Set Lever Position error:', (error as Error).message);
    }
  };

  return (
    <div>
      <h1>Serial Port Control</h1>
      <input
        type="text"
        value={portName}
        onChange={(e) => setPortName(e.target.value)}
        placeholder="Enter COM port"
      />
      <button onClick={handlePing}>Send Ping</button>
      <button onClick={handleRequestHWInfo}>Request HW Info</button>
      <button onClick={handleSetLeverPosition}>Set Lever Position</button>
      <input
        type="number"
        value={leverPosition}
        onChange={(e) => setLeverPosition(Number(e.target.value))}
        min="1"
        max="255"
        placeholder="Enter Lever Position (1-255)"
      />
      {result && <p>Result: {JSON.stringify(result)}</p>}
    </div>
  );
};

export default SerialControlComponent;
