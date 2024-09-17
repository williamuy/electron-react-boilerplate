import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

// Define the Adjuster data structure
interface AdjusterData {
  Adjuster_ID: number;
  Shock_ID: number;
  Adjuster_Nickname: string;
  Adjuster_Type: string;
  Adjuster_Max: number;
}

// Styled components
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

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
  width: 100%;
`;

const FormModal = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  max-width: 400px;
  margin: 0 auto;
`;

// Main Adjuster Manager Component
const AdjusterManager: React.FC = () => {
  const [adjusters, setAdjusters] = useState<AdjusterData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAdjuster, setNewAdjuster] = useState<Partial<AdjusterData>>({
    Adjuster_Nickname: '',
    Adjuster_Type: '',
    Adjuster_Max: 0,
  });
  const [showForm, setShowForm] = useState(false);

  // Get both vehicleId and shockId from URL parameters
  const { shockId, vehicleId } = useParams<{ shockId: string, vehicleId: string }>();  
  const navigate = useNavigate();

  useEffect(() => {
    if (shockId) fetchAdjusters();
  }, [shockId]);

  const fetchAdjusters = async () => {
    try {
      const result = await window.electron.queryAdjusters(parseInt(shockId || '0'));  // Fetch adjusters for the shock
      setAdjusters(result);
    } catch (error) {
      console.error('Error fetching adjusters:', error);
    }
  };

  const handleEdit = (adjuster: AdjusterData) => {
    setEditingId(adjuster.Adjuster_ID);  // Set the ID of the adjuster being edited
    setNewAdjuster(adjuster);  // Populate the form with the selected adjuster's data
    setShowForm(true);  // Show the form for editing
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {  // If editing an existing adjuster
        await window.electron.updateAdjuster({
          ...newAdjuster,
          Adjuster_ID: editingId,
          Shock_ID: parseInt(shockId || '0'),
        });
      } else {  // If adding a new adjuster
        const adjusterWithRandomId = {
          ...newAdjuster,
          Adjuster_ID: Math.floor(Math.random() * 10000),  // Assign a random Adjuster ID for new adjusters
          Shock_ID: parseInt(shockId || '0'),  // Link the adjuster to the selected shock
        };
        await window.electron.insertAdjuster(adjusterWithRandomId);
      }
      setEditingId(null);  // Reset the editing ID
      setNewAdjuster({  // Reset the form state
        Adjuster_Nickname: '',
        Adjuster_Type: '',
        Adjuster_Max: 0,
      });
      setShowForm(false);  // Hide the form
      fetchAdjusters();  // Refresh the adjusters list
    } catch (error) {
      console.error('Error saving adjuster:', error);
    }
  };

  const handleDelete = async (adjusterId: number) => {
    try {
      await window.electron.deleteAdjuster(adjusterId);  // Delete the adjuster
      fetchAdjusters();  // Refresh the adjusters list after deletion
    } catch (error) {
      console.error('Error deleting adjuster:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdjuster((prev) => ({
      ...prev,
      [name]: name === 'Adjuster_Max' ? parseInt(value) || 0 : value,  // Update the form state based on input changes
    }));
  };

  // Ensure vehicleId and shockId are passed when navigating back
  const handleBackToShocks = () => {
    navigate(`/vehicles/${vehicleId}/shocks`);  // Navigate back to shocks for the correct vehicleId
  };

  return (
    <Container>
      <Title>Manage Adjusters for Shock ID {shockId}</Title>
      <Button onClick={handleBackToShocks} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back to Shocks
      </Button>
      <Button onClick={() => setShowForm(true)}>Add New Adjuster</Button>

      <AdjusterGrid>
        {adjusters.map((adjuster) => (
          <AdjusterCard key={adjuster.Adjuster_ID || Math.random()}>
            <h3>{adjuster.Adjuster_Nickname}</h3>
            <p>Type: {adjuster.Adjuster_Type}</p>
            <p>Max: {adjuster.Adjuster_Max}</p>
            <Button onClick={() => handleEdit(adjuster)}>Edit</Button>
            <Button onClick={() => handleDelete(adjuster.Adjuster_ID)} style={{ backgroundColor: '#FF0000' }}>
              Delete
            </Button>
          </AdjusterCard>
        ))}
      </AdjusterGrid>

      {showForm && (
        <FormModal>
          <h3>{editingId ? 'Edit Adjuster' : 'Add New Adjuster'}</h3>
          <form onSubmit={handleSave}>
            <Input
              type="text"
              name="Adjuster_Nickname"
              value={newAdjuster.Adjuster_Nickname || ''}
              onChange={handleInputChange}
              placeholder="Adjuster Nickname"
              required
            />
            <Input
              type="text"
              name="Adjuster_Type"
              value={newAdjuster.Adjuster_Type || ''}
              onChange={handleInputChange}
              placeholder="Adjuster Type"
              required
            />
            <Input
              type="number"
              name="Adjuster_Max"
              value={newAdjuster.Adjuster_Max || 0}
              onChange={handleInputChange}
              placeholder="Max Value"
              required
            />
            <Button type="submit">{editingId ? 'Update Adjuster' : 'Add Adjuster'}</Button>
            <Button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#FF0000' }}>
              Cancel
            </Button>
          </form>
        </FormModal>
      )}
    </Container>
  );
};

export default AdjusterManager;
