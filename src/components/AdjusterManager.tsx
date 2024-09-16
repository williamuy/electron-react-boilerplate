import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface AdjusterData {
  Adjuster_ID: number;
  Shock_ID: number;
  Adjuster_Nickname: string;
  Adjuster_Type: string;
  Adjuster_Max: number;
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

const AdjusterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const AdjusterCard = styled.div`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const AdjusterManager: React.FC = () => {
  const [adjusters, setAdjusters] = useState<AdjusterData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAdjuster, setNewAdjuster] = useState<AdjusterData>({
    Adjuster_ID: 0,
    Shock_ID: 0,
    Adjuster_Nickname: '',
    Adjuster_Type: '',
    Adjuster_Max: 0,
  });

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  useEffect(() => {
    fetchAdjusters();
  }, [newAdjuster.Shock_ID]);

  const fetchAdjusters = async () => {
    try {
      if (newAdjuster.Shock_ID !== 0) {  // Ensure Shock_ID is valid before fetching
        const result = await window.electron.queryAdjusters(newAdjuster.Shock_ID);
        setAdjusters(result);
      }
    } catch (error) {
      console.error('Error fetching adjusters:', error);
    }
  };

  const generateRandomId = () => {
    return Math.floor(Math.random() * 10000) + 1;
  };

  const handleEdit = (adjuster: AdjusterData) => {
    setEditingId(adjuster.Adjuster_ID);
    setNewAdjuster(adjuster);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.electron.updateAdjuster(newAdjuster);
      } else {
        const adjusterWithRandomId = {
          ...newAdjuster,
          Adjuster_ID: generateRandomId(),
        };
        await window.electron.insertAdjuster(adjusterWithRandomId);
      }
      setEditingId(null);
      setNewAdjuster({
        Adjuster_ID: 0,
        Shock_ID: newAdjuster.Shock_ID,  // Ensure Shock_ID is maintained
        Adjuster_Nickname: '',
        Adjuster_Type: '',
        Adjuster_Max: 0,
      });
      fetchAdjusters(); // Fetch the updated list after saving
    } catch (error) {
      console.error('Error saving adjuster:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await window.electron.deleteAdjuster(id);
      fetchAdjusters();
    } catch (error) {
      console.error('Error deleting adjuster:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdjuster((prev) => ({
      ...prev,
      [name]: name === 'Adjuster_Max' || name === 'Shock_ID' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <Container>
      <Title>Your Adjusters</Title>
      <Button onClick={handleBack} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back
      </Button>
      <Button onClick={() => setEditingId(0)}>Add New Adjuster</Button>
      <AdjusterGrid>
        {adjusters.map((adjuster) => (
          <AdjusterCard key={adjuster.Adjuster_ID}>
            <h3>{adjuster.Adjuster_Nickname}</h3>
            <p>Type: {adjuster.Adjuster_Type}</p>
            <p>Max: {adjuster.Adjuster_Max}</p>
            <Button onClick={() => handleEdit(adjuster)}>Edit</Button>
            <Button onClick={() => handleDelete(adjuster.Adjuster_ID)}>Delete</Button>
          </AdjusterCard>
        ))}
      </AdjusterGrid>
      {editingId !== null && (
        <Form onSubmit={handleSave}>
          <Input
            type="number"
            name="Shock_ID"
            value={newAdjuster.Shock_ID}
            onChange={handleInputChange}
            placeholder="Shock ID"
            required
          />
          <Input
            type="text"
            name="Adjuster_Nickname"
            value={newAdjuster.Adjuster_Nickname}
            onChange={handleInputChange}
            placeholder="Adjuster Nickname"
            required
          />
          <Input
            type="text"
            name="Adjuster_Type"
            value={newAdjuster.Adjuster_Type}
            onChange={handleInputChange}
            placeholder="Adjuster Type"
            required
          />
          <Input
            type="number"
            name="Adjuster_Max"
            value={newAdjuster.Adjuster_Max}
            onChange={handleInputChange}
            placeholder="Max Value"
            required
          />
          <Button type="submit">{editingId === 0 ? 'Add Adjuster' : 'Update Adjuster'}</Button>
          <Button type="button" onClick={() => setEditingId(null)}>Cancel</Button>
        </Form>
      )}
    </Container>
  );
};

export default AdjusterManager;
