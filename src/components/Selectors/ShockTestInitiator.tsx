import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

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

const ShockDetails = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const AdjusterList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const AdjusterItem = styled.li`
  margin-bottom: 1rem;
`;

const StartTestButton = styled.button`
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

const ShockTestInitiator: React.FC = () => {
  const [shock, setShock] = useState<any>(null);
  const [adjusters, setAdjusters] = useState<any[]>([]);
  const { shockId } = useParams<{ shockId: string }>();

  useEffect(() => {
    fetchShockDetails();
    fetchAdjusters();
  }, [shockId]);

  const fetchShockDetails = async () => {
    try {
      const result = await window.electron.queryDatabase(`SELECT * FROM Shocks WHERE Shock_ID = ${shockId}`);
      setShock(result[0]);
    } catch (error) {
      console.error('Error fetching shock details:', error);
    }
  };

  const fetchAdjusters = async () => {
    try {
      const result = await window.electron.queryDatabase(`SELECT * FROM Adjusters WHERE Shock_ID = ${shockId}`);
      setAdjusters(result);
    } catch (error) {
      console.error('Error fetching adjusters:', error);
    }
  };

  const handleStartTest = () => {
    // Implement the logic to start the shock test
    console.log('Starting shock test for shock ID:', shockId);
  };

  if (!shock) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Title>{shock.Shock_Name}</Title>
      <ShockDetails>
        <h3>Shock Details</h3>
        <p><strong>Brand:</strong> {shock.Shock_Brand}</p>
        <p><strong>Location:</strong> {shock.Shock_Location}</p>
        <h3>Adjusters</h3>
        <AdjusterList>
          {adjusters.map((adjuster) => (
            <AdjusterItem key={adjuster.Adjuster_ID}>
              <strong>{adjuster.Adjuster_Nickname}:</strong> {adjuster.Adjuster_Type} (0-{adjuster.Adjuster_Max})
            </AdjusterItem>
          ))}
        </AdjusterList>
      </ShockDetails>
      <StartTestButton onClick={handleStartTest}>Start Shock Test</StartTestButton>
    </Container>
  );
};

export default ShockTestInitiator;