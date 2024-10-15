import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface TestLogData {
  Interval: number;
  Test_ID: number;
  Force: number;
  Position: number;
  Velocity: number;
  Time_Since_Start: number;
  Ex1: number;
  Ex2: number;
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

const TestLogViewer: React.FC = () => {
  const [data, setData] = useState<TestLogData[]>([]);
  const navigate = useNavigate();
  const [newData, setNewData] = useState<TestLogData>({
    Interval: 0,
    Test_ID: 0,
    Force: 0,
    Position: 0,
    Velocity: 0,
    Time_Since_Start: 0,
    Ex1: 0,
    Ex2: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const result = await window.electron.queryTestLogs();
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
      [name]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await window.electron.updateTestLog(newData);
        setEditingId(null);
      } else {
        await window.electron.insertTestLog(newData);
      }
      setNewData({
        Interval: 0,
        Test_ID: 0,
        Force: 0,
        Position: 0,
        Velocity: 0,
        Time_Since_Start: 0,
        Ex1: 0,
        Ex2: 0
      });
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (interval: number, testId: number) => {
    try {
      await window.electron.deleteTestLog(interval, testId);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleEdit = (row: TestLogData) => {
    setNewData(row);
    setEditingId(row.Interval);
  };

  return (
    <Container>
      <Title>Test Logs</Title>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back
      </Button>
      
      <Form onSubmit={handleSubmit}>
        <Input type="number" name="Interval" value={newData.Interval} onChange={handleInputChange} placeholder="Interval" />
        <Input type="number" name="Test_ID" value={newData.Test_ID} onChange={handleInputChange} placeholder="Test ID" />
        <Input type="number" name="Force" value={newData.Force} onChange={handleInputChange} placeholder="Force" />
        <Input type="number" name="Position" value={newData.Position} onChange={handleInputChange} placeholder="Position" />
        <Input type="number" name="Velocity" value={newData.Velocity} onChange={handleInputChange} placeholder="Velocity" />
        <Input type="number" name="Time_Since_Start" value={newData.Time_Since_Start} onChange={handleInputChange} placeholder="Time Since Start" />
        <Input type="number" name="Ex1" value={newData.Ex1} onChange={handleInputChange} placeholder="Ex1" />
        <Input type="number" name="Ex2" value={newData.Ex2} onChange={handleInputChange} placeholder="Ex2" />
        <Button type="submit">
          {editingId !== null ? 'Update Test Log' : 'Insert Test Log'}
        </Button>
        {editingId !== null && (
          <Button type="button" onClick={() => setEditingId(null)} style={{ backgroundColor: '#f44336' }}>
            Cancel Edit
          </Button>
        )}
      </Form>

      <Button onClick={fetchData} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>Refresh Data</Button>

      <Table>
        <thead>
          <tr>
            <Th>Interval</Th>
            <Th>Test ID</Th>
            <Th>Force</Th>
            <Th>Position</Th>
            <Th>Velocity</Th>
            <Th>Time Since Start</Th>
            <Th>Ex1</Th>
            <Th>Ex2</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <Td>{row.Interval}</Td>
              <Td>{row.Test_ID}</Td>
              <Td>{row.Force}</Td>
              <Td>{row.Position}</Td>
              <Td>{row.Velocity}</Td>
              <Td>{row.Time_Since_Start}</Td>
              <Td>{row.Ex1}</Td>
              <Td>{row.Ex2}</Td>
              <Td>
                <ActionButton onClick={() => handleEdit(row)} style={{ backgroundColor: '#4CAF50' }}>
                  Edit
                </ActionButton>
                <ActionButton onClick={() => handleDelete(row.Interval, row.Test_ID)} style={{ backgroundColor: '#FF0000' }}>
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

export default TestLogViewer;