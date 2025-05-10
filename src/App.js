import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import MindScan from './pages/MindScan';
import Therapists from './pages/Therapists';
import CopingTools from './pages/CopingTools';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import GetStarted from './pages/GetStarted';

function App() {
  // Use localStorage to check authentication status (for demo purposes)
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <Router>
      <div className="App">
        {/* Only show Navbar when not on GetStarted page */}
        <Routes>
          <Route path="/get-started" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>
        
        <div className="page-container">
          <Routes>
            {/* Public routes */}
            <Route path="/get-started" element={<GetStarted />} />
            
            {/* Protected routes - redirect to GetStarted if not authenticated */}
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/get-started" />} />
            <Route path="/mindscan" element={isAuthenticated ? <MindScan /> : <Navigate to="/get-started" />} />
            <Route path="/therapists" element={isAuthenticated ? <Therapists /> : <Navigate to="/get-started" />} />
            <Route path="/coping-tools" element={isAuthenticated ? <CopingTools /> : <Navigate to="/get-started" />} />
            <Route path="/journal" element={isAuthenticated ? <Journal /> : <Navigate to="/get-started" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/get-started" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;