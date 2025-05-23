import React, { createContext, useContext, useState, useEffect } from 'react';

const TextAnalysisContext = createContext();

export function useTextAnalysis() {
  return useContext(TextAnalysisContext);
}

export function TextAnalysisProvider({ children }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('textApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const value = {
    apiKey,
    setApiKey
  };

  return (
    <TextAnalysisContext.Provider value={value}>
      {children}
    </TextAnalysisContext.Provider>
  );
} 