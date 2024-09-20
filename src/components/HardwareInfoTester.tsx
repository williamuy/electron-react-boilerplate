import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
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
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #45a049;
  }
`;

const ResultContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 2rem;
`;

const HardwareInfoTester: React.FC = () => {
  const [hwInfo, setHwInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestHWInfo = async () => {
    try {
      setError(null);
      const result = await window.electron.requestHWInfo();
      setHwInfo(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <Title>Hardware Info Tester</Title>
      <Button onClick={handleRequestHWInfo}>Request Hardware Info</Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {hwInfo && (
        <ResultContainer>
          <h3>Hardware Info:</h3>
          <p><strong>Serial Number:</strong> {hwInfo.serialNumber}</p>
          <p><strong>EX1 Enabled:</strong> {hwInfo.ex1Enabled ? 'Yes' : 'No'}</p>
          <p><strong>EX2 Enabled:</strong> {hwInfo.ex2Enabled ? 'Yes' : 'No'}</p>
        </ResultContainer>
      )}
    </Container>
  );
};

export default HardwareInfoTester;