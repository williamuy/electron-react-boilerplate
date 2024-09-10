import React from 'react';
import { Link } from 'react-router-dom';

const MainPage = () => {
  return (
    <div>
      <h1>Welcome to the Vehicle Management App</h1>
      <nav>
        <ul>
          <li><Link to="/vehicles">View Vehicles</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default MainPage;