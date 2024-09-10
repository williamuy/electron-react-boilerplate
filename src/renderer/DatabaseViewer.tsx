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

const DatabaseViewer: React.FC = () => {
  const [data, setData] = useState<VehicleData[]>([]);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
  const [newData, setNewData] = useState<VehicleData>({
    User_ID: 0,
    Vehicle_Type_ID: 0,
    Nickname_ID: 0,
    Nickname: '',
    Make: '',
    Model: '',
    Year: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const result = await window.electron.queryDatabase('SELECT * FROM Shocks');
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewData(prev => ({
      ...prev,
      [name]: name === 'Year' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.electron.updateData(newData);
        setEditingId(null);
      } else {
        await window.electron.insertData(newData);
      }
      setNewData({
        User_ID: 0,
        Vehicle_Type_ID: 0,
        Nickname_ID: 0,
        Nickname: '',
        Make: '',
        Model: '',
        Year: 0
      });
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await window.electron.deleteData(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleEdit = (row: VehicleData) => {
    setNewData(row);
    setEditingId(row.Nickname_ID);
  };

  return (
    <Container>
      <Title>Vehicle Database</Title>
      <Button onClick={handleBack} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back
      </Button>
      
      <Form onSubmit={handleSubmit}>
        <Input type="number" name="User_ID" value={newData.User_ID} onChange={handleInputChange} placeholder="User ID" />
        <Input type="number" name="Vehicle_Type_ID" value={newData.Vehicle_Type_ID} onChange={handleInputChange} placeholder="Vehicle Type ID" />
        <Input type="number" name="Nickname_ID" value={newData.Nickname_ID} onChange={handleInputChange} placeholder="Nickname ID" disabled={editingId !== null} />
        <Input type="text" name="Nickname" value={newData.Nickname} onChange={handleInputChange} placeholder="Nickname" />
        <Input type="text" name="Make" value={newData.Make} onChange={handleInputChange} placeholder="Make" />
        <Input type="text" name="Model" value={newData.Model} onChange={handleInputChange} placeholder="Model" />
        <Input type="number" name="Year" value={newData.Year} onChange={handleInputChange} placeholder="Year" />
        <Button type="submit">
  {editingId !== null && editingId !== undefined ? 'Update Vehicle' : 'Insert Vehicle'}
</Button>
{editingId !== null && editingId !== undefined && (
  <Button type="button" onClick={() => setEditingId(null)} style={{ backgroundColor: '#f44336' }}>
    Cancel Edit
  </Button>
)}
      </Form>

      <Button onClick={fetchData} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>Refresh Data</Button>

      <Table>
        <thead>
          <tr>
            <Th>User ID</Th>
            <Th>Vehicle Type ID</Th>
            <Th>Nickname ID</Th>
            <Th>Nickname</Th>
            <Th>Make</Th>
            <Th>Model</Th>
            <Th>Year</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <Td>{row.User_ID}</Td>
              <Td>{row.Vehicle_Type_ID}</Td>
              <Td>{row.Nickname_ID}</Td>
              <Td>{row.Nickname}</Td>
              <Td>{row.Make}</Td>
              <Td>{row.Model}</Td>
              <Td>{row.Year}</Td>
              <Td>
                <ActionButton onClick={() => handleEdit(row)} style={{ backgroundColor: '#4CAF50' }}>
                  Edit
                </ActionButton>
                <ActionButton onClick={() => handleDelete(row.Nickname_ID)} style={{ backgroundColor: '#FF0000' }}>
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

export default DatabaseViewer;