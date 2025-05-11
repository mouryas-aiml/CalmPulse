import React, { useState, useRef, useEffect } from 'react';
import './Mindmitra.css';
import TranslatedText from '../components/TranslatedText';
import { useAuth } from '../contexts/AuthContext';

function Mindmitra() {
  const { currentUser } = useAuth();
  
  const initialMessage = { 
    text: "Hello! I'm Mindmitra, your mental wellness companion powered by Google Assistant. How are you feeling today?",
    sender: 'bot' 
  };
  
  // Load messages from localStorage on component mount
  const loadMessages = () => {
    const savedMessages = localStorage.getItem(`mindmitraMessages_${currentUser?.uid || 'guest'}`);
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
  const GOOGLE_ASSISTANT_API_ENDPOINT = 'https://dialogflow.googleapis.com/v2/projects/calmpulse/agent/sessions/session-123';
  const GOOGLE_ASSISTANT_API_KEY = 'AIzaSyAanTnsSU_RdOq6yAvMaIuY6bKzUfElgvI';
  
  // Use local response generation initially while API is being set up
  const useLocalFallback = true;
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`mindmitraMessages_${currentUser?.uid || 'guest'}`, JSON.stringify(messages));
  }, [messages, currentUser]);

  // Check API key on component mount
  useEffect(() => {
    if (!GOOGLE_ASSISTANT_API_KEY || GOOGLE_ASSISTANT_API_KEY.trim() === '') {
      console.error('Google Assistant API key is not configured');
      setIsError(true);
      setMessages(prev => [...prev, { 
        text: "⚠️ API key is not configured properly. Some features may not work correctly.",
        sender: 'bot',
        isError: true
      }]);
    } else {
      console.log('Google Assistant API key is configured:', 
        GOOGLE_ASSISTANT_API_KEY ? 'Key is set (length: ' + GOOGLE_ASSISTANT_API_KEY.length + ')' : 'No key');
      
      // Make a test API call to verify the key works
      fetch(`https://dialogflow.googleapis.com/v2/projects/calmpulse?key=${GOOGLE_ASSISTANT_API_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GOOGLE_ASSISTANT_API_KEY}`,
        }
      }).then(response => {
        if (response.ok) {
          console.log('Google Assistant API key is valid');
        } else {
          console.warn('Google Assistant API key may not be valid. Status:', response.status);
        }
      }).catch(error => {
        console.error('Error testing Google Assistant API key:', error);
      });
    }
  }, []);

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

  // Function to get preprocessed answers for suggested questions
  const getPreprocessedAnswer = (questionText) => {
    // Normalize the question text by converting to lowercase and removing punctuation
    const normalizedQuestion = questionText.toLowerCase().replace(/[.,?!]/g, '');
    
    // Map of preprocessed answers for each question
    const preprocessedAnswers = {
      // Mental Wellness category
      "what are some ways to manage anxiety": 
        "Here are effective strategies to manage anxiety:\n\n1. Practice deep breathing: Inhale for 4 counts, hold for 2, exhale for 6 counts\n2. Challenge negative thoughts by asking for evidence\n3. Use progressive muscle relaxation by tensing and releasing muscle groups\n4. Schedule dedicated 'worry time' to contain anxious thoughts\n5. Reduce caffeine and alcohol which can trigger anxiety\n6. Regular physical activity helps reduce anxiety sensitivity\n7. Practice mindfulness to stay present rather than worrying about the future\n\nWhich of these strategies would you like to know more about?",
      
      "im feeling stressed what should i do": 
        "I'm sorry you're feeling stressed. Here are immediate actions that can help:\n\n1. Take slow, deep breaths for 2-3 minutes\n2. Step outside for fresh air and a change of environment\n3. Move your body - even a 5-minute walk can reduce stress hormones\n4. Practice the 5-4-3-2-1 grounding technique: name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste\n5. Listen to calming music\n6. Write down what's bothering you to externalize your worries\n\nFor longer-term stress management, regular exercise, adequate sleep, and connecting with supportive people are very effective.",
      
      "how can i tell if im depressed": 
        "Depression involves several persistent symptoms that last for at least two weeks. Key signs include:\n\n• Persistent sad or empty mood\n• Loss of interest or pleasure in activities you used to enjoy\n• Significant changes in appetite or weight\n• Sleeping too much or too little\n• Fatigue or loss of energy\n• Feelings of worthlessness or excessive guilt\n• Difficulty thinking, concentrating, or making decisions\n• Thoughts of death or suicide\n\nIf you've experienced several of these symptoms for more than two weeks, please consider speaking with a healthcare provider. Remember that depression is a medical condition that responds well to proper treatment - it's not a weakness or character flaw.",
      
      // Self-Care category
      "can you suggest some breathing exercises": 
        "Here are effective breathing exercises you can try:\n\n1. Box Breathing: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat for 5 minutes.\n\n2. 4-7-8 Breathing: Inhale for 4 counts, hold for 7, exhale for 8. Works well for sleep and anxiety.\n\n3. Diaphragmatic Breathing: Place one hand on chest, one on stomach. Breathe so only your stomach moves.\n\n4. Alternate Nostril Breathing: Close right nostril, inhale through left, close left, exhale through right. Alternate.\n\n5. Extended Exhale: Make your exhale longer than your inhale (e.g., inhale for 4, exhale for 6).\n\nWith any breathing practice, find a comfortable position and practice in a quiet space when first learning.",
      
      "what are some simple mindfulness practices": 
        "Here are simple mindfulness practices you can incorporate into daily life:\n\n1. One-Minute Breathing: Focus solely on your breath for just 60 seconds.\n\n2. Mindful Observation: Choose any natural object and observe it closely for 5 minutes, noticing details you'd normally miss.\n\n3. Body Scan: Progressively focus attention from head to toe, noticing sensations without judgment.\n\n4. Mindful Eating: Eat one item slowly, noticing texture, taste, smell and the experience of nourishment.\n\n5. The 5-4-3-2-1 Practice: Notice 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste.\n\n6. Mindful Walking: Walk slowly, focusing on the sensation of each step touching the ground.\n\nThese can be practiced in just a few minutes throughout your day.",
      
      "how can i improve my sleep": 
        "Here are evidence-based strategies to improve your sleep quality:\n\n1. Keep a consistent sleep schedule, even on weekends\n2. Create a relaxing bedtime routine (reading, gentle stretching)\n3. Make your bedroom cool, dark, and quiet\n4. Avoid screens 1-2 hours before bed (the blue light disrupts sleep hormones)\n5. Limit caffeine after noon and alcohol before bed\n6. Exercise regularly, but not right before bedtime\n7. Use your bed only for sleep and intimacy, not work or watching TV\n8. If you can't sleep after 20 minutes, get up and do something relaxing until you feel sleepy\n9. Consider relaxation techniques like deep breathing or progressive muscle relaxation\n\nWhich of these would you like more specific guidance on?",
      
      // Relationships category
      "how can i set better boundaries with others": 
        "Setting healthy boundaries is essential for relationships and personal wellbeing. Here's how to improve your boundaries:\n\n1. Self-awareness: Identify your limits - what behaviors are acceptable and unacceptable to you\n\n2. Clear communication: Use direct, simple statements like \"I need...\" or \"I'm not comfortable with...\"\n\n3. Start small: Begin with less challenging situations to build confidence\n\n4. Use \"I\" statements: Say \"I feel overwhelmed when...\" rather than \"You always...\"\n\n5. Be consistent: Maintaining boundaries is as important as setting them\n\n6. Expect resistance: Some people may push back when you set new boundaries\n\n7. Practice self-care: Reinforcing boundaries is easier when you're taking care of yourself\n\nRemember, setting boundaries isn't selfish - it's necessary for healthy relationships.",
      
      "ways to build meaningful connections": 
        "Building meaningful connections takes intention and effort. Here are effective approaches:\n\n1. Practice active listening - focus fully on understanding others rather than preparing your response\n\n2. Show vulnerability by sharing your authentic thoughts and feelings\n\n3. Express appreciation specifically - \"I value how you always make time to listen\"\n\n4. Create shared experiences through activities you both enjoy\n\n5. Be consistent and reliable in your communication and follow-through\n\n6. Ask open-ended questions that invite deeper conversation\n\n7. Practice empathy by trying to understand others' perspectives and feelings\n\n8. Make time for regular check-ins with important people in your life\n\n9. Remember important details about others' lives and follow up on them\n\nWhich of these would you like to explore further?",
      
      // Getting Help category
      "how do i know if i need therapy": 
        "Here are signs that might indicate therapy could be beneficial:\n\n• Your emotions are interfering with daily functioning (work, relationships, self-care)\n• You're relying on unhealthy coping mechanisms (substances, excessive behaviors)\n• You've experienced trauma that impacts your wellbeing\n• You feel persistently sad, anxious, or emotionally numb\n• Your relationships are consistently difficult or unsatisfying\n• You've made efforts to address concerns but aren't seeing improvement\n• You want to understand yourself better or develop healthier patterns\n\nTherapy isn't only for crisis - it can help with personal growth, life transitions, and building skills. Many people find therapy valuable even without severe mental health concerns. Would you like to discuss what type of therapy might be most helpful for your situation?",
      
      "what types of therapy are available": 
        "There are many effective types of therapy available:\n\n• Cognitive-Behavioral Therapy (CBT): Focuses on changing unhelpful thought patterns and behaviors\n\n• Psychodynamic Therapy: Explores unconscious patterns and past experiences\n\n• Acceptance and Commitment Therapy (ACT): Emphasizes psychological flexibility and values-based action\n\n• Dialectical Behavior Therapy (DBT): Teaches skills for emotion regulation and interpersonal effectiveness\n\n• Mindfulness-Based Therapies: Incorporate present-moment awareness\n\n• EMDR: Specifically for processing traumatic memories\n\n• Interpersonal Therapy: Addresses relationship patterns and communication\n\n• Solution-Focused Brief Therapy: Concentrates on solutions rather than problems\n\nTherapy can be individual, couples, family, or group-based. Would you like to know which might be most helpful for specific concerns?"
    };
    
    // Look for an exact match first
    if (preprocessedAnswers[normalizedQuestion]) {
      return preprocessedAnswers[normalizedQuestion];
    }
    
    // If no exact match, look for partial matches
    for (const [key, answer] of Object.entries(preprocessedAnswers)) {
      if (normalizedQuestion.includes(key) || key.includes(normalizedQuestion)) {
        return answer;
      }
    }
    
    // If no match is found, return null to fall back to the regular response generation
    return null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isRateLimited || isTyping) return;
    
    // Check if we need to throttle the request
    if (shouldThrottleRequest()) {
      const waitTime = MIN_REQUEST_INTERVAL - (Date.now() - lastRequestTime);
      setIsRateLimited(true);
      setCooldownTime(waitTime);
      
      // Show temporary message about throttling
      setMessages(prev => [...prev, { 
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
        
        // Call API for response
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
    
    // Call API for response
    await generateBotResponse(newMessages);
  };

  const generateBotResponse = async (messageHistory) => {
    try {
      // Get the latest user message
      const latestUserMessage = messageHistory.filter(msg => msg.sender === 'user').pop();
      
      if (!latestUserMessage) {
        throw new Error('No user message found');
      }
      
      console.log('Processing user message:', latestUserMessage.text);
      setIsTyping(true); // Set typing indicator
      
      // Check for preprocessed answers first
      const preprocessedAnswer = getPreprocessedAnswer(latestUserMessage.text);
      if (preprocessedAnswer) {
        console.log('Using preprocessed answer');
        // Add a delay to simulate thinking (feels more natural)
        await new Promise(resolve => setTimeout(resolve, 1200));
        // Add bot's preprocessed response to messages
        setMessages(prev => [...prev, { text: preprocessedAnswer, sender: 'bot' }]);
        return;
      }
      
      if (useLocalFallback) {
        // Simulate API delay for a more natural experience
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use rule-based response generation
        let botResponse = generateLocalResponse(latestUserMessage.text, messageHistory);
        
        // Add bot's response to messages
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        return;
      }
      
      // Otherwise, try to use the Google Assistant API
      try {
        // Format the request for Google Assistant API
        const requestBody = {
          queryInput: {
            text: {
              text: latestUserMessage.text,
              languageCode: 'en-US'
            }
          },
          queryParams: {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York', // Use browser timezone if available
            sentimentAnalysisRequestConfig: {
              analyzeQueryTextSentiment: true
            }
          }
        };
        
        console.log('Sending request to Google Assistant API with key:', 
          GOOGLE_ASSISTANT_API_KEY ? 'Key is set (length: ' + GOOGLE_ASSISTANT_API_KEY.length + ')' : 'No key');
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GOOGLE_ASSISTANT_API_KEY}`,
          'X-Goog-Api-Key': GOOGLE_ASSISTANT_API_KEY
        };
        
        const apiUrl = `${GOOGLE_ASSISTANT_API_ENDPOINT}:detectIntent?key=${GOOGLE_ASSISTANT_API_KEY}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody)
        });
        
        const responseText = await response.text();
        console.log('Raw API response status:', response.status, response.statusText);
        
        if (!response.ok) {
          console.error('Google Assistant API error:', {
            status: response.status,
            statusText: response.statusText,
            response: responseText
          });
          
          // Try to extract specific error message
          let errorMessage = `API error: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.error && errorData.error.message) {
              errorMessage = `API error: ${errorData.error.message}`;
            }
          } catch (parseError) {
            console.log('Could not parse error response as JSON');
          }
          
          throw new Error(errorMessage);
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Google Assistant API response:', data);
          
          // Check for authentication issues in the response
          if (data.error && (data.error.status === 'UNAUTHENTICATED' || 
              data.error.message && data.error.message.includes('authentication'))) {
            throw new Error('Authentication issue detected');
          }
          
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          throw new Error('Failed to parse API response. The service may be experiencing issues.');
        }
        
        // Extract response from the API
        const botResponse = data.queryResult?.fulfillmentText || "I'm sorry, I didn't understand that. Could you rephrase?";
        
        // Add bot's response to messages
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      } catch (apiError) {
        console.error('Error calling Google Assistant API:', apiError);
        console.log('Falling back to local response generation');
        
        // Show fallback message to user without exposing API error details
        setMessages(prev => [...prev, { 
          text: `I'm using my internal knowledge to respond to you today.`,
          sender: 'bot'
        }]);
        
        // Small delay before showing the fallback response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fallback to local response generation
        const botResponse = generateLocalResponse(latestUserMessage.text, messageHistory);
        
        // Add bot's response to messages
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setIsError(true);
      const errorMsg = 'I apologize, but I encountered an error processing your message. Please try again.';
      setErrorMessage(errorMsg);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        text: errorMsg,
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to generate local responses without API
  const generateLocalResponse = (userMessage, messageHistory) => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Mental health emergency keywords that require immediate attention
    if (lowercaseMessage.match(/.*(suicide|kill myself|end my life|want to die|don't want to live|harm myself|hurting myself).*/i)) {
      return "I'm concerned about what you're sharing. If you're having thoughts of harming yourself, please reach out to a crisis helpline immediately. In the US, you can call or text 988 to reach the Suicide & Crisis Lifeline, or text HOME to 741741 to reach the Crisis Text Line. These services are free, confidential, and available 24/7. Your wellbeing matters, and trained professionals are ready to help.";
    }
    
    // Authentication and identity verification questions
    if (lowercaseMessage.match(/.*(log in|login|sign in|signin|authenticate|password|credentials|verify identity|verification|authentication|security|token|oauth|api key).*/i)) {
      return "I'm here to provide mental health support rather than handle authentication tasks. If you're having issues accessing features in the app, please try refreshing the page or check your internet connection. For persistent login issues, you might want to contact our support team through the Help section.";
    }
    
    // Greeting patterns
    if (lowercaseMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening).*/i)) {
      return "Hello! It's nice to connect with you. How are you feeling today?";
    }
    
    // Ask about feelings or wellness
    if (lowercaseMessage.match(/.*(how are you|how's it going|how are things).*/i)) {
      return "I'm here and ready to support you. What's on your mind today?";
    }
    
    // Expressing negative emotions or challenges
    if (lowercaseMessage.match(/.*(sad|depressed|anxious|worried|stressed|unhappy|tired|exhausted|overwhelmed|lonely|alone|hopeless|helpless|scared|afraid|fearful).*/i)) {
      const negativeResponses = [
        "I'm sorry to hear you're feeling that way. It's important to acknowledge these feelings. Would you like to talk more about what might be causing these emotions, or perhaps discuss some coping strategies?",
        "That sounds really difficult. Would it help to talk about what specifically is causing you to feel this way?",
        "I appreciate you sharing your feelings with me. Sometimes naming our emotions is the first step toward managing them. What do you think might help you feel a bit better right now?",
        "I hear that you're struggling. Remember that emotions are temporary, even though they can feel very intense in the moment. Would you like to explore some grounding techniques that might help?",
        "Thank you for being open about how you're feeling. Many people experience similar emotions. Would you like to discuss some strategies that others have found helpful?"
      ];
      return negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
    }
    
    // Expressing positive emotions
    if (lowercaseMessage.match(/.*(happy|good|great|excellent|wonderful|amazing|joy|excited|positive|better|hopeful|grateful|thankful|blessed|fortunate|content|peaceful|calm).*/i)) {
      const positiveResponses = [
        "I'm glad to hear you're feeling positive! What's contributing to those good feelings today?",
        "That's wonderful to hear! It's important to recognize and celebrate these positive moments. What specifically is making you feel this way?",
        "I'm happy that you're doing well! These positive feelings are worth savoring. How might you extend or build on this good energy?",
        "It's great that you're feeling this way! Would you like to reflect on what factors or practices might be supporting your positive state?",
        "I'm glad you're experiencing these positive emotions. This is a good opportunity to notice what's going well in your life right now."
      ];
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    }
    
    // Asking for help or advice
    if (lowercaseMessage.match(/.*(help|advice|suggestion|recommend|what should I do|need guidance|lost|confused|uncertain|don't know what to do).*/i)) {
      const helpResponses = [
        "I'd be happy to help. While I can't provide medical advice, we can explore some general wellness strategies together. Could you tell me more about the specific situation you're seeking help with?",
        "I understand you're looking for guidance. Let's break this down - what specific area are you most concerned about right now?",
        "I'm here to support you. Sometimes talking through a challenge can help clarify your own thoughts. Would you like to share more details about what you're facing?",
        "It takes courage to ask for help. To offer the most relevant support, it would help me to know more about the particular situation you're dealing with.",
        "I appreciate you reaching out. Everyone needs support sometimes. Could you share a bit more about what's happening so I can offer more tailored suggestions?"
      ];
      return helpResponses[Math.floor(Math.random() * helpResponses.length)];
    }
    
    // Talking about sleep issues
    if (lowercaseMessage.match(/.*(sleep|insomnia|tired|can't sleep|difficult to sleep|nightmares|wake up|bad dreams|restless|stay awake|early morning|tossing|turning).*/i)) {
      const sleepResponses = [
        "Sleep is so important for mental wellness. Some helpful practices include maintaining a regular sleep schedule, creating a restful environment, limiting screen time before bed, and practicing relaxation techniques. Would you like to explore any of these further?",
        "Sleep difficulties can really affect our mental health. Have you noticed any patterns with your sleep issues? For example, do they happen more on certain days or after particular activities?",
        "Getting quality sleep can be challenging. One approach is to create a wind-down routine about an hour before bed. This might include dimming lights, avoiding screens, and doing something relaxing like reading or gentle stretching.",
        "Sleep problems are very common. For many people, managing stress during the day and creating a consistent bedtime routine can help. Would you like to discuss specific strategies that might work for your situation?",
        "I understand sleep issues can be frustrating. Sometimes tracking your sleep patterns and the factors that might be affecting them can provide useful insights. Have you noticed any connections between your daily habits and your sleep quality?"
      ];
      return sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
    }
    
    // Talking about meditation or mindfulness
    if (lowercaseMessage.match(/.*(meditation|mindfulness|relax|calm|breathing|breath|present|awareness|focus|concentrate|attention|zen|yoga|stillness).*/i)) {
      const mindfulnessResponses = [
        "Mindfulness and meditation can be powerful tools for mental wellness. Even a few minutes of deep breathing or present-moment awareness can help reduce stress. Would you like to try a simple mindfulness exercise together?",
        "Mindfulness practices can help us connect with the present moment rather than worrying about the past or future. A simple way to start is with a brief breathing exercise - would you like me to guide you through one?",
        "Building a meditation practice can support mental wellbeing in many ways. If you're new to meditation, starting with just 2-3 minutes of focused breathing can be a great way to begin. How does that sound?",
        "Mindfulness helps us observe our thoughts and feelings without judgment. One accessible practice is to take a few moments to notice five things you can see, four things you can touch, three things you can hear, two things you can smell, and one thing you can taste.",
        "Bringing mindful awareness to daily activities can be as effective as formal meditation. For instance, you might try eating a meal without distractions, fully focusing on the flavors, textures, and experience of nourishing your body."
      ];
      return mindfulnessResponses[Math.floor(Math.random() * mindfulnessResponses.length)];
    }
    
    // Expressing gratitude or thanks
    if (lowercaseMessage.match(/.*(thank|thanks|appreciate|grateful|gratitude).*/i)) {
      const gratitudeResponses = [
        "You're very welcome! I'm here to support you whenever you need someone to talk to.",
        "I'm glad I could be helpful! Remember that I'm here anytime you want to chat.",
        "It's my pleasure to be here for you. Feel free to reach out whenever you'd like to talk.",
        "I appreciate your kind words. I'm always here when you need support or just want to talk things through.",
        "You're welcome! Taking care of our mental health is important, and I'm glad to be part of your journey."
      ];
      return gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)];
    }
    
    // Talking about exercise or physical activity
    if (lowercaseMessage.match(/.*(exercise|workout|run|jog|walk|physical activity|gym|fitness|sport|active|move|movement|yoga|stretch|dance).*/i)) {
      const exerciseResponses = [
        "Physical activity is great for mental wellness! Even a short walk can boost your mood through the release of endorphins. What types of movement do you enjoy most?",
        "Exercise can be a powerful tool for managing stress and improving mood. The best type of activity is one that you enjoy and will continue doing. Have you found forms of movement that feel good to you?",
        "Moving our bodies can have significant benefits for our mental health. This doesn't have to mean intense workouts - gentle activities like walking, stretching, or dancing count too. What kinds of physical activity feel accessible to you right now?",
        "Regular physical activity can help reduce anxiety, improve sleep, and boost overall mood. It's most sustainable when it fits naturally into your life. How might you incorporate more movement into your daily routine?",
        "The mind-body connection is powerful - taking care of our physical health often supports our mental wellbeing too. Even small amounts of movement can make a difference. What's one active thing you might enjoy doing this week?"
      ];
      return exerciseResponses[Math.floor(Math.random() * exerciseResponses.length)];
    }
    
    // Asking about the bot
    if (lowercaseMessage.match(/.*(who are you|what are you|tell me about yourself|are you real|are you human|are you a bot|are you ai|artificial intelligence).*/i)) {
      const botResponses = [
        "I'm Mindmitra, a digital wellness companion designed to provide mental health support and a listening ear. While I'm not human or a licensed therapist, I'm here to offer a supportive conversation and helpful resources.",
        "I'm Mindmitra, an AI assistant focused on mental wellness conversations. I'm not a human therapist, but I'm designed to provide supportive listening, reflection, and general mental health information.",
        "I'm a digital mental wellness companion called Mindmitra. I use AI to have supportive conversations about emotional wellbeing. While I can't replace human connection or professional help, I aim to be a helpful resource in your mental health journey.",
        "Hello! I'm Mindmitra, an AI chat companion focused on mental wellness support. I'm here to listen, provide a space for reflection, and share general information about mental health topics.",
        "I'm Mindmitra, a conversational AI designed to support mental wellbeing. I can discuss various aspects of emotional and mental health, though I'm not a substitute for professional care when that's needed."
      ];
      return botResponses[Math.floor(Math.random() * botResponses.length)];
    }
    
    // Talking about relationships or social connections
    if (lowercaseMessage.match(/.*(relationship|friend|family|partner|spouse|husband|wife|boyfriend|girlfriend|colleague|coworker|social|connection|community|belong|lonely|alone).*/i)) {
      const relationshipResponses = [
        "Relationships play such an important role in our mental health. Both supportive connections and challenging relationships can significantly impact how we feel. Would you like to talk more about the specific relationship you're referring to?",
        "Human connection is fundamental to wellbeing. Sometimes our relationships can be sources of both joy and stress. Could you share more about what's happening in this relationship?",
        "Our social connections can deeply influence our emotional state. Whether you're building new relationships or navigating existing ones, it can help to reflect on how these interactions affect your mental health. Would you like to explore this further?",
        "Feeling connected to others is a basic human need. If you're experiencing challenges with relationships, it might help to consider both your needs and boundaries. Would you like to discuss specific relationship concerns?",
        "Relationships require care and attention, much like our mental health. Finding balance between connecting with others and honoring our own needs can be an ongoing process. What aspects of your relationships feel most relevant to your wellbeing right now?"
      ];
      return relationshipResponses[Math.floor(Math.random() * relationshipResponses.length)];
    }
    
    // Talking about work or career stress
    if (lowercaseMessage.match(/.*(work|job|career|boss|workplace|colleague|coworker|employment|unemployed|fired|laid off|promotion|workload|burnout).*/i)) {
      const workResponses = [
        "Work-related stress can significantly impact our mental health. Finding ways to create boundaries and practice self-care can be helpful. Would you like to discuss specific strategies for managing work stress?",
        "The workplace can bring various challenges that affect our wellbeing. Understanding what aspects of work are most stressful for you could help in developing targeted coping strategies. Would you like to explore this further?",
        "Career concerns and workplace dynamics can be major sources of stress. Sometimes small changes in how we approach our work can make a difference. What specific aspects of your work situation feel most challenging?",
        "Balancing work demands with personal wellbeing is an ongoing challenge for many people. Setting boundaries, practicing stress management techniques, and seeking support can all help. Which of these areas would be most helpful to discuss?",
        "Work-related stress is very common. Some find it helpful to identify what aspects are within their control to change, and develop acceptance strategies for elements that aren't. Would it help to talk through your specific work situation?"
      ];
      return workResponses[Math.floor(Math.random() * workResponses.length)];
    }
    
    // Talking about financial stress or concerns
    if (lowercaseMessage.match(/.*(money|financial|finances|debt|bills|afford|expensive|cost|budget|saving|income|salary|poor|rich|wealth).*/i)) {
      const financialResponses = [
        "Financial stress can significantly impact mental health. Many people experience worry or anxiety related to money matters. While I can't provide financial advice, we can discuss coping strategies for the emotional aspect of financial concerns.",
        "Money worries are a common source of stress. The uncertainty and pressure of financial challenges can affect our mental wellbeing in many ways. Would it help to talk about how financial concerns are impacting you emotionally?",
        "Financial stress affects many people and can create feelings of worry, shame, or helplessness. These emotions are normal responses to financial pressure. Would you like to discuss ways to cope with the psychological impact of financial concerns?",
        "I understand that financial issues can create significant stress. While I can't offer financial advice, I can provide a space to discuss the emotional burden of money worries and explore potential resources or coping strategies.",
        "The connection between financial wellbeing and mental health is strong. Financial stress can affect sleep, relationships, and overall mental state. Would it help to talk about strategies for managing the emotional impact of financial concerns?"
      ];
      return financialResponses[Math.floor(Math.random() * financialResponses.length)];
    }
    
    // Talking about self-care or personal growth
    if (lowercaseMessage.match(/.*(self-care|growth|development|improve|better|goal|change|habit|routine|practice|hobby|interest|passion).*/i)) {
      const selfCareResponses = [
        "Self-care is essential for mental wellbeing. It's about intentionally taking care of your physical, emotional, and mental health. What kinds of self-care activities resonate with you?",
        "Personal growth often happens when we practice self-awareness and intentional action. Small, consistent steps can lead to meaningful change over time. What area of growth feels most important to you right now?",
        "Building supportive habits and routines can create a foundation for wellbeing. It's often helpful to start small and build gradually. Would you like to discuss specific habits you're interested in developing?",
        "Exploring interests and passions can bring joy and meaning to life. These activities can also provide a sense of accomplishment and positive distraction during difficult times. What activities tend to engage you fully?",
        "Self-care looks different for everyone. What nourishes one person might not work for another. The key is finding what genuinely helps you feel restored and supported. Would you like to explore what effective self-care might look like for you?"
      ];
      return selfCareResponses[Math.floor(Math.random() * selfCareResponses.length)];
    }
    
    // Talking about physical health concerns
    if (lowercaseMessage.match(/.*(pain|sick|ill|headache|migraine|chronic|condition|diagnosis|symptom|doctor|medical|medication|treatment|disease|disorder).*/i)) {
      const healthResponses = [
        "Physical health and mental health are closely connected. Living with health challenges can affect our emotional wellbeing, and stress can impact physical symptoms. While I can't provide medical advice, I can certainly listen and offer support for the emotional aspects of health concerns.",
        "I understand that physical health issues can create significant stress and emotional challenges. While I'm not qualified to give medical advice, I'm here to provide a supportive space to discuss how these health concerns are affecting you emotionally.",
        "Dealing with physical health concerns can be really difficult. The uncertainty, discomfort, or limitations that come with health issues can affect our mental wellbeing. Would it help to talk about how these health challenges are impacting you emotionally?",
        "I appreciate you sharing about your health concerns. While I can't offer medical guidance, I can certainly listen and acknowledge how challenging health issues can be. Many people find it helpful to discuss both the practical and emotional aspects of managing health conditions.",
        "Physical health challenges can bring up many emotions - frustration, worry, sadness, or even grief. These feelings are valid parts of the health journey. Would it help to explore some approaches for managing the emotional aspects of physical health concerns?"
      ];
      return healthResponses[Math.floor(Math.random() * healthResponses.length)];
    }
    
    // Talking about food, nutrition, or eating habits
    if (lowercaseMessage.match(/.*(food|eat|eating|diet|nutrition|meal|hungry|appetite|weight|calories|healthy eating).*/i)) {
      const foodResponses = [
        "Our relationship with food can be connected to our emotional wellbeing. Finding an approach to eating that supports both physical and mental health is important. What aspects of food or eating would you like to discuss?",
        "Nutrition can influence mood and energy levels, which affects our overall mental state. At the same time, our emotions can impact our eating patterns. Would it help to explore how food and mood might be connected for you?",
        "Food is more than just fuel - it can be connected to comfort, culture, pleasure, and self-care. Finding a balanced, flexible approach to eating often supports mental wellbeing. What's your experience with the connection between food and your mental state?",
        "Our eating patterns and our emotional state often influence each other. Stress can change how we eat, and what we eat can affect our mood and energy. Would you like to discuss strategies for supporting wellbeing through nutrition?",
        "The relationship between food and mental health is complex and individual. Some people find that certain dietary approaches help support their mental wellness. What patterns have you noticed about how eating affects your mood or vice versa?"
      ];
      return foodResponses[Math.floor(Math.random() * foodResponses.length)];
    }
    
    // Talking about therapy, counseling or professional help
    if (lowercaseMessage.match(/.*(therapy|therapist|counseling|counselor|psychologist|psychiatrist|mental health professional|professional help|treatment).*/i)) {
      const therapyResponses = [
        "Seeking professional support like therapy or counseling can be incredibly valuable for mental health. A trained professional can provide personalized guidance and evidence-based strategies. Have you considered or tried professional mental health support before?",
        "Therapy comes in many forms - cognitive-behavioral, psychodynamic, humanistic, and more. Different approaches work better for different people and concerns. Would it be helpful to discuss what types of therapy might align with your needs?",
        "Working with a mental health professional can provide support, tools, and insights that might be difficult to access on your own. If you're considering therapy, many communities have options at various price points, including sliding scale services. Would you like to discuss ways to find a therapist?",
        "Professional mental health support can be valuable at any stage of life, not just during crisis. Many people find therapy helpful for personal growth, relationship skills, and developing resilience. What has you thinking about professional support right now?",
        "The relationship between you and a therapist is a key factor in effective therapy. It's okay to meet with different professionals until you find someone you feel comfortable with. Have you had any experiences with therapy or counseling that you'd like to share?"
      ];
      return therapyResponses[Math.floor(Math.random() * therapyResponses.length)];
    }
    
    // Talking about specific mental health conditions
    if (lowercaseMessage.match(/.*(depression|anxiety|bipolar|ocd|adhd|ptsd|trauma|eating disorder|addiction|phobia|panic attack|schizophrenia|autism).*/i)) {
      const conditionResponses = [
        "Mental health conditions are medical conditions that deserve care and support, just like physical health conditions. While I can provide general information, a healthcare provider can offer personalized guidance. Would you like to discuss resources or general information about this topic?",
        "Many people live with and manage mental health conditions. Treatment approaches often combine therapy, lifestyle changes, social support, and sometimes medication. What aspects of this condition are you most interested in learning about?",
        "Living with a mental health condition can be challenging, but with appropriate support and treatment, many people experience significant improvement in symptoms and quality of life. Would it help to talk about general coping strategies or resources?",
        "It's important to approach mental health conditions with both compassion and evidence-based information. Would you like to discuss general information about this condition, or are you looking for resources to learn more?",
        "Mental health conditions affect millions of people worldwide. While each person's experience is unique, connecting with others who share similar experiences can sometimes be helpful. Would you like to explore information about support groups or communities related to this topic?"
      ];
      return conditionResponses[Math.floor(Math.random() * conditionResponses.length)];
    }
    
    // Default responses for when no pattern matches
    const defaultResponses = [
      "Thank you for sharing that with me. Could you tell me more about how that's affecting you?",
      "I appreciate you opening up. How long have you been feeling this way?",
      "That's interesting to hear. How does that impact your daily life?",
      "I'm here to listen and support you. What would be most helpful for you right now?",
      "Thank you for expressing that. What do you think might be a good next step for you?",
      "I understand. Sometimes just talking things through can help provide clarity. Is there anything specific you'd like to explore further?",
      "I'm hearing what you're saying. Would it help to discuss some strategies that others have found useful in similar situations?",
      "Thank you for trusting me with that. Many people experience similar feelings or situations. What kind of support would feel most helpful right now?",
      "I appreciate your willingness to share. Sometimes naming our experiences helps us process them. Would you like to tell me more about this?",
      "I'm here to support you through this. Would it be helpful to explore some resources or strategies related to what you're experiencing?"
    ];
    
    // Select a random default response
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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

  return (
    <div className="mindmitra-container">
      <div className="chat-header">
        <h1><TranslatedText text="Chat with Mindmitra" /></h1>
        <button onClick={clearChat} className="clear-chat">
          <i className="fas fa-trash"></i>
          <TranslatedText text="Clear Chat" />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
            <div className="message-content">
              <TranslatedText text={message.text} />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isRateLimited}
        />
        <button type="submit" disabled={isRateLimited || !input.trim()}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>

      {isRateLimited && (
        <div className="cooldown-timer">
          <TranslatedText text={`Please wait ${Math.ceil(cooldownTime/1000)} seconds...`} />
        </div>
      )}
      
      <div className="suggested-questions">
        <h3>
          <i className="fas fa-lightbulb"></i>
          <TranslatedText text="Explore Mental Wellness Topics" />
        </h3>
        <div className="question-categories">
          <div className="category">
            <h4><i className="fas fa-brain"></i> <TranslatedText text="Mental Wellness" /></h4>
            <div className="question-chips">
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("What are some ways to manage anxiety?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Managing anxiety</span>
              </button>
              
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("I'm feeling stressed, what should I do?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Stress relief</span>
              </button>
              
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("How can I tell if I'm depressed?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Depression signs</span>
              </button>
            </div>
          </div>
          
          <div className="category">
            <h4><i className="fas fa-heart"></i> <TranslatedText text="Self-Care" /></h4>
            <div className="question-chips">
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("Can you suggest some breathing exercises?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Breathing exercises</span>
              </button>
              
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("What are some simple mindfulness practices?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Mindfulness</span>
              </button>
              
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("How can I improve my sleep?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Better sleep</span>
              </button>
            </div>
          </div>
          
          <div className="category">
            <h4><i className="fas fa-users"></i> <TranslatedText text="Relationships" /></h4>
            <div className="question-chips">
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("How can I set better boundaries with others?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Setting boundaries</span>
              </button>
              
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("Ways to build meaningful connections");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Building connections</span>
              </button>
            </div>
          </div>
          
          <div className="category">
            <h4><i className="fas fa-hand-holding-medical"></i> <TranslatedText text="Getting Help" /></h4>
            <div className="question-chips">
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("How do I know if I need therapy?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>When to seek therapy</span>
              </button>
              
              <button 
                className="question-chip"
                onClick={() => {
                  setInput("What types of therapy are available?");
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSendMessage(syntheticEvent);
                }}
              >
                <span>Types of therapy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mindmitra;