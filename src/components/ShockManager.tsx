import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

// Define the Shock data structure
interface ShockData {
  Shock_ID: number;
  Shock_Set_ID: number;
  Shock_Brand: string;
  Shock_Name: string;
  Shock_Location: string;
  isAdjustable: boolean;
  Adjuster_Amount: number;
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

const ShockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const ShockCard = styled.div`
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

const ShockManager: React.FC = () => {
  const [shocks, setShocks] = useState<ShockData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);  // Track the ID of the shock being edited
  const [newShock, setNewShock] = useState<Partial<ShockData>>({
    Shock_Brand: '',
    Shock_Name: '',
    Shock_Location: '',
    isAdjustable: false,
    Adjuster_Amount: 0,
  });
  const [showForm, setShowForm] = useState(false);  // Control the visibility of the form
  const { vehicleId } = useParams<{ vehicleId: string }>();  // Get vehicleId from route params
  const navigate = useNavigate();

  useEffect(() => {
    fetchShocks();
  }, [vehicleId]);

  const fetchShocks = async () => {
    try {
      const result = await window.electron.queryShocks(parseInt(vehicleId || '0'));  // Fetch shocks for the selected vehicle
      setShocks(result);
    } catch (error) {
      console.error('Error fetching shocks:', error);
    }
  };

  const handleEdit = (shock: ShockData) => {
    setEditingId(shock.Shock_ID);  // Set the ID of the shock being edited
    setNewShock(shock);  // Populate the form with the selected shock's data
    setShowForm(true);  // Show the form for editing
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {  // If editing an existing shock
        await window.electron.updateShock({
          ...newShock,
          Shock_ID: editingId,  // Ensure we pass the correct shock ID
        });
      } else {  // If adding a new shock
        const shockWithRandomId = {
          ...newShock,
          Shock_Set_ID: parseInt(vehicleId || '0'),  // Link the shock to the selected vehicle
          isAdjustable: newShock.isAdjustable ? 1 : 0,  // Convert boolean to integer for SQLite
        };
        await window.electron.insertShock(shockWithRandomId);
      }
      setEditingId(null);  // Reset the editing ID
      setNewShock({  // Reset the form state
        Shock_Brand: '',
        Shock_Name: '',
        Shock_Location: '',
        isAdjustable: false,
        Adjuster_Amount: 0,
      });
      setShowForm(false);  // Hide the form
      fetchShocks();  // Refresh the shocks list
    } catch (error) {
      console.error('Error saving shock:', error);
    }
  };

  const handleDelete = async (shockId: number) => {
    try {
      await window.electron.deleteShock(shockId);  // Delete the shock
      fetchShocks();  // Refresh the shocks list after deletion
    } catch (error) {
      console.error('Error deleting shock:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShock((prev) => ({
      ...prev,
      [name]: name === 'isAdjustable' ? e.target.checked : value,  // Update the form state based on input changes
    }));
  };

  const handleBack = () => {
    navigate('/vehicles');  // Navigate back to the vehicle list
  };

  const handleHome = () => {
    navigate('/');  // Navigate to home page
  };

  // Function to navigate to AdjusterManager for the selected shock
  const goToAdjusters = (shockId: number) => {
    navigate(`/shocks/${shockId}/adjusters`);  // Navigate to the adjusters for this shock
  };

  return (
    <Container>
      <Title>Manage Shocks for Vehicle ID {vehicleId}</Title>
      <Button onClick={handleBack} style={{ marginBottom: '1rem', backgroundColor: '#008CBA' }}>
        Back to Vehicles
      </Button>
      <Button onClick={handleHome} style={{ marginBottom: '1rem', backgroundColor: '#007BFF' }}>
        Home
      </Button>
      <Button onClick={() => setShowForm(true)}>Add New Shock</Button>

      <ShockGrid>
        {shocks.map((shock) => (
          <ShockCard key={shock.Shock_ID || Math.random()}>  {/* Use Shock_ID, fallback to random if null */}
            <h3>{shock.Shock_Name}</h3>
            <p>Brand: {shock.Shock_Brand}</p>
            <p>Location: {shock.Shock_Location}</p>
            <p>Adjustable: {shock.isAdjustable ? 'Yes' : 'No'}</p>
            <p>Adjuster Amount: {shock.Adjuster_Amount}</p>
            <Button onClick={() => handleEdit(shock)}>Edit</Button>
            <Button onClick={() => handleDelete(shock.Shock_ID)} style={{ backgroundColor: '#FF0000' }}>
              Delete
            </Button>
            {/* New Button to View Adjusters */}
            <Button onClick={() => goToAdjusters(shock.Shock_ID)} style={{ backgroundColor: '#FFA500' }}>
              View Adjusters
            </Button>
          </ShockCard>
        ))}
      </ShockGrid>

      {showForm && (
        <FormModal>
          <h3>{editingId ? 'Edit Shock' : 'Add New Shock'}</h3>
          <form onSubmit={handleSave}>
            <Input
              type="text"
              name="Shock_Brand"
              value={newShock.Shock_Brand || ''}
              onChange={handleInputChange}
              placeholder="Shock Brand"
              required
            />
            <Input
              type="text"
              name="Shock_Name"
              value={newShock.Shock_Name || ''}
              onChange={handleInputChange}
              placeholder="Shock Name"
              required
            />
            <Input
              type="text"
              name="Shock_Location"
              value={newShock.Shock_Location || ''}
              onChange={handleInputChange}
              placeholder="Shock Location"
            />
            <label>
              Adjustable:
              <Input
                type="checkbox"
                name="isAdjustable"
                checked={newShock.isAdjustable || false}
                onChange={handleInputChange}
              />
            </label>
            <Input
              type="number"
              name="Adjuster_Amount"
              value={newShock.Adjuster_Amount || 0}
              onChange={handleInputChange}
              placeholder="Adjuster Amount"
            />
            <Button type="submit">{editingId ? 'Update Shock' : 'Add Shock'}</Button>
            <Button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#FF0000' }}>
              Cancel
            </Button>
          </form>
        </FormModal>
      )}
    </Container>
  );
};

export default ShockManager;
