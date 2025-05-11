import React, { createContext, useContext, useState, useEffect } from 'react';

const MindmitraContext = createContext(null);

export const useMindmitra = () => {
  const context = useContext(MindmitraContext);
  if (!context) {
    throw new Error('useMindmitra must be used within a MindmitraProvider');
  }
  return context;
};

export const MindmitraProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('mindmitraApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const value = {
    apiKey,
    setApiKey
  };

  return (
    <MindmitraContext.Provider value={value}>
      {children}
    </MindmitraContext.Provider>
  );
}; 