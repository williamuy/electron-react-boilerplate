import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

interface ShockSetData {
  User_ID: number;
  Vehicle_ID: number;
  Shock_Set_ID: number;
  Shock_Set_Nickname: string;
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

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
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

const FormContainer = styled(Card)`
  margin-bottom: 2rem;
`;

const FormTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const ShockSetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ShockSetCard = styled(Card)`
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ShockSetInfo = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
`;

const ShockSetManager: React.FC = () => {
  const [shockSets, setShockSets] = useState<ShockSetData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newShockSet, setNewShockSet] = useState<ShockSetData>({
    User_ID: 1,
    Vehicle_ID: 0,
    Shock_Set_ID: 0,
    Shock_Set_Nickname: '',
  });
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.electron.updateShockSet(newShockSet);
      } else {
        const shockSetWithId = {
          ...newShockSet,
          Shock_Set_ID: Math.floor(Math.random() * 10000) + 1,
          Vehicle_ID: parseInt(vehicleId || '0'),
        };
        await window.electron.insertShockSet(shockSetWithId);
      }
      resetForm();
      fetchShockSets();
    } catch (error) {
      console.error('Error saving shock set:', error);
    }
  };

  const handleEdit = (shockSet: ShockSetData) => {
    setEditingId(shockSet.Shock_Set_ID);
    setNewShockSet(shockSet);
  };

  const handleDelete = async (id: number) => {
    try {
      await window.electron.deleteShockSet(id);
      fetchShockSets();
    } catch (error) {
      console.error('Error deleting shock set:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShockSet((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setNewShockSet({
      User_ID: 1,
      Vehicle_ID: 0,
      Shock_Set_ID: 0,
      Shock_Set_Nickname: '',
    });
  };

  const goToShocks = (shockSetId: number) => {
    navigate(`/shock-sets/${shockSetId}/shocks`);
  };

  const handleBack = () => {
    navigate('/vehicles');
  };

  return (
    <Container>
      <Button onClick={handleBack} style={{ marginBottom: '1rem' }}>Back to Vehicles</Button>
      <Title>Manage Shock Sets for Vehicle {vehicleId}</Title>

      <FormContainer>
        <FormTitle>{editingId ? 'Edit Shock Set' : 'Add New Shock Set'}</FormTitle>
        <form onSubmit={handleSave}>
          <Input
            type="text"
            name="Shock_Set_Nickname"
            value={newShockSet.Shock_Set_Nickname}
            onChange={handleInputChange}
            placeholder="Shock Set Nickname"
            required
          />
          <Button type="submit">{editingId ? 'Update Shock Set' : 'Add Shock Set'}</Button>
          <Button type="button" onClick={resetForm} style={{ backgroundColor: '#FF5722' }}>
            Cancel
          </Button>
        </form>
      </FormContainer>

      <ShockSetGrid>
        {shockSets.map((shockSet) => (
          <ShockSetCard key={shockSet.Shock_Set_ID}>
            <ShockSetInfo><strong>ID:</strong> {shockSet.Shock_Set_ID}</ShockSetInfo>
            <ShockSetInfo><strong>Nickname:</strong> {shockSet.Shock_Set_Nickname}</ShockSetInfo>
            <ButtonGroup>
              <Button onClick={() => goToShocks(shockSet.Shock_Set_ID)}>View Shocks</Button>
              <Button onClick={() => handleEdit(shockSet)} style={{ backgroundColor: '#2196F3' }}>Edit</Button>
              <Button onClick={() => handleDelete(shockSet.Shock_Set_ID)} style={{ backgroundColor: '#FF5722' }}>
                Delete
              </Button>
            </ButtonGroup>
          </ShockSetCard>
        ))}
      </ShockSetGrid>
    </Container>
  );
};

export default ShockSetManager;