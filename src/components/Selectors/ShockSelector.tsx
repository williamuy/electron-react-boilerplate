import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const ShockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ShockCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ShockSelector: React.FC = () => {
  const [shocks, setShocks] = useState<any[]>([]);
  const navigate = useNavigate();
  const { shockSetId } = useParams<{ shockSetId: string }>();

  useEffect(() => {
    fetchShocks();
  }, [shockSetId]);

  const fetchShocks = async () => {
    try {
      const result = await window.electron.queryDatabase(`SELECT * FROM Shocks WHERE Shock_Set_ID = ${shockSetId}`);
      setShocks(result);
    } catch (error) {
      console.error('Error fetching shocks:', error);
    }
  };

  const handleShockSelect = (shockId: number) => {
    navigate(`/initiate-test/${shockId}`);
  };

  return (
    <Container>
      <Title>Select Shock</Title>
      <ShockGrid>
        {shocks.map((shock) => (
          <ShockCard key={shock.Shock_ID} onClick={() => handleShockSelect(shock.Shock_ID)}>
            <h3>{shock.Shock_Name}</h3>
            <p>{shock.Shock_Location}</p>
          </ShockCard>
        ))}
      </ShockGrid>
    </Container>
  );
};

export default ShockSelector;