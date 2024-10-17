import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface TestRecordData {
  User_ID: number;
  Test_ID: number;
  Test_Type: string;
  Vehicle_Type_ID: number;
  Shock_Set_ID: number;
  Shock_ID: string;
  Number_Of_Clicks: number;
  LocationValue: string;
  LocationNumber: number;
  Date: string;
  Speed: number;
  Time_Started: string;
  Time_Ended: string;
  Dyno_Serial_Number: number;
  Recorded_IP_Address: number;
  Barometric_Pressure: number;
  Gas_Pressure: number;
  Strokes: number;
  Stroke_Length: number;
  Test_Log: string;
  Notes: string;
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

const TestRecordViewer: React.FC = () => {
  const [data, setData] = useState<TestRecordData[]>([]);
  const navigate = useNavigate();
  const [newData, setNewData] = useState<TestRecordData>({
    User_ID: 0,
    Test_ID: 0,
    Test_Type: '',
    Vehicle_Type_ID: 0,
    Shock_Set_ID: 0,
    Shock_ID: '',
    Number_Of_Clicks: 0,
    LocationValue: '',
    LocationNumber: 0,
    Date: '',
    Speed: 0,
    Time_Started: '',
    Time_Ended: '',
    Dyno_Serial_Number: 0,
    Recorded_IP_Address: 0,
    Barometric_Pressure: 0,
    Gas_Pressure: 0,
    Strokes: 0,
    Stroke_Length: 0,
    Test_Log: '',
    Notes: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const result = await window.electron.queryTestRecords();
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
      [name]: name === 'Test_Type' || name === 'LocationValue' || name === 'Date' || name === 'Time_Started' || name === 'Time_Ended' || name === 'Test_Log' || name === 'Notes' ? value : parseInt(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await window.electron.updateTestRecord(newData);
        setEditingId(null);
      } else {
        await window.electron.insertTestRecord(newData);
      }
      setNewData({
        User_ID: 0,
        Test_ID: 0,
        Test_Type: '',
        Vehicle_Type_ID: 0,
        Shock_Set_ID: 0,
        Shock_ID: '',
        Number_Of_Clicks: 0,
        LocationValue: '',
        LocationNumber: 0,
        Date: '',
        Speed: 0,
        Time_Started: '',
        Time_Ended: '',
        Dyno_Serial_Number: 0,
        Recorded_IP_Address: 0,
        Barometric_Pressure: 0,
        Gas_Pressure: 0,
        Strokes: 0,
        Stroke_Length: 0,
        Test_Log: '',
        Notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (userId: number, testId: number) => {
    try {
      await window.electron.deleteTestRecord(userId, testId);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleEdit = (row: TestRecordData) => {
    setNewData(row);
    setEditingId(row.Test_ID);
  };

  return (
    <Container>
      <Title>Test Records</Title>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back
      </Button>
      
      <Form onSubmit={handleSubmit}>
        {Object.keys(newData).map((key) => (
          <Input 
            key={key}
            type={key === 'Date' || key === 'Time_Started' || key === 'Time_Ended' ? 'datetime-local' : 'text'}
            name={key}
            value={newData[key as keyof TestRecordData]}
            onChange={handleInputChange}
            placeholder={key}
          />
        ))}
        <Button type="submit">
          {editingId !== null ? 'Update Test Record' : 'Insert Test Record'}
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
            {Object.keys(newData).map((key) => (
              <Th key={key}>{key}</Th>
            ))}
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <Td key={i}>{value}</Td>
              ))}
              <Td>
                <ActionButton onClick={() => handleEdit(row)} style={{ backgroundColor: '#4CAF50' }}>
                  Edit
                </ActionButton>
                <ActionButton onClick={() => handleDelete(row.User_ID, row.Test_ID)} style={{ backgroundColor: '#FF0000' }}>
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

export default TestRecordViewer;