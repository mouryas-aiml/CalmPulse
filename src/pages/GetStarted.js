import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GetStarted.css';

function GetStarted() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || (!isLogin && !name)) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (!isLogin && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    // Check credentials for login
    if (isLogin) {
      if (email === 'bhanu@gmail.com' && password === 'bhanu@123') {
        // Set authentication status in localStorage (for demo purposes)
        localStorage.setItem('isAuthenticated', 'true');
        // Store user info
        localStorage.setItem('user', JSON.stringify({ email, name: 'Bhanu' }));
        // Navigate to home page after successful login
        navigate('/');
      } else {
        setErrorMessage('Invalid email or password');
      }
    } else {
      // For signup, just store the credentials and login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ email, name }));
      navigate('/');
    }
  };

  return (
    <div className="getstarted">
      <div className="getstarted-container">
        <div className="getstarted-content">
          <div className="getstarted-left">
            <h1>Build a good life for yourself with CalmPulse</h1>
            <div className="features-list">
              <div className="feature-item">
                <i className="fas fa-brain"></i>
                <span>AI-powered mental health analysis</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-user-md"></i>
                <span>Connect with mental health professionals</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-tools"></i>
                <span>Access personalized coping strategies</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-journal-whills"></i>
                <span>Track your mental health journey</span>
              </div>
            </div>
            <div className="awards">
              <div className="award">
                <span className="award-badge">Best App for Good</span>
                <p>Mental Health Innovation Award 2023</p>
              </div>
            </div>
          </div>
          
          <div className="getstarted-right">
            <div className="auth-container">
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${isLogin ? 'active' : ''}`} 
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button 
                  className={`auth-tab ${!isLogin ? 'active' : ''}`} 
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                
                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}
                
                <button type="submit" className="auth-button">
                  {isLogin ? 'Login' : 'Sign Up'}
                </button>
              </form>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              <div className="social-auth">
                <button className="social-button google">
                  <i className="fab fa-google"></i>
                  Continue with Google
                </button>
                <button className="social-button facebook">
                  <i className="fab fa-facebook-f"></i>
                  Continue with Facebook
                </button>
              </div>
              
              <div className="auth-footer">
                {isLogin ? (
                  <p>
                    Don't have an account?{' '}
                    <span className="auth-link" onClick={toggleForm}>
                      Sign up
                    </span>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <span className="auth-link" onClick={toggleForm}>
                      Login
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="help-text">
              <p>
                Need help? Reach out to us at{' '}
                <a href="mailto:help@calmpulse.com">help@calmpulse.com</a> or call{' '}
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetStarted; 