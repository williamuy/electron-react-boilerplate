import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { HardwareInfo } from '../main/preload';

const SerialCommunicationComponent = () => {
  const [portName, setPortName] = useState('COM3');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState(1);
  const [leverPositionResult, setLeverPositionResult] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const navigate = useNavigate(); // Use navigate hook

  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!isRunning) {
        try {
          const connected = await window.electron.checkConnection(portName);
          setIsConnected(connected);
        } catch (err) {
          console.error('Connection check error:', err);
          setIsConnected(false);
        }
      }
    };

    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [portName, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer]);

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
      const port = await window.electron.startRun(portName);
      setRunStatus('Run started');
      setIsRunning(true);
      setIsConnected(true);
      setTimer(0);
      setError(null);
      console.log('Start run response:', port);
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
      setRunStatus(`Run ended. Total duration: ${timer} seconds`);
      setIsRunning(false);
      setError(null);
      console.log('End run response:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('End run error:', errorMessage);
      setError(`End run error: ${errorMessage}`);
    } finally {
      setIsConnected(false); // Reset connection status after run ends
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    navigate('/'); // Navigate back to the home page or previous route
  };

  return (
    <div>
      <button onClick={handleBack} style={{ marginBottom: '1rem' }}>Back</button> {/* Back Button */}
      <h1>Shock Absorber Testing System</h1>

      <div>
        <h2>Communication Settings</h2>
        <input
          type="text"
          value={portName}
          onChange={(e) => setPortName(e.target.value)}
          placeholder="Enter COM port"
        />
        <div style={{ marginTop: '10px' }}>
          Connection Status:
          <span style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
            {isConnected ? ' Connected' : ' Disconnected'}
          </span>
        </div>
      </div>

      <div>
        <h2>System Check</h2>
        <button onClick={handlePing} disabled={!isConnected || isRunning}>Send Ping</button>
        <button onClick={handleRequestHardwareInfo} disabled={!isConnected || isRunning}>Request Hardware Info</button>
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
        <button onClick={handleSetLeverPosition} disabled={!isConnected || isRunning}>Set Lever Position</button>
        {leverPositionResult && (
          <div>
            <h3>Lever Position Result</h3>
            <p>{leverPositionResult}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Run Control</h2>
        <button onClick={handleStartRun} disabled={isRunning || !isConnected}>Start Run</button>
        <button onClick={handleEndRun} disabled={!isRunning}>End Run</button>
        {runStatus && <p>Status: {runStatus}</p>}
        <p>Timer: {formatTime(timer)}</p>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SerialCommunicationComponent;
