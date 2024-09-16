import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Define the Shock Set data structure
interface ShockSetData {
  User_ID: number;
  Vehicle_ID: number;
  Shock_Set_ID: number;
  Shock_Set_Nickname: string;
}

// Styled components for the UI
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

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  background-color: #f2f2f2;
  color: #333;
  font-weight: bold;
  padding: 1rem;
  text-align: left;
`;

const Td = styled.td`
  padding: 1rem;
  border-top: 1px solid #ddd;
`;

const ActionButton = styled(Button)`
  margin-right: 0.5rem;
`;

// Main component for managing Shock Sets
const ShockSetManager: React.FC = () => {
  const [shockSets, setShockSets] = useState<ShockSetData[]>([]);
  const [newShockSet, setNewShockSet] = useState<ShockSetData>({
    User_ID: 0,
    Vehicle_ID: 0,
    Shock_Set_ID: 0, // Initialize Shock Set ID
    Shock_Set_Nickname: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch all Shock Sets from the database
  const fetchData = async () => {
    try {
      const result = await window.electron.queryDatabase('SELECT * FROM Shocks_Set');
      setShockSets(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes for the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShockSet((prev) => ({
      ...prev,
      [name]: name === 'User_ID' || name === 'Vehicle_ID' || name === 'Shock_Set_ID'
        ? parseInt(value) || 0
        : value,
    }));
  };

  // Handle form submission (Insert or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await window.electron.updateShockSet(newShockSet); // Use update for editing
        setEditingId(null);
      } else {
        await window.electron.insertShockSet(newShockSet); // Use insert for new entries
      }
      // Clear the form after submission
      setNewShockSet({
        User_ID: 0,
        Vehicle_ID: 0,
        Shock_Set_ID: 0, // Reset Shock Set ID
        Shock_Set_Nickname: '',
      });
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Handle deletion of a Shock Set
  const handleDelete = async (id: number) => {
    try {
      await window.electron.deleteShockSet(id);
      fetchData(); // Refresh the data after deletion
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  // Handle editing of a Shock Set
  const handleEdit = (shockSet: ShockSetData) => {
    setNewShockSet(shockSet);
    setEditingId(shockSet.Shock_Set_ID);
  };

  // Navigate back to the previous page
  const handleBack = () => {
    navigate(-1); // Navigates back to the previous page
  };

  return (
    <Container>
      <Title>Manage Shock Sets</Title>
      <Button onClick={handleBack} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back
      </Button>

      <Form onSubmit={handleSubmit}>
        <Input
          type="number"
          name="Shock_Set_ID"
          value={newShockSet.Shock_Set_ID}
          onChange={handleInputChange}
          placeholder="Shock Set ID"
          required
        />
        <Input
          type="number"
          name="User_ID"
          value={newShockSet.User_ID}
          onChange={handleInputChange}
          placeholder="User ID"
          required
        />
        <Input
          type="number"
          name="Vehicle_ID"
          value={newShockSet.Vehicle_ID}
          onChange={handleInputChange}
          placeholder="Vehicle ID"
          required
        />
        <Input
          type="text"
          name="Shock_Set_Nickname"
          value={newShockSet.Shock_Set_Nickname}
          onChange={handleInputChange}
          placeholder="Nickname"
          required
        />
        <Button type="submit">
          {editingId !== null ? 'Update Shock Set' : 'Add Shock Set'}
        </Button>
      </Form>

      <Table>
        <thead>
          <tr>
            <Th>Shock Set ID</Th>
            <Th>User ID</Th>
            <Th>Vehicle ID</Th>
            <Th>Nickname</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {shockSets.map((shockSet) => (
            <tr key={shockSet.Shock_Set_ID}>
              <Td>{shockSet.Shock_Set_ID}</Td>
              <Td>{shockSet.User_ID}</Td>
              <Td>{shockSet.Vehicle_ID}</Td>
              <Td>{shockSet.Shock_Set_Nickname}</Td>
              <Td>
                <ActionButton onClick={() => handleEdit(shockSet)} style={{ backgroundColor: '#4CAF50' }}>
                  Edit
                </ActionButton>
                <ActionButton onClick={() => handleDelete(shockSet.Shock_Set_ID)} style={{ backgroundColor: '#FF0000' }}>
                  Delete
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ShockSetManager;
