import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Define the Vehicle data structure
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
  font-family: Arial, sans-serif;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const VehicleCard = styled.div`
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

const FormModal = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  max-width: 400px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
  width: 100%;
`;

// VehicleManager Component
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
  const [showForm, setShowForm] = useState(false);  // State to control modal visibility
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

  const generateRandomId = () => {
    return Math.floor(Math.random() * 10000) + 1;
  };

  const handleEdit = (vehicle: VehicleData) => {
    setEditingId(vehicle.Nickname_ID);
    setNewVehicle(vehicle);
    setShowForm(true);  // Show form when editing
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.electron.updateData(newVehicle);
      } else {
        const vehicleWithRandomIds = {
          ...newVehicle,
          Nickname_ID: generateRandomId(),
          Vehicle_Type_ID: generateRandomId(),
        };
        await window.electron.insertData(vehicleWithRandomIds);
      }
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
      setShowForm(false);  // Close form after saving
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
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

  const handleBack = () => {
    navigate(-1); // Navigates back to the previous page
  };

  return (
    <Container>
      <Title>Your Vehicles</Title>
      <Button onClick={handleBack} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back
      </Button>
      <Button onClick={() => setShowForm(true)}>Add New Vehicle</Button>
      
      <VehicleGrid>
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.Nickname_ID}>
            <h3>{vehicle.Nickname}</h3>
            <p>{vehicle.Make} {vehicle.Model} ({vehicle.Year})</p>
            <Button onClick={() => handleEdit(vehicle)}>Edit</Button>
            <Button onClick={() => handleDelete(vehicle.Nickname_ID)} style={{ backgroundColor: '#FF0000' }}>
              Delete
            </Button>
          </VehicleCard>
        ))}
      </VehicleGrid>

      {showForm && (
        <FormModal>
          <h3>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
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
            <Button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#FF0000' }}>Cancel</Button>
          </form>
        </FormModal>
      )}
    </Container>
  );
};

export default VehicleManager;
