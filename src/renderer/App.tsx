import React from 'react';
import DatabaseViewer from './DatabaseViewer';

const App: React.FC = () => {
  return (
    <div>
      <h1>SQLite Database Viewer</h1>
      <DatabaseViewer />
    </div>
  );
};

export default App;