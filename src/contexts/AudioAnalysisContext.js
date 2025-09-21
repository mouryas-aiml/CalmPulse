import React, { createContext, useContext, useState, useEffect } from 'react';

const AudioAnalysisContext = createContext();

export function useAudioAnalysis() {
  return useContext(AudioAnalysisContext);
}

export function AudioAnalysisProvider({ children }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('audioApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const value = {
    apiKey,
    setApiKey
  };

  return (
    <AudioAnalysisContext.Provider value={value}>
      {children}
    </AudioAnalysisContext.Provider>
  );
} 