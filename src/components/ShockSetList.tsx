import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Define the Shock Set data structure
interface ShockSetData {
  Shock_Set_ID: number;
  User_ID: number;
  Vehicle_ID: number;
  Shock_Set_Nickname: string;
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

const ActionButton = styled(Button)`
  margin-right: 0.5rem;
`;

// Main component for viewing and selecting Shock Sets
const ShockSetList: React.FC = () => {
  const [shockSets, setShockSets] = useState<ShockSetData[]>([]);
  const navigate = useNavigate();

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

  // Navigate to ShockManager with the selected Shock Set ID
  const handleManageShocks = (shockSetId: number) => {
    navigate(`/shocks/${shockSetId}`);
  };

  // Navigate to ShockSetManager to edit the Shock Set
  const handleEditShockSet = (shockSetId: number) => {
    navigate(`/shock-sets/${shockSetId}`);
  };

  return (
    <Container>
      <Title>Shock Sets</Title>
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
                <ActionButton onClick={() => handleEditShockSet(shockSet.Shock_Set_ID)}>
                  Edit Shock Set
                </ActionButton>
                <ActionButton onClick={() => handleManageShocks(shockSet.Shock_Set_ID)}>
                  Manage Shocks
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ShockSetList;
