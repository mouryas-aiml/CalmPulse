import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    // Clear authentication status
    localStorage.removeItem('isAuthenticated');
    // Navigate to the get-started page
    navigate('/get-started');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <i className="fas fa-heartbeat"></i> CalmPulse
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
        
        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/mindscan" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              MindScan
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/therapists" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Therapists
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/coping-tools" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Coping Tools
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/journal" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Journal
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Profile
            </Link>
          </li>
          <li className="nav-item">
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar; 