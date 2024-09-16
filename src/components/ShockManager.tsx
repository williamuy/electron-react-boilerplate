import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';

// Define the Shock data structure
interface ShockData {
  Shock_ID: number;
  Shock_Set_ID: number;
  Shock_Brand: string;
  Shock_Name: string;
  Shock_Location: string;
  isAdjustable: boolean;
  Adjuster_Amount: number;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const ShockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const ShockCard = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 0.5rem;

  &:hover {
    background-color: #45a049;
  }
`;

const ShockManager: React.FC = () => {
  const [shocks, setShocks] = useState<ShockData[]>([]);
  const { vehicleId } = useParams<{ vehicleId: string }>(); // Get vehicleId from route params
  const navigate = useNavigate();

  useEffect(() => {
    fetchShocks();
  }, [vehicleId]);

  const fetchShocks = async () => {
    try {
      const result = await window.electron.queryShocks(parseInt(vehicleId || '0')); // Fetch shocks for the vehicle
      setShocks(result);
    } catch (error) {
      console.error('Error fetching shocks:', error);
    }
  };

  const handleBack = () => {
    navigate('/vehicles'); // Navigate back to the vehicle list
  };

  return (
    <Container>
      <Title>Manage Shocks for Vehicle ID {vehicleId}</Title>
      <Button onClick={handleBack} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back to Vehicles
      </Button>

      <ShockGrid>
        {shocks.map((shock) => (
          <ShockCard key={shock.Shock_ID}>
            <h3>{shock.Shock_Name}</h3>
            <p>Brand: {shock.Shock_Brand}</p>
            <p>Location: {shock.Shock_Location}</p>
            <p>Adjustable: {shock.isAdjustable ? 'Yes' : 'No'}</p>
            <p>Adjuster Amount: {shock.Adjuster_Amount}</p>
          </ShockCard>
        ))}
      </ShockGrid>
    </Container>
  );
};

export default ShockManager;
