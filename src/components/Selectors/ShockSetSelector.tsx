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

const ShockSetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ShockSetCard = styled.div`
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

const ShockSetSelector: React.FC = () => {
  const [shockSets, setShockSets] = useState<any[]>([]);
  const navigate = useNavigate();
  const { vehicleId } = useParams<{ vehicleId: string }>();

  useEffect(() => {
    fetchShockSets();
  }, [vehicleId]);

  const fetchShockSets = async () => {
    try {
      const result = await window.electron.queryDatabase(`SELECT * FROM Shocks_Set WHERE Vehicle_ID = ${vehicleId}`);
      setShockSets(result);
    } catch (error) {
      console.error('Error fetching shock sets:', error);
    }
  };

  const handleShockSetSelect = (shockSetId: number) => {
    navigate(`/select-shock/${shockSetId}`);
  };

  return (
    <Container>
      <Title>Select Shock Set</Title>
      <ShockSetGrid>
        {shockSets.map((shockSet) => (
          <ShockSetCard key={shockSet.Shock_Set_ID} onClick={() => handleShockSetSelect(shockSet.Shock_Set_ID)}>
            <h3>{shockSet.Shock_Set_Nickname}</h3>
          </ShockSetCard>
        ))}
      </ShockSetGrid>
    </Container>
  );
};

export default ShockSetSelector;