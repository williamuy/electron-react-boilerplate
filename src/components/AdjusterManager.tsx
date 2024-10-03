import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

interface AdjusterData {
  Adjuster_ID: number;
  Shock_ID: number;
  Adjuster_Nickname: string; // Corresponds to the predefined adjuster types
  Adjuster_Type: string; // Corresponds to Clicks, Turns, Percentage
  Adjuster_Max: number;
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

const AdjusterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const AdjusterCard = styled.div`
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 1rem;
  width: 100%;
  font-size: 1rem;
`;

const FormModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const AdjusterInfo = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const AdjusterManager: React.FC = () => {
  const [adjusters, setAdjusters] = useState<AdjusterData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAdjuster, setNewAdjuster] = useState<Partial<AdjusterData>>({
    Adjuster_Nickname: '',
    Adjuster_Type: '',
    Adjuster_Max: 1, // Initialize with a positive default value
  });
  const [showForm, setShowForm] = useState(false);

  const { shockId } = useParams<{ shockId: string }>();
  const navigate = useNavigate();

  // Predefined lists
  const adjusterTypes = [
    'Compression',
    'Rebound',
    'High Speed Compression',
    'High Speed Rebound',
    'Low Speed Compression',
    'Low Speed Rebound',
    'Bypass',
    'Compression Bypass',
    'Rebound Bypass',
  ];

  const adjusterMethods = ['Clicks', 'Turns', 'Percentage'];

  useEffect(() => {
    fetchAdjusters();
  }, [shockId]);

  const fetchAdjusters = async () => {
    try {
      const result = await window.electron.queryAdjusters(parseInt(shockId || '0'));
      console.log("Fetched Adjusters:", result); // Ensure Adjuster_Type is fetched
      setAdjusters(result);
    } catch (error) {
      console.error('Error fetching adjusters:', error);
    }
  };

  const handleEdit = (adjuster: AdjusterData) => {
    setEditingId(adjuster.Adjuster_ID);
    setNewAdjuster(adjuster);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure Adjuster_Max is positive and not zero
      if (newAdjuster.Adjuster_Max && newAdjuster.Adjuster_Max > 0 && newAdjuster.Adjuster_Max <= 100) {
        if (editingId) {
          await window.electron.updateAdjuster({
            ...newAdjuster,
            Adjuster_ID: editingId,
            Shock_ID: parseInt(shockId || '0'),
          });
        } else {
          const adjusterWithRandomId = {
            ...newAdjuster,
            Adjuster_ID: Math.floor(Math.random() * 10000),
            Shock_ID: parseInt(shockId || '0'),
          };
          await window.electron.insertAdjuster(adjusterWithRandomId);
        }
        resetForm();
        fetchAdjusters();
      } else {
        alert("Max value must be between 1 and 100.");
      }
    } catch (error) {
      console.error('Error saving adjuster:', error);
    }
  };

  const handleDelete = async (adjusterId: number) => {
    try {
      await window.electron.deleteAdjuster(adjusterId);
      fetchAdjusters();
    } catch (error) {
      console.error('Error deleting adjuster:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdjuster((prev) => ({
      ...prev,
      [name]: name === 'Adjuster_Max' ? parseFloat(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setNewAdjuster({
      Adjuster_Nickname: '',
      Adjuster_Type: '',
      Adjuster_Max: 1, // Default value for positive max
    });
    setShowForm(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container>
      <Title>Manage Adjusters for Shock ID {shockId}</Title>
      <Button onClick={handleBack} style={{ backgroundColor: '#008CBA' }}>
        Back to Shocks
      </Button>
      <Button onClick={() => setShowForm(true)}>Add New Adjuster</Button>

      <AdjusterGrid>
        {adjusters.map((adjuster) => (
          <AdjusterCard key={adjuster.Adjuster_ID}>
            <h3>{adjuster.Adjuster_Nickname}</h3>
            <AdjusterInfo><strong>Nickname:</strong> {adjuster.Adjuster_Nickname}</AdjusterInfo>
            <AdjusterInfo><strong>Type:</strong> {adjuster.Adjuster_Type}</AdjusterInfo>
            <AdjusterInfo><strong>Max:</strong> {adjuster.Adjuster_Max}</AdjusterInfo>
            <ButtonGroup>
              <Button onClick={() => handleEdit(adjuster)} style={{ backgroundColor: '#2196F3' }}>Edit</Button>
              <Button onClick={() => handleDelete(adjuster.Adjuster_ID)} style={{ backgroundColor: '#FF5722' }}>
                Delete
              </Button>
            </ButtonGroup>
          </AdjusterCard>
        ))}
      </AdjusterGrid>

      {showForm && (
        <>
          <Overlay onClick={resetForm} />
          <FormModal>
            <h3>{editingId ? 'Edit Adjuster' : 'Add New Adjuster'}</h3>
            <form onSubmit={handleSave}>
              <Select
                name="Adjuster_Nickname"
                value={newAdjuster.Adjuster_Nickname || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Adjuster Type</option>
                {adjusterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <Select
                name="Adjuster_Type"
                value={newAdjuster.Adjuster_Type || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Adjuster Method</option>
                {adjusterMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                step="any"
                min="1"
                max="100"
                name="Adjuster_Max"
                value={newAdjuster.Adjuster_Max || 1}
                onChange={handleInputChange}
                placeholder="Max Value"
                required
              />
              <Button type="submit">{editingId ? 'Update Adjuster' : 'Add Adjuster'}</Button>
              <Button type="button" onClick={resetForm} style={{ backgroundColor: '#FF5722' }}>
                Cancel
              </Button>
            </form>
          </FormModal>
        </>
      )}
    </Container>
  );
};

export default AdjusterManager;
