import React, { useState, useEffect } from 'react';

interface VehicleData {
  User_ID: number;
  Vehicle_Type_ID: number;
  Nickname_ID: number;
  Nickname: string;
  Make: string;
  Model: string;
  Year: number;
}

const DatabaseViewer: React.FC = () => {
  const [data, setData] = useState<VehicleData[]>([]);
  const [newData, setNewData] = useState<VehicleData>({
    User_ID: 0,
    Vehicle_Type_ID: 0,
    Nickname_ID: 0,
    Nickname: '',
    Make: '',
    Model: '',
    Year: 0
  });

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
      await window.electron.insertData(newData);
      setNewData({
        User_ID: 0,
        Vehicle_Type_ID: 0,
        Nickname_ID: 0,
        Nickname: '',
        Make: '',
        Model: '',
        Year: 0
      });
      fetchData(); // Refresh the data after insertion
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Vehicle Database</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input type="number" name="User_ID" value={newData.User_ID} onChange={handleInputChange} placeholder="User ID" style={{ marginRight: '10px', padding: '5px' }} />
        <input type="number" name="Vehicle_Type_ID" value={newData.Vehicle_Type_ID} onChange={handleInputChange} placeholder="Vehicle Type ID" style={{ marginRight: '10px', padding: '5px' }} />
        <input type="number" name="Nickname_ID" value={newData.Nickname_ID} onChange={handleInputChange} placeholder="Nickname ID" style={{ marginRight: '10px', padding: '5px' }} />
        <input type="text" name="Nickname" value={newData.Nickname} onChange={handleInputChange} placeholder="Nickname" style={{ marginRight: '10px', padding: '5px' }} />
        <input type="text" name="Make" value={newData.Make} onChange={handleInputChange} placeholder="Make" style={{ marginRight: '10px', padding: '5px' }} />
        <input type="text" name="Model" value={newData.Model} onChange={handleInputChange} placeholder="Model" style={{ marginRight: '10px', padding: '5px' }} />
        <input type="number" name="Year" value={newData.Year} onChange={handleInputChange} placeholder="Year" style={{ marginRight: '10px', padding: '5px' }} />
        <button type="submit" style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>Insert Vehicle</button>
      </form>

      <button onClick={fetchData} style={{ marginBottom: '20px', padding: '5px 10px', backgroundColor: '#008CBA', color: 'white', border: 'none' }}>Refresh Data</button>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>User ID</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Vehicle Type ID</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nickname ID</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nickname</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Make</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Model</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Year</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{row.User_ID}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{row.Vehicle_Type_ID}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{row.Nickname_ID}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{row.Nickname}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{row.Make}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{row.Model}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{row.Year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatabaseViewer;