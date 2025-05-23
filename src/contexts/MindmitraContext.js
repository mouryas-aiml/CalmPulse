import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateGroqResponse } from '../services/groqService';

const MindmitraContext = createContext(null);

export const useMindmitra = () => {
  const context = useContext(MindmitraContext);
  if (!context) {
    throw new Error('useMindmitra must be used within a MindmitraProvider');
  }
  return context;
};

export const MindmitraProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: "Hello! I'm Mindmitra, your mental wellness companion. How can I help you today?",
        sender: 'bot'
      }]);
    }
  }, [messages]);

  const sendMessage = async (userMessage) => {
    try {
      // Add user message to chat
      const newMessages = [...messages, { text: userMessage, sender: 'user' }];
      setMessages(newMessages);
      setIsTyping(true);
      setError(null);

      // Get bot response
      const response = await generateGroqResponse(newMessages);
      
      // Add bot response to chat
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      text: "Hello! I'm Mindmitra, your mental wellness companion. How can I help you today?",
      sender: 'bot'
    }]);
    setError(null);
  };

  const value = {
    messages,
    isTyping,
    error,
    sendMessage,
    clearChat
  };

  return (
    <MindmitraContext.Provider value={value}>
      {children}
    </MindmitraContext.Provider>
  );
}; 