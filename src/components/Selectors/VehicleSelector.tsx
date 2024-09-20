import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const VehicleCard = styled.div`
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

const VehicleSelector: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const result = await window.electron.queryDatabase('SELECT * FROM Vehicles');
      setVehicles(result);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleVehicleSelect = (vehicleId: number) => {
    navigate(`/select-shock-set/${vehicleId}`);
  };

  return (
    <Container>
      <Title>Select Your Vehicle</Title>
      <VehicleGrid>
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.Nickname_ID} onClick={() => handleVehicleSelect(vehicle.Nickname_ID)}>
            <h3>{vehicle.Nickname}</h3>
            <p>{vehicle.Year} {vehicle.Make} {vehicle.Model}</p>
          </VehicleCard>
        ))}
      </VehicleGrid>
    </Container>
  );
};

export default VehicleSelector;