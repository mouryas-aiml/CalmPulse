import React, { useState, useRef, useEffect } from 'react';
import './Mindmitra.css';
// Remove OpenAI import and use fetch for Perplexity API
// import OpenAI from 'openai';

function Mindmitra() {
  const initialMessage = { 
    text: "Hello! I'm Mindmitra, your mental wellness companion. How are you feeling today?", 
    sender: 'bot' 
  };
  
  // Load messages from localStorage on component mount
  const loadMessages = () => {
    const savedMessages = localStorage.getItem('mindmitraMessages');
    return savedMessages ? JSON.parse(savedMessages) : [initialMessage];
  };
  
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const messagesEndRef = useRef(null);
  
  // API config constants
  const MIN_REQUEST_INTERVAL = 5000; // Minimum 5 seconds between requests
  const MAX_RETRY_DELAY = 60000; // Maximum 1 minute retry delay
  const MAX_RETRIES = 3; // Maximum number of retries
  
  // Perplexity API key
  const PERPLEXITY_API_KEY = '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';

  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mindmitraMessages', JSON.stringify(messages));
  }, [messages]);

  // Clear any existing timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    // Only scroll if user is near the bottom already or if a new message was added
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
      if (isNearBottom || messages.length > 0 && messages[messages.length - 1].sender === 'bot') {
        scrollToBottom();
      }
    }
  }, [messages]);
  
  // Clear chat history and start fresh
  const clearChat = () => {
    setMessages([initialMessage]);
    setIsError(false);
    setErrorMessage('');
    setRetryCount(0);
    setIsRateLimited(false);
    setCooldownTime(0);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  };

  // Throttle helper function
  const shouldThrottleRequest = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    return timeSinceLastRequest < MIN_REQUEST_INTERVAL;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '' || isRateLimited || isTyping) return;
    
    // Check if we need to throttle the request
    if (shouldThrottleRequest()) {
      const waitTime = MIN_REQUEST_INTERVAL - (Date.now() - lastRequestTime);
      setIsRateLimited(true);
      setCooldownTime(waitTime);
      
      // Show temporary message about throttling
      setMessages([...messages, { 
        text: `Please wait ${Math.ceil(waitTime/1000)} seconds between messages to avoid rate limits.`, 
        sender: 'bot', 
        isError: true,
        isTemporary: true
      }]);
      
      // Auto-send after cooldown
      const timeout = setTimeout(() => {
        setIsRateLimited(false);
        setCooldownTime(0);
        
        // Remove temporary message
        setMessages(prev => prev.filter(msg => !msg.isTemporary));
        
        // Now send the message
        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);
        setIsError(false);
        
        // Update last request time
        setLastRequestTime(Date.now());
        
        // Call OpenAI API for response
        generateBotResponse(newMessages);
      }, waitTime);
      
      setRetryTimeout(timeout);
      return;
    }
    
    // Add user message
    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    
    // Show bot typing indicator
    setIsTyping(true);
    setIsError(false);
    
    // Update last request time
    setLastRequestTime(Date.now());
    
    // Call OpenAI API for response
    generateBotResponse(newMessages);
  };

  const generateBotResponse = async (messageHistory) => {
    try {
      // Format messages for Perplexity API - limit to last 6 messages to avoid token limits
      const recentMessages = messageHistory.slice(-6);
      const formattedMessages = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add system message to provide context to the AI
      formattedMessages.unshift({
        role: 'system',
        content: `You are Mindmitra, a compassionate AI companion for mental wellness support. 
                  Provide helpful, empathetic responses to users seeking emotional support or mental health guidance.
                  Always prioritize user safety. Never give medical advice, diagnose conditions, or suggest medication.
                  If someone appears to be in crisis, gently suggest they contact mental health professionals.
                  Keep responses concise (max 3-4 sentences) and supportive.`
      });

      console.log('Sending request to Perplexity API with messages:', formattedMessages);

      // Make API call to Perplexity
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'r1-1776',  // Using a verified supported model
          messages: formattedMessages,
          max_tokens: 150,
          temperature: 0.7,
        })
      });

      console.log('Perplexity API response status:', response.status);
      
      // Get full response text for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: `Perplexity API error: ${response.statusText}`,
          responseText
        };
      }

      // Make sure we can parse the response
      let data;
      try {
        data = JSON.parse(responseText);
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response structure');
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        throw {
          status: 'PARSE_ERROR',
          message: 'Failed to parse API response',
          responseText
        };
      }
      
      // Get the response text
      const botResponse = data.choices[0].message.content.trim();
      
      // Reset retry count on successful API call
      setRetryCount(0);
      setIsRateLimited(false);
      
      // Update messages with bot response
      setMessages([...messageHistory, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      setIsError(true);
      
      // Handle different error types
      let errorMsg = 'Sorry, I encountered an issue connecting to my brain. Please try again in a moment.';
      let isRateLimit = false;
      let retryDelay = Math.min(MAX_RETRY_DELAY, 5000 * Math.pow(2, retryCount)); // Exponential backoff with max
      
      if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
        errorMsg = 'I\'m receiving too many messages right now. Please wait a moment before trying again.';
        isRateLimit = true;
      } else if (error.status === 401 || error.status === 403) {
        errorMsg = 'I\'m having trouble with my authorization. Please try again later.';
      } else if (error.responseText && error.responseText.includes('model')) {
        errorMsg = 'I\'m currently experiencing issues with my AI model. Our team is working on it.';
      }
      
      setErrorMessage(errorMsg);
      
      // Increment retry count and handle repeated errors
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      if (newRetryCount >= MAX_RETRIES) {
        errorMsg = 'I\'m having persistent trouble connecting. Please try clearing the chat or coming back later.';
        isRateLimit = false; // Stop auto-retrying after max retries
      }
      
      // Set rate limited state
      setIsRateLimited(isRateLimit);
      setCooldownTime(isRateLimit ? retryDelay : 0);
      
      // Auto-retry for rate limit errors with exponential backoff
      if (isRateLimit && newRetryCount <= MAX_RETRIES) {
        const timeout = setTimeout(() => {
          setIsRateLimited(false);
          setCooldownTime(0);
          setErrorMessage('');
          
          // Only attempt auto-retry if we haven't reached max retries
          if (newRetryCount < MAX_RETRIES) {
            // Update last request time before retry
            setLastRequestTime(Date.now());
            generateBotResponse(messageHistory);
          }
        }, retryDelay);
        
        setRetryTimeout(timeout);
        
        // Update error message to include retry countdown
        errorMsg = `${errorMsg} Retrying in ${Math.ceil(retryDelay/1000)} seconds...`;
      }
      
      // Add error message to chat
      setMessages(prev => {
        // Remove any previous error messages that are temporary
        const filteredMessages = prev.filter(msg => !msg.isTemporary);
        return [...filteredMessages, { 
          text: errorMsg, 
          sender: 'bot', 
          isError: true 
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Handle key press for Enter to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() !== '' && !isTyping && !isRateLimited) {
        handleSendMessage(e);
      }
    }
  };

  // Format time for countdown display
  const formatCountdown = (ms) => {
    if (ms <= 0) return '';
    const seconds = Math.ceil(ms / 1000);
    return `(${seconds}s)`;
  };

  return (
    <div className="mindmitra-container">
      <div className="chat-header">
        <h1>Mindmitra</h1>
        <p>Your AI companion for mental wellness support</p>
        <button className="clear-chat" onClick={clearChat} title="Clear chat history">
          <i className="fas fa-trash"></i> New Chat
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender} ${message.isError ? 'error' : ''} ${message.isTemporary ? 'temporary' : ''}`}>
            {message.text}
          </div>
        ))}
        {isTyping && (
          <div className="message bot typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        {isRateLimited && !isTyping && (
          <div className="rate-limit-indicator">
            <i className="fas fa-clock"></i> Waiting for rate limit to reset... {formatCountdown(cooldownTime)}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={isRateLimited ? `Please wait ${formatCountdown(cooldownTime)}` : "Type your message here..."}
          disabled={isTyping || isRateLimited}
        />
        <button type="submit" disabled={isTyping || input.trim() === '' || isRateLimited}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
      
      <div className="chat-disclaimer">
        <p>Note: Mindmitra is an AI assistant and not a replacement for professional mental health care. 
        If you're experiencing a crisis, please contact emergency services or a mental health professional.</p>
      </div>
    </div>
  );
}

export default Mindmitra;