import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    // Get user info from either context or localStorage
    if (currentUser && currentUser.displayName) {
      setUserName(currentUser.displayName);
    } else {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (userInfo && userInfo.name) {
        setUserName(userInfo.name);
      }
    }
  }, [currentUser]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to the get-started page
      navigate('/get-started');
    } catch (error) {
      console.error("Failed to log out", error);
    }
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
              AI Health Analysis
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
            <Link to="/mindmitra" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Mindmitra
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/insights" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Insights
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-link user-profile" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-user-circle"></i> {userName || 'Profile'}
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