import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GetStarted.css';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function GetStarted() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // For initial auth check
  
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Set persistence to local to ensure user stays logged in
        await setPersistence(auth, browserLocalPersistence);
        
        // Wait for auth state to be ready
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              uid: user.uid
            }));
            navigate('/');
          } else {
            // No user is signed in, check localStorage as fallback
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            if (isAuthenticated) {
              navigate('/');
            }
          }
          setIsAuthChecking(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error during auth check:", error);
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
    setEmail('');
    setPassword('');
    setName('');
  };

  // Save user data to Firestore
  const saveUserToFirestore = async (user, displayName) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        preferences: {
          notifications: true,
          darkMode: false,
          language: 'English',
          dataSharingConsent: true
        }
      }, { merge: true }); // Use merge to avoid overwriting existing data
      
      console.log("User data saved to Firestore");
    } catch (error) {
      console.error("Error saving user data to Firestore:", error);
      // Continue with authentication flow even if Firestore save fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    // Basic validation
    if (!email || !password || (!isLogin && !name)) {
      setErrorMessage('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    if (!isLogin && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
    if (isLogin) {
        // Firebase login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("Login successful:", user);
        
        // Set authentication status in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ 
          email: user.email, 
          name: user.displayName || email.split('@')[0],
          uid: user.uid
        }));
        
        // Update last login timestamp in Firestore
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Error updating last login:", error);
        }
        
        navigate('/');
      } else {
        // Firebase signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("Signup successful:", user);
        
        // Update profile with name
        await updateProfile(user, { displayName: name });
        
        // Save user to Firestore
        await saveUserToFirestore(user, name);
        
        // Set authentication status in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ 
          email: user.email, 
          name: name,
          uid: user.uid
        }));
        
        navigate('/');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrorMessage('This email is already registered');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Invalid email address');
          break;
        case 'auth/weak-password':
          setErrorMessage('Password is too weak');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        setErrorMessage('Invalid email or password');
          break;
        case 'auth/network-request-failed':
          setErrorMessage('Network error. Please check your connection');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Too many attempts. Please try again later');
          break;
        default:
          setErrorMessage(`An error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Google sign-in successful:", user);
      
      // Save or update user in Firestore
      await saveUserToFirestore(user, user.displayName);
      
      // Set authentication status in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ 
        email: user.email, 
        name: user.displayName,
        uid: user.uid
      }));
      
      navigate('/');
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed before completing');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // This is a normal case when multiple popups are triggered
        console.log("Popup request cancelled");
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Network error. Please check your connection');
      } else {
        setErrorMessage(`Google sign-in failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner during initial auth check
  if (isAuthChecking) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

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
                
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
              </form>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              <div className="social-auth">
                <button 
                  className="social-button google" 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <i className="fab fa-google"></i>
                  Continue with Google
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
                <a href="tel:+917795009361">+91 7795009361</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetStarted; 