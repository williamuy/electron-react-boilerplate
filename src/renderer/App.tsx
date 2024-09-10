import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import styled from 'styled-components';
import DatabaseViewer from './DatabaseViewer';

// Styles for the main page
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
              <h1>Welcome to the Vehicle Management System</h1>
              <MainButton to="/vehicles">Go to Vehicle Database</MainButton>
            </MainContainer>
          }
        />
        <Route path="/vehicles" element={<DatabaseViewer />} />
      </Routes>
    </Router>
  );
};

export default App;
