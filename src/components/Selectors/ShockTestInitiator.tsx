import React, { useState } from 'react';
import styled from 'styled-components';
import { HardwareInfo } from '../../main/preload'; // Import the HardwareInfo type

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const HWInfoDisplay = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f4f4f4;
  border-radius: 8px;
  font-family: Arial, sans-serif;
`;

const ShockTestInitiator: React.FC = () => {
  const [hwInfo, setHWInfo] = useState<HardwareInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTest = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electron.startShockTest('COM3');  // Adjust portName as needed
      setHWInfo(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>Shock Test Initiator</h2>
      <Button onClick={handleStartTest} disabled={loading}>
        {loading ? 'Requesting...' : 'Start Shock Test'}
      </Button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {hwInfo && (
        <HWInfoDisplay>
          <h3>Hardware Info:</h3>
          <p><strong>Serial Number:</strong> {hwInfo.serialNumber}</p>
          <p><strong>EX1 Enabled:</strong> {hwInfo.ex1Enabled ? 'Yes' : 'No'}</p>
          <p><strong>EX2 Enabled:</strong> {hwInfo.ex2Enabled ? 'Yes' : 'No'}</p>
        </HWInfoDisplay>
      )}
    </Container>
  );
};

export default ShockTestInitiator;
