import axios from 'axios';

// Get API key from localStorage or use default
const getGroqApiKey = () => {
  return localStorage.getItem('mindmitraApiKey') || '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';
};

const GROQ_MODEL = 'mistral-saba-24b';

// Clear chat history from localStorage
export const clearChatHistory = () => {
  const userId = localStorage.getItem('userId') || 'guest';
  localStorage.removeItem(`mindmitraMessages_${userId}`);
};

/**
 * Generate a response using the Groq API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the API call
 * @returns {Promise} - Promise that resolves to the API response
 */
export const generateGroqResponse = async (message) => {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Clear chat history after getting response
    setTimeout(clearChatHistory, 2000); // Clear after 2 seconds
    
    return data.response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

/**
 * Generate a streamed response using the Groq API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Function} onChunk - Callback function for each chunk of the response
 * @param {Object} options - Additional options for the API call
 * @returns {Promise} - Promise that resolves when the stream is complete
 */
export const generateStreamedGroqResponse = async (messages, updateResponse, options = {}) => {
  try {
    const latestMessage = messages.find(msg => msg.role === 'user')?.content;
    if (!latestMessage) return;
    
    const response = await generateGroqResponse(latestMessage);
    updateResponse(response);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}; 