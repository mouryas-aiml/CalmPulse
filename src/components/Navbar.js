import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import useCommonTranslations from '../hooks/useCommonTranslations';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { translations } = useCommonTranslations();

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

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <i className="fas fa-heartbeat"></i> CalmPulse
        </Link>
        
        <div className="nav-right">
          <div className="language-item">
            <LanguageSelector />
          </div>
          
          <div className="menu-icon" onClick={toggleMenu}>
            <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </div>
        </div>
        
        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {translations.home}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/mindscan" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {translations.aiHealthAnalysis}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/therapists" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {translations.therapists}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/coping-tools" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {translations.copingTools}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/mindmitra" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {translations.mindmitra}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/insights" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {translations.insights}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-link user-profile" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-user-circle"></i> {userName || translations.profile}
            </Link>
          </li>
          <li className="nav-item language-item mobile-only">
            <LanguageSelector />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar; 