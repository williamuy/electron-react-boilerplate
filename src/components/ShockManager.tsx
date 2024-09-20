import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

interface ShockData {
  Shock_ID: number;
  Shock_Set_ID: number;
  Shock_Brand: string;
  Shock_Name: string;
  Shock_Location: string;
  isAdjustable: boolean;
  Adjuster_Amount: number;
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

const ShockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ShockCard = styled.div`
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

const ShockInfo = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const ShockManager: React.FC = () => {
  const [shocks, setShocks] = useState<ShockData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newShock, setNewShock] = useState<Partial<ShockData>>({
    Shock_Brand: '',
    Shock_Name: '',
    Shock_Location: '',
    isAdjustable: false,
    Adjuster_Amount: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const { shockSetId } = useParams<{ shockSetId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchShocks();
  }, [shockSetId]);

  const fetchShocks = async () => {
    try {
      const result = await window.electron.queryShocks(parseInt(shockSetId || '0'));
      setShocks(result);
    } catch (error) {
      console.error('Error fetching shocks:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.electron.updateShock({
          ...newShock,
          Shock_ID: editingId,
        });
      } else {
        const shockWithRandomId = {
          ...newShock,
          Shock_Set_ID: parseInt(shockSetId || '0'),
          isAdjustable: newShock.isAdjustable ? 1 : 0,
        };
        await window.electron.insertShock(shockWithRandomId);
      }
      resetForm();
      fetchShocks();
    } catch (error) {
      console.error('Error saving shock:', error);
    }
  };

  const handleEdit = (shock: ShockData) => {
    setEditingId(shock.Shock_ID);
    setNewShock(shock);
    setShowForm(true);
  };

  const handleDelete = async (shockId: number) => {
    try {
      await window.electron.deleteShock(shockId);
      fetchShocks();
    } catch (error) {
      console.error('Error deleting shock:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewShock((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setNewShock({
      Shock_Brand: '',
      Shock_Name: '',
      Shock_Location: '',
      isAdjustable: false,
      Adjuster_Amount: 0,
    });
    setShowForm(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const goToAdjusters = (shockId: number) => {
    navigate(`/shocks/${shockId}/adjusters`);
  };

  return (
    <Container>
      <Title>Manage Shocks for Shock Set {shockSetId}</Title>
      <Button onClick={handleBack} style={{ backgroundColor: '#008CBA' }}>
        Back to Shock Sets
      </Button>
      <Button onClick={() => setShowForm(true)}>Add New Shock</Button>

      <ShockGrid>
        {shocks.map((shock) => (
          <ShockCard key={shock.Shock_ID}>
            <h3>{shock.Shock_Name}</h3>
            <ShockInfo><strong>Brand:</strong> {shock.Shock_Brand}</ShockInfo>
            <ShockInfo><strong>Location:</strong> {shock.Shock_Location}</ShockInfo>
            <ShockInfo><strong>Adjustable:</strong> {shock.isAdjustable ? 'Yes' : 'No'}</ShockInfo>
            <ShockInfo><strong>Adjuster Amount:</strong> {shock.Adjuster_Amount}</ShockInfo>
            <ButtonGroup>
              <Button onClick={() => handleEdit(shock)} style={{ backgroundColor: '#2196F3' }}>Edit</Button>
              <Button onClick={() => handleDelete(shock.Shock_ID)} style={{ backgroundColor: '#FF5722' }}>
                Delete
              </Button>
              <Button onClick={() => goToAdjusters(shock.Shock_ID)} style={{ backgroundColor: '#FFA500' }}>
                Manage Adjusters
              </Button>
            </ButtonGroup>
          </ShockCard>
        ))}
      </ShockGrid>

      {showForm && (
        <>
          <Overlay onClick={resetForm} />
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

export default ShockManager;