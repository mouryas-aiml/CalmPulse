import React, { createContext, useContext, useState, useEffect } from 'react';

const VideoAnalysisContext = createContext(null);

export const useVideoAnalysis = () => {
  const context = useContext(VideoAnalysisContext);
  if (!context) {
    throw new Error('useVideoAnalysis must be used within a VideoAnalysisProvider');
  }
  return context;
};

export const VideoAnalysisProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('AIzaSyBgw3YrS88ld06OFkCTZIOq1qgXJbez-FU');

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem('videoApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Set default API key if none exists
      localStorage.setItem('videoApiKey', 'AIzaSyBgw3YrS88ld06OFkCTZIOq1qgXJbez-FU');
    }
  }, []);

  const value = {
    apiKey,
    setApiKey
  };

  return (
    <VideoAnalysisContext.Provider value={value}>
      {children}
    </VideoAnalysisContext.Provider>
  );
}; 