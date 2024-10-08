import React, { useState } from 'react';
import { HardwareInfo } from '../main/preload';

const SerialCommunicationComponent = () => {
  const [portName, setPortName] = useState('COM3');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState(1);
  const [leverPositionResult, setLeverPositionResult] = useState<string | null>(null);

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

  const handleSetLeverPosition = async () => {
    try {
      const response = await window.electron.sendLeverPosition(portName, position);
      setLeverPositionResult(JSON.stringify(response));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Lever position error:', errorMessage);
      setError(`Lever position error: ${errorMessage}`);
      setLeverPositionResult(null);
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
      
      <div>
        <h2>Set Lever Position</h2>
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          min={1}
          max={255}
          placeholder="Enter position (1-255)"
        />
        <button onClick={handleSetLeverPosition}>Set Lever Position</button>
      </div>
      
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

      {leverPositionResult && (
        <div>
          <h2>Lever Position Result</h2>
          <p>{leverPositionResult}</p>
        </div>
      )}
    </div>
  );
};

export default SerialCommunicationComponent;