import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './animations.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import MindScan from './pages/MindScan';
import Therapists from './pages/Therapists';
import CopingTools from './pages/CopingTools';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import GetStarted from './pages/GetStarted';
import Mindmitra from './pages/Mindmitra';
import Community from './pages/Community';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Language Context
import { LanguageProvider } from './contexts/LanguageContext';
// Video Analysis Context
import { VideoAnalysisProvider } from './contexts/VideoAnalysisContext';
// Audio Analysis Context
import { AudioAnalysisProvider } from './contexts/AudioAnalysisContext';
// Text Analysis Context
import { TextAnalysisProvider } from './contexts/TextAnalysisContext';
// Mindmitra Context
import { MindmitraProvider } from './contexts/MindmitraContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // First check the context
  const { isAuthenticated } = useAuth();
  // Fallback to localStorage (for refresh handling)
  const isAuthenticatedLocal = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated && !isAuthenticatedLocal) {
    return <Navigate to="/get-started" />;
  }
  
  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  // Fallback to localStorage (for refresh handling)
  const isAuthenticatedLocal = localStorage.getItem('isAuthenticated') === 'true';
  const userIsAuthenticated = isAuthenticated || isAuthenticatedLocal;

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: false,
      mirror: true,
      offset: 120,
    });
    
    // Refresh AOS on window resize
    window.addEventListener('resize', () => {
      AOS.refresh();
    });
    
    return () => {
      window.removeEventListener('resize', () => {
        AOS.refresh();
      });
    };
  }, []);

  return (
      <div className="App">
      {/* Only show Navbar when not on GetStarted page and authenticated */}
        <Routes>
          <Route path="/get-started" element={null} />
        <Route path="*" element={userIsAuthenticated ? <Navbar /> : null} />
        </Routes>
        
        <div className="page-container">
          <Routes>
            {/* Public routes */}
          <Route path="/get-started" element={userIsAuthenticated ? <Navigate to="/" /> : <GetStarted />} />
            
            {/* Protected routes - redirect to GetStarted if not authenticated */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/mindscan" element={
            <ProtectedRoute>
              <MindScan />
            </ProtectedRoute>
          } />
          <Route path="/therapists" element={
            <ProtectedRoute>
              <Therapists />
            </ProtectedRoute>
          } />
          <Route path="/coping-tools" element={
            <ProtectedRoute>
              <CopingTools />
            </ProtectedRoute>
          } />
          <Route path="/mindmitra" element={
            <ProtectedRoute>
              <Mindmitra />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />
          </Routes>
      </div>
      
      {/* Only show Footer when not on GetStarted page and authenticated */}
      <Routes>
        <Route path="/get-started" element={null} />
        <Route path="*" element={userIsAuthenticated ? <Footer /> : null} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <MindmitraProvider>
            <VideoAnalysisProvider>
              <AudioAnalysisProvider>
                <TextAnalysisProvider>
                  <AppContent />
                </TextAnalysisProvider>
              </AudioAnalysisProvider>
            </VideoAnalysisProvider>
          </MindmitraProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;