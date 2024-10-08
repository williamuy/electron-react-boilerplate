import React, { useState } from 'react';
import { HardwareInfo } from '../main/preload';

const SerialCommunicationComponent = () => {
  const [portName, setPortName] = useState('COM3');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePing = async () => {
    try {
      const response = await window.electron.sendPing(portName);
      setPingResult(JSON.stringify(response));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Ping error:', errorMessage);
      setError(`Ping error: ${errorMessage}`);
      setPingResult(null);
    }
  };

  const handleRequestHardwareInfo = async () => {
    try {
      const response = await window.electron.requestHardwareInfo(portName);
      setHardwareInfo(response);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Hardware info request error:', errorMessage);
      setError(`Hardware info request error: ${errorMessage}`);
      setHardwareInfo(null);
    }
  };

  return (
    <div>
      <h1>Serial Communication</h1>
      <input
        type="text"
        value={portName}
        onChange={(e) => setPortName(e.target.value)}
        placeholder="Enter COM port"
      />
      <button onClick={handlePing}>Send Ping</button>
      <button onClick={handleRequestHardwareInfo}>Request Hardware Info</button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {pingResult && (
        <div>
          <h2>Ping Result</h2>
          <p>{pingResult}</p>
        </div>
      )}
      
      {hardwareInfo && (
        <div>
          <h2>Hardware Info</h2>
          <p>Serial Number: {hardwareInfo.serialNumber}</p>
          <p>Extra 1 Enabled: {hardwareInfo.ex1Enabled ? 'Yes' : 'No'}</p>
          <p>Extra 2 Enabled: {hardwareInfo.ex2Enabled ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default SerialCommunicationComponent;