import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { auth } from '../firebase';

// Create the AuthContext
const AuthContext = createContext();

// Hook for child components to get the auth object
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and provides auth object
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign out function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    // Sign out of Firebase
    return signOut(auth);
  };

  // Set up auth state observer on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL
        });
        
        // Update localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          uid: user.uid
        }));
      } else {
        // User is signed out
        setCurrentUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Clean up observer on unmount
    return unsubscribe;
  }, []);

  // Context value to be provided
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 