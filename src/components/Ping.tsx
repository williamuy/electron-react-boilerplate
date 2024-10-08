import React, { useState } from 'react';
import { HardwareInfo } from '../main/preload';

const SerialCommunicationComponent = () => {
  const [portName, setPortName] = useState('COM3');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState(1);
  const [leverPositionResult, setLeverPositionResult] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);

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

  const handleStartRun = async () => {
    try {
      const response = await window.electron.startRun(portName);
      setRunStatus('Run started successfully');
      setError(null);
      console.log('Start run response:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Start run error:', errorMessage);
      setError(`Start run error: ${errorMessage}`);
      setRunStatus(null);
    }
  };

  const handleEndRun = async () => {
    try {
      const response = await window.electron.endRun(portName);
      setRunStatus('Run ended successfully');
      setError(null);
      console.log('End run response:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('End run error:', errorMessage);
      setError(`End run error: ${errorMessage}`);
      setRunStatus(null);
    }
  };

  return (
    <div>
      <h1>Shock Absorber Testing System</h1>
      
      <div>
        <h2>Communication Settings</h2>
        <input
          type="text"
          value={portName}
          onChange={(e) => setPortName(e.target.value)}
          placeholder="Enter COM port"
        />
      </div>

      <div>
        <h2>System Check</h2>
        <button onClick={handlePing}>Send Ping</button>
        <button onClick={handleRequestHardwareInfo}>Request Hardware Info</button>
        {pingResult && (
          <div>
            <h3>Ping Result</h3>
            <p>{pingResult}</p>
          </div>
        )}
        {hardwareInfo && (
          <div>
            <h3>Hardware Info</h3>
            <p>Serial Number: {hardwareInfo.serialNumber}</p>
            <p>Extra 1 Enabled: {hardwareInfo.ex1Enabled ? 'Yes' : 'No'}</p>
            <p>Extra 2 Enabled: {hardwareInfo.ex2Enabled ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
      
      <div>
        <h2>Lever Position Control</h2>
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          min={1}
          max={255}
          placeholder="Enter position (1-255)"
        />
        <button onClick={handleSetLeverPosition}>Set Lever Position</button>
        {leverPositionResult && (
          <div>
            <h3>Lever Position Result</h3>
            <p>{leverPositionResult}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Run Control</h2>
        <button onClick={handleStartRun}>Start Run</button>
        <button onClick={handleEndRun}>End Run</button>
        {runStatus && <p>Status: {runStatus}</p>}
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SerialCommunicationComponent;