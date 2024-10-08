import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface VehicleData {
  User_ID: number;
  Vehicle_Type_ID: number;
  Nickname_ID: number;
  Nickname: string;
  Make: string;
  Model: string;
  Year: number;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Roboto', Arial, sans-serif;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const VehicleCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: bold;
  margin-right: 0.75rem;
  margin-top: 1rem;

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 1rem;
  width: 100%;
  font-size: 1rem;
`;

const FormContainer = styled.div`
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const VehicleInfo = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.5rem;
`;

const VehicleManager: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newVehicle, setNewVehicle] = useState<VehicleData>({
    User_ID: 1,
    Vehicle_Type_ID: 0,
    Nickname_ID: 0,
    Nickname: '',
    Make: '',
    Model: '',
    Year: 0,
  });
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.electron.updateData(newVehicle);
      } else {
        const vehicleWithRandomIds = {
          ...newVehicle,
          Nickname_ID: Math.floor(Math.random() * 10000) + 1,
          Vehicle_Type_ID: Math.floor(Math.random() * 10000) + 1,
        };
        await window.electron.insertData(vehicleWithRandomIds);
      }
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleEdit = (vehicle: VehicleData) => {
    setEditingId(vehicle.Nickname_ID);
    setNewVehicle(vehicle);
  };

  const handleDelete = async (id: number) => {
    try {
      await window.electron.deleteData(id);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({
      ...prev,
      [name]: name === 'Year' ? parseInt(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setNewVehicle({
      User_ID: 1,
      Vehicle_Type_ID: 0,
      Nickname_ID: 0,
      Nickname: '',
      Make: '',
      Model: '',
      Year: 0,
    });
  };

  const goToShockSets = (vehicleId: number) => {
    navigate(`/vehicles/${vehicleId}/shock-sets`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container>
      <Button onClick={handleBack} style={{ marginBottom: '1rem' }}>Back to Home</Button>
      <Title>Manage Your Vehicles</Title>

      <FormContainer>
        <FormTitle>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</FormTitle>
        <form onSubmit={handleSave}>
          <Input
            type="text"
            name="Nickname"
            value={newVehicle.Nickname}
            onChange={handleInputChange}
            placeholder="Nickname"
            required
          />
          <Input
            type="text"
            name="Make"
            value={newVehicle.Make}
            onChange={handleInputChange}
            placeholder="Make"
            required
          />
          <Input
            type="text"
            name="Model"
            value={newVehicle.Model}
            onChange={handleInputChange}
            placeholder="Model"
            required
          />
          <Input
            type="number"
            name="Year"
            value={newVehicle.Year}
            onChange={handleInputChange}
            placeholder="Year"
            required
          />
          <Button type="submit">{editingId ? 'Update Vehicle' : 'Add Vehicle'}</Button>
          <Button type="button" onClick={resetForm} style={{ backgroundColor: '#FF5722' }}>
            Cancel
          </Button>
        </form>
      </FormContainer>

      <VehicleGrid>
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.Nickname_ID}>
            <h3>{vehicle.Nickname}</h3>
            <VehicleInfo>{vehicle.Make} {vehicle.Model}</VehicleInfo>
            <VehicleInfo>{vehicle.Year}</VehicleInfo>
            <Button onClick={() => goToShockSets(vehicle.Nickname_ID)}>Manage Shock Sets</Button>
            <Button onClick={() => handleEdit(vehicle)} style={{ backgroundColor: '#2196F3' }}>Edit</Button>
            <Button onClick={() => handleDelete(vehicle.Nickname_ID)} style={{ backgroundColor: '#FF5722' }}>
              Delete
            </Button>
          </VehicleCard>
        ))}
      </VehicleGrid>
    </Container>
  );
};

export default VehicleManager;