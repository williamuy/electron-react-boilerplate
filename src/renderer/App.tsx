import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import styled from 'styled-components';
import VehicleManager from '../components/VehicleManager';
import ShockSetManager from '../components/ShockSetManager';
import ShockManager from '../components/ShockManager';
import AdjusterManager from '../components/AdjusterManager';
import VehicleSelector from '../components/Selectors/VehicleSelector';
import ShockSetSelector from '../components/Selectors/ShockSetSelector';
import ShockSelector from '../components/Selectors/ShockSelector';
import ShockTestInitiator from '../components/Selectors/ShockTestInitiator';
import Ping from '../components/Ping';

const MainContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Roboto', Arial, sans-serif;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;

const MainButton = styled(Link)`
  padding: 1rem 2rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
              <Title>Welcome to Muggs Demo</Title>
              <ButtonContainer>
                <MainButton to="/vehicles">Manage Vehicles</MainButton>
                <MainButton to="/select-vehicle">Select Shock for Testing</MainButton>
                <MainButton to="/ping">Ping</MainButton>
              </ButtonContainer>
            </MainContainer>
          }
        />
        
        <Route path="/vehicles" element={<VehicleManager />} />
        <Route path="/vehicles/:vehicleId/shock-sets" element={<ShockSetManager />} />
        <Route path="/shock-sets/:shockSetId/shocks" element={<ShockManager />} />
        <Route path="/shocks/:shockId/adjusters" element={<AdjusterManager />} />
        <Route path="/ping" element={<Ping />} />
        
        {/* New routes for shock selection process */}
        <Route path="/select-vehicle" element={<VehicleSelector />} />
        <Route path="/select-shock-set/:vehicleId" element={<ShockSetSelector />} />
        <Route path="/select-shock/:shockSetId" element={<ShockSelector />} />
        <Route path="/initiate-test/:shockId" element={<ShockTestInitiator />} />
      </Routes>
    </Router>
  );
};

export default App;