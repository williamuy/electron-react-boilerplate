import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import styled from 'styled-components';
import VehicleManager from '../components/VehicleManager';
import DatabaseViewer from '../components/DatabaseViewer';
import ShockSetManager from '../components/ShockSetManager';
import ShockManager from '../components/ShockManager';
import AdjusterManager from '../components/AdjusterManager';
import Main from 'electron/main';

const MainContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  text-align: center;
`;

const MainButton = styled(Link)`
  padding: 1rem 2rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainContainer>
              <h1>Welcome to Muggs Demo</h1>
              <MainButton to="/vehicles">Manage Your Vehicles</MainButton>
              <MainButton to="/database-viewer">View Database</MainButton>
              <MainButton to="/shock-sets">Manage Your Shock Sets</MainButton>
              <MainButton to="/shocks">Manage Your Shocks</MainButton>
              <MainButton to="/adjusters">Manage Your Adjusters</MainButton>
            </MainContainer>
          }
        />
        <Route path="/vehicles" element={<VehicleManager />} />
        <Route path="/database-viewer" element={<DatabaseViewer />} />
        <Route path="/shock-sets" element={<ShockSetManager />} />
        <Route path="/shocks" element={<ShockManager />} />
        <Route path="/adjusters" element={<AdjusterManager  />} />
        <Route path="/shocks/:shockId/adjusters" element={<AdjusterManager />} /> {/* Add this route */}
        <Route path="/vehicles/:vehicleId/shocks" element={<ShockManager />} />
      </Routes>
    </Router>
  );
};

export default App;