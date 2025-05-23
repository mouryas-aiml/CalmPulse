import React, { useState, useRef, useEffect } from 'react';
import './MindScan.css';
import TranslatedText from '../components/TranslatedText';
import { analyzeVideo, getMoodSuggestions } from '../services/videoAnalysisService';
import { analyzeText } from '../services/textAnalysisService';
import { performWebSearch, getFallbackMentalHealthResources } from '../services/searchService';
import SearchResults from '../components/SearchResults';
import { useAuth } from '../contexts/AuthContext';
import AudioTranscriber from '../components/AudioTranscriber';
import StressCalculator from '../components/StressCalculator';

function MindScan() {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('voice');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoAnalysisResults, setVideoAnalysisResults] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [apiKey, setApiKey] = useState('AIzaSyC18kaP9SmOj790Ut9mUU-YnPqqGmNk5pc');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Add new state variables for the removed Text tab functionality
  const [textApiError, setTextApiError] = useState(null);
  
  // Search functionality states
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { currentUser } = useAuth();
  
  // Create refs properly
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [videoSrc, setVideoSrc] = useState('');
  const [isVideoUploaded, setIsVideoUploaded] = useState(false);
  
  // Audio recording references
  const audioStreamRef = useRef(null);
  const audioMediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [audioSrc, setAudioSrc] = useState('');
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Speech to text state
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [useWebSpeechAPI, setUseWebSpeechAPI] = useState(true); // Default to using Web Speech API
  const GOOGLE_SPEECH_API_ENDPOINT = 'https://speech.googleapis.com/v1p1beta1/speech:recognize';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      // Call the text analysis service
      const results = await analyzeText('', currentUser?.uid);
      
      // Check if fallback mode was used
      if (results.usedFallback) {
        console.log("Used fallback local sentiment analysis");
      }
      
      // Map sentiment score to emotional state
      let sentiment = 'neutral';
      let emotions = [];
      
      if (results.sentiment.score >= 0.25) {
        sentiment = 'positive';
        emotions = ['content', 'optimistic', 'grateful'];
        if (results.sentiment.magnitude >= 1.0) {
          emotions = ['happy', 'excited', 'enthusiastic'];
        }
      } else if (results.sentiment.score <= -0.25) {
        sentiment = 'negative';
        emotions = ['sad', 'worried', 'frustrated'];
        if (results.sentiment.magnitude >= 1.0) {
          emotions = ['stressed', 'anxious', 'overwhelmed'];
        }
      } else {
        emotions = ['reflective', 'contemplative', 'balanced'];
      }
      
      // Generate suggestions based on sentiment
      let suggestions = [];
      
      if (sentiment === 'positive') {
        suggestions = [
          'Continue practices that maintain your positive state',
          'Share your positive energy with others who might need it',
          'Journal about what\'s working well in your life'
        ];
      } else if (sentiment === 'negative') {
        suggestions = [
          'Practice deep breathing or meditation for 5 minutes',
          'Try gentle physical activity like walking or stretching',
          'Connect with a supportive friend or family member'
        ];
      } else {
        suggestions = [
          'Consider practicing mindful breathing exercises',
          'Try journaling about your thoughts to gain clarity',
          'A short walk outdoors might help refresh your perspective'
        ];
      }
      
      setAnalysis({
        sentiment,
        emotions,
        suggestions,
        rawResults: results,
        usedFallback: results.usedFallback
      });
      
    } catch (error) {
      console.error('Text analysis error:', error);
      
      // Attempt to extract more specific Google API error message
      if (error.message && error.message.includes('{')) {
        try {
          const errorJson = error.message.substring(error.message.indexOf('{'));
          const parsedError = JSON.parse(errorJson);
        } catch (parseError) {
          console.log('Could not parse error message JSON');
        }
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // If already recording, stop it
        setIsRecording(false);
      return;
    } else {
      try {
        // Start recording with Web Speech API
        setIsRecording(true);
        setTranscription('');
        await browserSpeechRecognition();
        setIsRecording(false);
      } catch (error) {
        console.error('Error during voice recording:', error);
        alert(`Speech recognition error: ${error.message}. Please try again or use a different browser like Chrome or Edge.`);
        setIsRecording(false);
      }
    }
  };
  
  const convertSpeechToText = async (audioBlob) => {
    setIsTranscribing(true);
    
    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      
      // Create a promise to handle the FileReader async operation
      const readFileAsDataURL = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(audioBlob);
      });
      
      // Wait for the file to be read
      const dataURL = await readFileAsDataURL;
      const base64Data = dataURL.split(',')[1];
      
      console.log('Audio blob info:', {
        type: audioBlob.type,
        size: audioBlob.size
      });
      
      // Determine encoding based on audio type
      let encoding = 'LINEAR16';
      let sampleRateHertz = 48000;
      
      if (audioBlob.type.includes('webm')) {
        encoding = 'WEBM_OPUS';
      } else if (audioBlob.type.includes('mp3')) {
        encoding = 'MP3';
      } else if (audioBlob.type.includes('ogg')) {
        encoding = 'OGG_OPUS';
      } else if (audioBlob.type.includes('flac')) {
        encoding = 'FLAC';
      }
      
      console.log('Using encoding for Speech-to-Text:', encoding);
      
      // Prepare request for Google Cloud Speech-to-Text API
      const requestData = {
        config: {
          encoding: encoding,
          sampleRateHertz: sampleRateHertz,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'default',
          useEnhanced: true,
          audioChannelCount: 1
        },
        audio: {
          content: base64Data
        }
      };
      
      console.log('Sending audio to Google Cloud Speech-to-Text API with key:', apiKey ? "Key is set (length: " + apiKey.length + ")" : "No key");
      
      // Make API call to Google Cloud Speech-to-Text
      const response = await fetch(`${GOOGLE_SPEECH_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey  // Add additional header for API key
        },
        body: JSON.stringify(requestData)
      });
      
      const responseText = await response.text();
      console.log('Raw response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Google Speech API error:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        });
        
        // Try to extract specific error message
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          if (errorJson.error && errorJson.error.message) {
            errorMessage = `API error: ${errorJson.error.message}`;
          }
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
        }
        
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Google Speech API response:', data);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        throw new Error('Failed to parse API response. The service may be experiencing issues.');
      }
      
      // Extract transcription from response
      if (data.results && data.results.length > 0 && 
          data.results[0].alternatives && data.results[0].alternatives.length > 0) {
        const transcript = data.results[0].alternatives[0].transcript;
        
        if (transcript) {
          setTranscription(transcript);
          // We don't auto-analyze here, but wait for user to click the analyze button
        } else {
          console.warn('Empty transcript returned from API');
          setTranscription('(No speech detected. Please try again with clearer audio.)');
        }
      } else {
        console.warn('No results returned from API');
        setTranscription('(No speech detected. Please try again or use a different audio file.)');
      }
    } catch (error) {
      console.error('Error converting speech to text:', error);
      setTranscription('');
      
      // Offer to try Web Speech API when Google API fails
      if (window.confirm(`Failed to process audio with Google API: ${error.message}. Would you like to try using your browser's built-in speech recognition instead?`)) {
        setUseWebSpeechAPI(true);
        try {
          await browserSpeechRecognition();
        } catch (webSpeechError) {
          alert(`Browser speech recognition also failed: ${webSpeechError.message}. Please try again or use a different method.`);
          setShowApiKeyInput(true);
        }
      } else {
        alert(`Failed to process audio for transcription: ${error.message}. Please try again or use a different API key.`);
        setShowApiKeyInput(true);
      }
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const analyzeTranscribedText = (text) => {
    // Analyze the transcribed text
    setIsAnalyzing(true);
    
    // Simple sentiment detection for demo purposes
    const lowerText = text.toLowerCase();
    
    // Keywords for detecting sentiment and specific mental health topics
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'love', 'positive', 'wonderful', 'exciting', 'pleased', 'delighted', 'grateful'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'worry', 'stress', 'anxiety', 'depressed', 'unhappy', 'angry', 'fear', 'frustrated'];
    
    // Topic-specific keywords
    const stressWords = ['stress', 'overwhelm', 'pressure', 'burnout', 'exhausted', 'tension'];
    const anxietyWords = ['anxiety', 'panic', 'worry', 'nervous', 'anxious', 'fear', 'scared'];
    const breathingWords = ['breath', 'breathing', 'meditation', 'relax', 'calm'];
    const depressionWords = ['depress', 'hopeless', 'unmotivated', 'tired', 'alone', 'isolat'];
    
    // Count occurrences 
    let positiveCount = 0;
    let negativeCount = 0;
    let stressCount = 0;
    let anxietyCount = 0;
    let breathingCount = 0;
    let depressionCount = 0;
    
    // Count sentiment words
    positiveWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    });
    
    // Count topic-specific words
    stressWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) stressCount += matches.length;
    });
    
    anxietyWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) anxietyCount += matches.length;
    });
    
    breathingWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) breathingCount += matches.length;
    });
    
    depressionWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) depressionCount += matches.length;
    });
    
    // Detect if this is a question (looking for help)
    const isQuestion = lowerText.includes('?') || 
                       lowerText.includes('how') || 
                       lowerText.includes('what') || 
                       lowerText.includes('ways to') || 
                       lowerText.includes('help me') || 
                       lowerText.includes('can you');
    
    // Determine sentiment based on counts
    let sentiment, emotions, suggestions;
    
    // Check if this is a question about a specific mental health topic
    if (isQuestion) {
      // If it's a question, provide appropriate help based on the topic
      if (stressCount > 0) {
        sentiment = 'neutral';
        emotions = ['reflective', 'seeking help', 'proactive'];
        suggestions = [
          'Practice deep breathing: inhale for 4 counts, hold for 2, exhale for 6 counts',
          'Try progressive muscle relaxation, tensing and releasing each muscle group',
          'Take short breaks throughout the day to reset your nervous system'
        ];
      } else if (anxietyCount > 0) {
        sentiment = 'neutral';
        emotions = ['reflective', 'seeking help', 'proactive'];
        suggestions = [
          'Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste',
          'Practice deep breathing focused on extending your exhale',
          'Challenge anxious thoughts by asking: "What\'s the evidence for and against this thought?"'
        ];
      } else if (breathingCount > 0) {
        sentiment = 'neutral';
        emotions = ['reflective', 'seeking help', 'proactive'];
        suggestions = [
          'Try box breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4',
          'Practice 4-7-8 breathing: inhale for 4 counts, hold for 7, exhale for 8',
          'Use diaphragmatic breathing: place one hand on chest, one on stomach, breathe so only your stomach moves'
        ];
      } else if (depressionCount > 0) {
        sentiment = 'neutral';
        emotions = ['reflective', 'seeking help', 'proactive'];
        suggestions = [
          'Start with small, achievable daily goals to build momentum',
          'Try to get at least 30 minutes of natural light each day',
          'Consider reaching out to a mental health professional for support'
        ];
      } else if (positiveCount > negativeCount) {
        sentiment = 'positive';
        emotions = ['content', 'optimistic', 'grateful'];
        suggestions = [
          'Continue practices that maintain your positive state',
          'Share your positive energy with others who might need it',
          'Journal about what\'s working well in your life'
        ];
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        emotions = ['stressed', 'anxious', 'concerned'];
        suggestions = [
          'Practice deep breathing or meditation for 5 minutes',
          'Try gentle physical activity like walking or stretching',
          'Connect with a supportive friend or family member'
        ];
      } else {
        sentiment = 'neutral';
        emotions = ['reflective', 'contemplative', 'balanced'];
        suggestions = [
          'Consider practicing mindful breathing exercises',
          'Try journaling about your thoughts to gain clarity',
          'A short walk outdoors might help refresh your perspective'
        ];
      }
    } else {
      // If it's not a question, analyze sentiment as before
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        emotions = ['content', 'optimistic', 'grateful'];
        suggestions = [
          'Continue practices that maintain your positive state',
          'Share your positive energy with others who might need it',
          'Journal about what\'s working well in your life'
        ];
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        emotions = ['stressed', 'anxious', 'concerned'];
        suggestions = [
          'Practice deep breathing or meditation for 5 minutes',
          'Try gentle physical activity like walking or stretching',
          'Connect with a supportive friend or family member'
        ];
      } else {
        sentiment = 'neutral';
        emotions = ['reflective', 'contemplative', 'balanced'];
        suggestions = [
          'Consider practicing mindful breathing exercises',
          'Try journaling about your thoughts to gain clarity',
          'A short walk outdoors might help refresh your perspective'
        ];
      }
    }
    
    // Simulate brief analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysis({
        sentiment,
        emotions,
        suggestions,
        rawResults: {
          text: text,
          positiveWordCount: positiveCount,
          negativeWordCount: negativeCount,
          stressCount,
          anxietyCount,
          breathingCount,
          depressionCount,
          isQuestion,
          analysisMethod: 'contextual keyword analysis'
        }
      });
      
      // If this is a question, automatically trigger a web search for more resources
      if (isQuestion) {
        handleWebSearch(text);
      }
    }, 1500);
  };

  const handleApiKeySubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      alert('Please enter a valid API key');
      return;
    }
    
    // Basic validation for Google Cloud API key format (typically starts with "AIza")
    if (!apiKey.trim().startsWith('AIza')) {
      if (!window.confirm('The API key doesn\'t appear to be in the standard Google Cloud format. Continue anyway?')) {
        return;
      }
    }
    
    // Save API key for future use (in production, store securely)
    localStorage.setItem('speechToTextApiKey', apiKey);
    console.log('Saved new Speech-to-Text API key:', apiKey ? "Key saved (length: " + apiKey.length + ")" : "No key");
    
    // Process the most recent recording if available
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, {
        type: 'audio/webm'
      });
      try {
        await convertSpeechToText(blob);
      } catch (error) {
        console.error('Error transcribing with new API key:', error);
        alert(`Failed to transcribe with the new API key: ${error.message}`);
      }
    }
    
    setShowApiKeyInput(false);
  };
  
  // Load API key from storage on component mount or use the default one
  useEffect(() => {
    const savedApiKey = localStorage.getItem('speechToTextApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Use the default API key if none is saved
      setApiKey('AIzaSyC18kaP9SmOj790Ut9mUU-YnPqqGmNk5pc');
      // Save the default key to localStorage
      localStorage.setItem('speechToTextApiKey', 'AIzaSyC18kaP9SmOj790Ut9mUU-YnPqqGmNk5pc');
    }
  }, []);
  
  // Handle tab changes and initialize video
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    if (activeTab === 'video' && !isVideoUploaded && !videoSrc) {
      console.log('Initializing video stream for video tab');
      // Add a small delay before initializing to ensure component is fully mounted
      setTimeout(() => {
        startVideoStream();
      }, 300);
    }
    
    return () => {
      // Clean up resources when tab changes or component unmounts
      cleanup();
    };
  }, [activeTab, isVideoUploaded, videoSrc]);
  
  // Cleanup function to stop streams and release resources
  const cleanup = () => {
    console.log('Cleaning up resources');
    
    // Clean up video stream with additional error handling
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          console.log('Stopping video track:', track.kind);
          try {
            track.stop();
          } catch (trackError) {
            console.warn('Error stopping track:', trackError);
          }
        });
        videoRef.current.srcObject = null;
      }
      
      // Stop any active MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (recorderError) {
          console.warn('Error stopping MediaRecorder:', recorderError);
        }
      }
    } catch (videoError) {
      console.error('Error cleaning up video resources:', videoError);
    }
    
    // Clean up audio resources with error handling
    try {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => {
          console.log('Stopping audio track:', track.kind);
          try {
            track.stop();
          } catch (trackError) {
            console.warn('Error stopping audio track:', trackError);
          }
        });
        audioStreamRef.current = null;
      }
      
      if (audioMediaRecorderRef.current && audioMediaRecorderRef.current.state !== 'inactive') {
        try {
          audioMediaRecorderRef.current.stop();
        } catch (recorderError) {
          console.warn('Error stopping audio MediaRecorder:', recorderError);
        }
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } catch (audioError) {
      console.error('Error cleaning up audio resources:', audioError);
    }
    
    // Close audio context if it exists
    try {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    } catch (contextError) {
      console.error('Error closing audio context:', contextError);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Function to use browser's Web Speech API for speech recognition
  const browserSpeechRecognition = async () => {
    try {
      console.log('Using browser Web Speech API for transcription');
      setIsTranscribing(true);
      
      // Check if SpeechRecognition is available in this browser
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Your browser does not support the Web Speech API. Try using Chrome or Edge.');
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;
      
      return new Promise((resolve, reject) => {
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
          
          console.log('Web Speech API result:', transcript);
          setTranscription(transcript);
          resolve(transcript);
        };
        
        recognition.onerror = (event) => {
          console.error('Web Speech API error:', event.error);
          reject(new Error(`Speech recognition error: ${event.error}`));
        };
        
        recognition.start();
        
        // Stop after 30 seconds to prevent indefinite listening
        setTimeout(() => {
          if (recognition) {
            recognition.stop();
            if (!transcription) {
              reject(new Error('No speech detected within the time limit'));
            }
          }
        }, 30000);
      });
    } catch (error) {
      console.error('Browser speech recognition error:', error);
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };

  const startVideoStream = async () => {
    try {
      console.log('Starting video stream...');
      
      // Stop any existing stream first
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      // Reset MediaRecorder
      mediaRecorderRef.current = null;
      
      // Request camera and mic access with fallback options
      let stream;
      try {
        // First try with both video and audio
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
      } catch (initialError) {
        console.warn('Failed to get video+audio stream, trying video only:', initialError);
        // Fallback to video only if audio fails
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
      }
      
      console.log('Stream obtained:', stream);
      
      // Check if the video element exists
      if (videoRef.current) {
        console.log('Adding stream to video element');
        videoRef.current.srcObject = stream;
        
        // Use a promise-based approach to handle video playing
        try {
          // Wait for the metadata to load before playing
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
              console.log('Video is now playing');
              
              // Initialize MediaRecorder after video is successfully playing
              initializeMediaRecorder(stream);
            } catch (playError) {
              console.error('Error playing video after metadata loaded:', playError);
              // Some browsers require user interaction before playing
              alert('Please click on the video to start the camera preview');
              
              // Still initialize MediaRecorder even if play fails
              initializeMediaRecorder(stream);
            }
          };
        } catch (metadataError) {
          console.error('Error setting up metadata handler:', metadataError);
          // Try to initialize MediaRecorder anyway
          initializeMediaRecorder(stream);
        }
      } else {
        console.error('videoRef is null - video element not found in DOM');
        throw new Error('Video element not found');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check your permissions or try a different browser.');
    }
  };
  
  // Separate function to initialize the MediaRecorder
  const initializeMediaRecorder = (stream) => {
    try {
      // Try different MIME types based on browser support
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      
      let selectedMimeType = null;
      
      // Find the first supported MIME type
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('Using MIME type:', selectedMimeType);
          break;
        }
      }
      
      // Create the MediaRecorder with the supported type or default
      if (selectedMimeType) {
        mediaRecorderRef.current = new MediaRecorder(stream, {mimeType: selectedMimeType});
      } else {
        // Fallback to default
        console.log('No supported MIME types found, using default');
        mediaRecorderRef.current = new MediaRecorder(stream);
      }
      
      console.log('MediaRecorder created:', mediaRecorderRef.current.state);
      
      // Set up data handling with a more frequent timeslice
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data available event:', event.data.size);
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, creating blob...');
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, {
            type: selectedMimeType || 'video/webm'
          });
          
          const url = URL.createObjectURL(blob);
          setVideoSrc(url);
          setIsVideoUploaded(true);
          setIsVideoRecording(false);
          
          // Stop all tracks
          if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
          }
        } else {
          console.error('No recorded chunks available');
          setIsVideoRecording(false);
        }
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsVideoRecording(false);
        alert('Error during recording. Please try again.');
      };
    } catch (recorderError) {
      console.error('Error creating MediaRecorder:', recorderError);
      alert('Could not initialize video recording. Your browser may not support this feature.');
    }
  };

  const toggleVideoRecording = () => {
    console.log('Toggle video recording. Current state:', isVideoRecording);
    console.log('MediaRecorder:', mediaRecorderRef.current);
    
    if (isVideoRecording) {
      // Stop recording
      console.log('Stopping recording...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          console.log('Recording stopped');
        } catch (error) {
          console.error('Error stopping recording:', error);
          // Force state update even if error occurs
          setIsVideoRecording(false);
        }
      } else {
        console.error('Cannot stop recording: MediaRecorder is not active');
        setIsVideoRecording(false);
      }
    } else {
      // Start recording
      console.log('Starting recording...');
      recordedChunksRef.current = [];
      
      if (mediaRecorderRef.current) {
        try {
          // Request data every 1000ms (1 second) to ensure we capture data even if stop fails
          mediaRecorderRef.current.start(1000);
          console.log('Recording started with 1s timeslices');
          setIsVideoRecording(true);
          
          // Set a safety timeout to ensure recording stops even if button is not pressed
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              console.log('Safety timeout reached, stopping recording automatically');
              try {
                mediaRecorderRef.current.stop();
                setIsVideoRecording(false);
              } catch (err) {
                console.error('Error stopping recording in safety timeout:', err);
                setIsVideoRecording(false);
              }
            }
          }, 60000); // Auto-stop after 60 seconds max
        } catch (error) {
          console.error('Error starting recording:', error);
          alert('Failed to start recording. Please try refreshing the page.');
          setIsVideoRecording(false);
        }
      } else {
        console.error('Cannot start recording: MediaRecorder is not initialized');
        // Try reinitializing the stream and recorder
        alert('Preparing camera. Please wait a moment...');
        startVideoStream().then(() => {
          // Add a delay to ensure everything is initialized
          setTimeout(() => {
            if (mediaRecorderRef.current) {
              try {
                mediaRecorderRef.current.start(1000);
                setIsVideoRecording(true);
                console.log('Recording started after reinitializing');
              } catch (error) {
                console.error('Error starting recording after reinitializing:', error);
                alert('Could not start recording. Please try clicking the button again.');
              }
            } else {
              console.error('MediaRecorder still not initialized after stream restart');
              alert('Could not initialize recording. Please refresh the page.');
            }
          }, 2000); // Add a longer delay (2s) to ensure everything is properly initialized
        }).catch(error => {
          console.error('Failed to reinitialize video stream:', error);
          alert('Could not access camera. Please check your permissions.');
        });
      }
    }
  };

  const handleVideoUpload = async (event) =>
    {
      const file = event.target.files[0];
      if (!file) return;

      // Check file type
      if (!file.type.startsWith('video/')) {
        setVideoError('Please upload a valid video file');
        return;
      }

      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setVideoError('Video file size should be less than 100MB');
        return;
      }

      setVideoFile(file);
      setVideoSrc(URL.createObjectURL(file));
      setIsVideoUploaded(true);
      setVideoError(null);
    };

  const handleVideoAnalysis = async () => {
    if (!videoFile) {
      setVideoError('Please upload or record a video first');
      return;
    }

    setIsAnalyzing(true);
    setVideoError(null);
    setVideoAnalysisResults(null);

    try {
      // Check file size - files over 100MB might cause issues
      if (videoFile.size > 100 * 1024 * 1024) {
        setVideoError('Video file is too large. Please use a file smaller than 100MB for better results.');
        setIsAnalyzing(false);
        return;
      }
      
      // Check file type compatibility
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      if (!validVideoTypes.includes(videoFile.type)) {
        console.warn('Video file type may not be fully supported:', videoFile.type);
      }
      
      console.log('Analyzing video with Gladia transcription integration...');
      const results = await analyzeVideo(videoFile, currentUser?.uid);
      const moodSuggestions = getMoodSuggestions(results.emotions);
      
      setVideoAnalysisResults({
        ...results,
        ...moodSuggestions
      });
      
      console.log('Video analysis complete:', {
        transcriptionSource: results.transcriptionSource,
        transcriptionLength: results.transcription?.length || 0,
        hasSentiment: !!results.sentiment,
        usingMockEmotions: results.usingMockEmotions
      });
    } catch (error) {
      console.error('Video analysis error:', error);
      
      // Extract the most useful part of the error message for the user
      let errorMessage = 'Failed to analyze video. Please try again with a different video.';
      
      if (error.message) {
        if (error.message.includes('too large')) {
          errorMessage = 'Video file is too large. Please use a smaller video file.';
        } else if (error.message.includes('format') || error.message.includes('codec')) {
          errorMessage = 'Video format not supported. Please use MP4 or WebM format.';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('API key')) {
          errorMessage = 'API authorization error. Please contact support.';
        } else if (error.message.length < 100) {
          // Only use the actual error message if it's reasonably short
          errorMessage = error.message;
        }
      }
      
      setVideoError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderVideoAnalysisResults = () => {
    if (!videoAnalysisResults) return null;

    const { emotions, transcription, dominantEmotion, suggestions, sentiment, metadata, transcriptionSource, usingMockEmotions } = videoAnalysisResults;

  return (
      <div className="analysis-results glass-card" data-aos="fade-up" data-aos-duration="1000">
        <h3 data-aos="fade-right" data-aos-delay="200"><TranslatedText text="Video Analysis Results" /></h3>
        
        {usingMockEmotions && (
          <div className="mock-data-notice" data-aos="fade-in" data-aos-delay="300">
            <i className="fas fa-info-circle"></i>
            <p>
              <TranslatedText text="Note: Emotion analysis is approximate based on speech content. For better results, try a different video." />
            </p>
          </div>
        )}
        
        <div className="emotions-chart" data-aos="fade-up" data-aos-delay="400">
          <h4><TranslatedText text="Detected Emotions" /></h4>
          {Object.entries(emotions).map(([emotion, score], index) => (
            <div key={emotion} className="emotion-bar" data-aos="fade-right" data-aos-delay={500 + (index * 100)}>
              <span className="emotion-label">{emotion}</span>
              <div className="emotion-progress">
                <div 
                  className="emotion-fill"
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <span className="emotion-score">{Math.round(score)}%</span>
            </div>
          ))}
        </div>

        {transcription && (
          <div className="transcription-section" data-aos="fade-up" data-aos-delay="800">
            <h4>
              <TranslatedText text="Speech Transcription" />
              {transcriptionSource && (
                <span className="transcription-source">
                  {transcriptionSource === 'gladia' ? 
                    ' (via Gladia AI)' : 
                    ' (via Google Speech)'}
                </span>
              )}
            </h4>
            <p className="transcription-text">{transcription}</p>
            
            {metadata && (
              <div className="transcription-metadata" data-aos="fade-in" data-aos-delay="900">
                <span>Language: {metadata.language}</span>
                <span>Duration: {Math.round(metadata.durationSeconds)}s</span>
                {metadata.confidence > 0 && (
                  <span>Confidence: {(metadata.confidence * 100).toFixed(1)}%</span>
                )}
              </div>
            )}
          </div>
        )}
        
        {sentiment && (
          <div className="sentiment-section" data-aos="fade-up" data-aos-delay="1000">
            <h4><TranslatedText text="Speech Sentiment Analysis" /></h4>
            <div className="sentiment-result">
              <div className={`sentiment-indicator ${sentiment.sentiment}`}>
                <i className={sentiment.sentiment === 'positive' ? 'fas fa-smile' : 
                              sentiment.sentiment === 'negative' ? 'fas fa-frown' : 
                              'fas fa-meh'}></i>
                <span>{sentiment.sentiment === 'positive' ? 'Positive' : 
                      sentiment.sentiment === 'negative' ? 'Negative' : 
                      'Neutral'} Tone</span>
              </div>
              <div className="sentiment-stats" data-aos="fade-left" data-aos-delay="1100">
                <div className="sentiment-stat">
                  <span className="stat-label">Score:</span>
                  <span className="stat-value">{sentiment.score.toFixed(2)}</span>
                </div>
                <div className="sentiment-stat">
                  <span className="stat-label">Positive Words:</span>
                  <span className="stat-value">{sentiment.positiveWords}</span>
                </div>
                <div className="sentiment-stat">
                  <span className="stat-label">Negative Words:</span>
                  <span className="stat-value">{sentiment.negativeWords}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="suggestions-section" data-aos="fade-up" data-aos-delay="1200">
          <h4><TranslatedText text="Recommendations" /></h4>
          <p><TranslatedText text="Based on your dominant emotion:" /> <strong>{dominantEmotion}</strong></p>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} data-aos="fade-left" data-aos-delay={1300 + (index * 100)}>{suggestion}</li>
            ))}
          </ul>
        </div>
        
        <div className="video-analysis-actions" data-aos="fade-up" data-aos-delay="1600">
          <button 
            className="retry-btn gradient-bg-light"
            onClick={() => {
              setVideoAnalysisResults(null);
              setVideoError(null);
            }}
          >
            <i className="fas fa-redo"></i>
            <TranslatedText text="Try Another Analysis" />
          </button>
          
          <button 
            className="health-resources-btn gradient-bg-info"
            onClick={() => transcription && handleWebSearch(transcription)}
            disabled={!transcription}
          >
            <i className="fas fa-heartbeat"></i>
            <TranslatedText text="Find Health Resources" />
          </button>
        </div>
      </div>
    );
  };

  // Helper function to create a WAV file from PCM data
  const createWavFile = (channelData, sampleRate) => {
    const numChannels = channelData.length;
    const length = channelData[0].length;
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, length * numChannels * 2, true);
    
    // Write the PCM samples
    const offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + (i * numChannels + channel) * 2, value, true);
      }
    }
    
    return buffer;
  };
  
  // Helper function to write a string to a DataView
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Function to perform internal web search
  const handleWebSearch = async (text) => {
    if (!text || text.trim() === '') return;
    
    // Set search query and show loading state
    const query = text.trim();
    setSearchQuery(query);
    setIsSearching(true);
    setShowSearchResults(true); // We will display inline instead of overlay
    setSearchError(null);
    
    try {
      // Perform the search using our service
      console.log('Performing web search for:', query);
      const results = await performWebSearch(query);
      
      if (results.success) {
        console.log('Search successful, found results:', {
          textResults: results.textResults?.length || 0,
          videoResults: results.videoResults?.length || 0
        });
        setSearchResults(results);
      } else {
        // If web search fails, use our fallback resources without showing an error
        console.log('Web search failed, using fallback resources');
        const fallbackResults = getFallbackMentalHealthResources(query);
        
        console.log('Fallback resources:', {
          textResults: fallbackResults.textResults?.length || 0,
          videoResults: fallbackResults.videoResults?.length || 0
        });
        
        setSearchResults({
          ...fallbackResults,
          // Add a notice that these are helpful resources without mentioning API errors
          textResults: [
            {
              title: `Health Resources for "${query}"`,
              snippet: "Here are some resources that might help with your question.",
              link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
              isFallbackNotice: true
            },
            ...fallbackResults.textResults
          ]
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      // Use fallback resources without mentioning the error
      const fallbackResults = getFallbackMentalHealthResources(query);
      setSearchResults(fallbackResults);
    } finally {
      setIsSearching(false);
    }
  };

  return (
      <div className="mindscan-container">
      <div className="mindscan-header" data-aos="fade-down" data-aos-duration="1200">
        <h1><TranslatedText text="AI Health Analysis" as="span" /></h1>
        <p><TranslatedText text="Share your thoughts, voice, or expressions for personalized mental health insights." /></p>
      </div>
      
      {/* Real-time Stress Calculator */}
      <StressCalculator />
      
      <div className="mindscan-content">
        <div className="tabs" data-aos="fade-up" data-aos-duration="800" data-aos-delay="300">
          <button 
            className={activeTab === 'voice' ? 'active' : ''} 
            onClick={() => setActiveTab('voice')}
          >
            <i className="fas fa-microphone-alt"></i>
            <TranslatedText text="Voice" />
          </button>
          <button 
            className={activeTab === 'video' ? 'active' : ''} 
            onClick={() => setActiveTab('video')}
          >
            <i className="fas fa-video"></i>
            <TranslatedText text="Video" />
          </button>
        </div>
        
        {/* Voice Input Section */}
        {activeTab === 'voice' && (
          <div className="voice-input-section glass-card" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
            <div className="voice-instructions" data-aos="fade-up" data-aos-delay="500">
              <h3><TranslatedText text="Express Yourself Through Voice" as="span" /></h3>
              <p><TranslatedText text="Speak freely about how you're feeling or upload an audio file. Our AI will analyze your tone, emotion, and content to provide insights." /></p>
            </div>
            
            <div className="input-methods-tabs" data-aos="fade-up" data-aos-delay="600">
              <button 
                className={`input-method-tab ${!audioSrc && !transcription ? 'active gradient-bg-primary' : ''}`} 
                onClick={() => {
                  setAudioSrc('');
                  setTranscription('');
                }}
              >
                <i className="fas fa-microphone-alt"></i>
                <TranslatedText text="Record Voice" />
              </button>
              <button 
                className={`input-method-tab ${audioSrc && !transcription ? 'active gradient-bg-primary' : ''}`}
                onClick={() => {
                  setAudioSrc('');
                  setTranscription('');
                }}
              >
                <i className="fas fa-cloud-upload-alt"></i>
                <TranslatedText text="Upload Audio" />
              </button>
            </div>
            
            {!audioSrc && !transcription ? (
              // Show the audio recording interface
              <div className="voice-input-options" data-aos="zoom-in" data-aos-delay="700">
                <button 
                className={`record-btn ${isRecording ? 'recording pulse' : ''} gradient-bg-primary`}
                  onClick={toggleVoiceRecording}
                  disabled={!!audioSrc}
                >
                  <i className={`fas ${isRecording ? 'fa-stop-circle' : 'fa-microphone-alt'}`}></i>
                  {isRecording ? 
                    <TranslatedText text="Stop Recording" /> : 
                    <TranslatedText text="Start Recording" />
                  }
              </button>
                
                <div className="browser-api-info" style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                  <TranslatedText text="Using Browser Speech API (Chrome/Edge)" />
            </div>
        </div>
            ) : null}
            
            {/* Add the AudioTranscriber component for file uploads */}
            <AudioTranscriber 
              onTranscriptionComplete={(transcript, metadata) => {
                setTranscription(transcript);
                // You can use the metadata for additional display information
                console.log('Transcription metadata:', metadata);
              }}
              apiKey="f377096a-0765-4e02-bb60-238c38c8b4db"
            />
            
            {canvasRef && (
              <canvas 
                ref={canvasRef} 
                className={`audio-visualizer ${isRecording ? 'active' : ''}`}
                width="600"
                height="100"
                data-aos="fade-in"
                data-aos-delay="800"
              ></canvas>
            )}
            
            {audioSrc && (
              <div className="audio-playback">
                <audio src={audioSrc} controls className="audio-player"></audio>
                <button 
                  className="new-recording-btn"
                  onClick={() => {
                    setAudioSrc('');
                    setTranscription('');
                  }}
                >
                  <i className="fas fa-redo"></i>
                  <TranslatedText text="New Recording" />
                </button>
              </div>
            )}
            
            {isTranscribing && (
              <div className="transcribing-indicator">
                <div className="spinner"></div>
                <p><TranslatedText text="Transcribing your speech..." /></p>
              </div>
            )}
            
            {transcription && (
              <div className="transcription-result glass-card" data-aos="fade-up" data-aos-duration="800">
                <h4 data-aos="fade-right" data-aos-delay="200"><TranslatedText text="Your Transcribed Speech:" as="span" /></h4>
                <p data-aos="fade-in" data-aos-delay="400">{transcription}</p>
                <div className="transcription-actions" data-aos="fade-up" data-aos-delay="600">
                  <button 
                    className="analyze-voice-btn gradient-bg-primary"
                    onClick={() => analyzeTranscribedText(transcription)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 
                      <><i className="fas fa-spinner fa-spin"></i> <TranslatedText text="Analyzing..." /></> : 
                      <><i className="fas fa-brain"></i> <TranslatedText text="Analyze My Mental Health" /></>
                    }
                  </button>
                  <button 
                    className="health-resources-btn gradient-bg-info"
                    onClick={() => handleWebSearch(transcription)}
                  >
                    <i className="fas fa-heartbeat"></i>
                    <TranslatedText text="Find Health Resources" />
                  </button>
                  <button className="reset-btn gradient-bg-light" onClick={() => {
                    setAudioSrc('');
                    setTranscription('');
                  }}>
                    <i className="fas fa-redo-alt"></i> <TranslatedText text="New Recording" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Add a troubleshooting message if there's an error */}
            {!transcription && audioSrc && (
              <div className="transcription-troubleshooting">
                <p className="error-message"><i className="fas fa-exclamation-triangle"></i> <TranslatedText text="Couldn't transcribe audio. This may be due to your browser or microphone settings." /></p>
                
                {/* Add fallback manual transcription option */}
                <div className="fallback-transcription">
                  <p><TranslatedText text="You can manually enter what you said:" /></p>
            <textarea 
                    placeholder="Type what you said in the recording..."
                    className="fallback-textarea"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      borderRadius: '5px',
                      minHeight: '100px',
                      margin: '10px 0' 
                    }}
                    onChange={(e) => setTranscription(e.target.value)}
                  ></textarea>
                  <div className="fallback-submit-actions">
                    <button 
                      className="fallback-submit-btn analyze-voice-btn"
                      onClick={() => {
                        if (transcription && transcription.trim().length > 10) {
                          analyzeTranscribedText(transcription);
                        } else {
                          alert('Please enter at least 10 characters.');
                        }
                      }}
                    >
                      <i className="fas fa-check-circle"></i> <TranslatedText text="Use This Text" />
                    </button>
                    <button 
                      className="fallback-search-btn health-resources-btn"
                      onClick={() => {
                        if (transcription && transcription.trim().length > 0) {
                          handleWebSearch(transcription);
                        } else {
                          alert('Please enter some text to search.');
                        }
                      }}
                    >
                      <i className="fas fa-heartbeat"></i> <TranslatedText text="Find Health Resources" />
                    </button>
                  </div>
                </div>
                
                <div className="troubleshoot-options">
                  <button className="troubleshoot-btn" onClick={() => {
                    alert("Web Speech API Troubleshooting:\n\n1. Make sure you're using Chrome or Edge browser\n2. Check that your microphone is properly connected and has permission\n3. Speak clearly and reduce background noise\n4. For uploaded files, ensure your speakers are on and microphone can hear them");
                  }}>
                    <i className="fas fa-tools"></i> <TranslatedText text="Troubleshooting Tips" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Video Input Section */}
        {activeTab === 'video' && (
          <div className="video-section glass-card" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
            <div className="video-container" data-aos="zoom-in" data-aos-delay="500">
              {videoSrc ? (
                <video 
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  className="video-preview"
                />
              ) : (
                <div className="video-placeholder animated-bg">
                  <i className="fas fa-video float"></i>
                  <p><TranslatedText text="Upload or record a video" /></p>
                </div>
              )}
            </div>

            <div className="video-controls" data-aos="fade-up" data-aos-delay="600">
              <div className="upload-controls">
                <label className="upload-btn gradient-bg-info">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <TranslatedText text="Upload Video" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                <button 
                  className={`record-btn ${isVideoRecording ? 'recording pulse' : ''} gradient-bg-primary`}
                  onClick={toggleVideoRecording}
                >
                  <i className={`fas ${isVideoRecording ? 'fa-stop-circle' : 'fa-video'}`}></i>
                  <TranslatedText text={isVideoRecording ? 'Stop Recording' : 'Start Recording'} />
              </button>
              </div>

              {videoSrc && (
                <div className="analysis-controls" data-aos="fade-up" data-aos-delay="700">
              <button 
                    className="analyze-btn gradient-bg-primary"
                    onClick={handleVideoAnalysis}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <TranslatedText text="Analyzing..." />
                      </>
                    ) : (
                      <>
                        <i className="fas fa-brain"></i>
                        <TranslatedText text="Analyze Video" />
                      </>
                    )}
                  </button>

                  <button 
                    className="reset-btn gradient-bg-light"
                    onClick={() => {
                      setVideoSrc('');
                      setVideoFile(null);
                      setIsVideoUploaded(false);
                      setVideoAnalysisResults(null);
                      setVideoError(null);
                    }}
                  >
                    <i className="fas fa-redo-alt"></i>
                    <TranslatedText text="Reset" />
              </button>
            </div>
              )}
        </div>

            {videoError && (
              <div className="error-message" data-aos="fade-in">
                <i className="fas fa-exclamation-circle"></i>
                {videoError}
              </div>
            )}

            {renderVideoAnalysisResults()}
          </div>
        )}
        
        {/* Analysis Results */}
        {analysis && (
          <div className="analysis-results glass-card" data-aos="fade-up" data-aos-duration="1000">
            <h2 data-aos="fade-right" data-aos-delay="200"><TranslatedText text="Your Mental Health Analysis" as="span" /></h2>
            
            {analysis.usedFallback && (
              <div className="fallback-notice" data-aos="fade-in" data-aos-delay="300" style={{ 
                padding: '15px', 
                marginBottom: '20px', 
                background: 'linear-gradient(135deg, #fff8e1, #fffde7)', 
                borderLeft: '4px solid #ffc107', 
                borderRadius: '8px',
                color: '#856404',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <i className="fas fa-exclamation-triangle"></i>
                <TranslatedText text="Using simplified local analysis due to API connectivity issues. Results may be less accurate." />
              </div>
            )}
            
            <div className="analysis-summary" data-aos="fade-up" data-aos-delay="400">
                <div className="sentiment-indicator">
                <div className={`sentiment-icon ${analysis.sentiment}`}>
                  <i className={`fas ${
                    analysis.sentiment === 'positive' ? 'fa-smile-beam' : 
                    analysis.sentiment === 'negative' ? 'fa-sad-tear' : 
                    'fa-meh'
                  }`}></i>
                  </div>
                <h3>
                  <TranslatedText 
                    text={analysis.sentiment === 'positive' ? 'Positive Outlook' : 
                         analysis.sentiment === 'negative' ? 'Challenging Emotions' :
                         'Balanced State'}
                    as="span" 
                  />
                </h3>
              </div>

              <div className="emotions-detected" data-aos="fade-left" data-aos-delay="500">
                <h4><TranslatedText text="Emotions Detected:" as="span" /></h4>
                <div className="emotion-tags">
                  {analysis.emotions.map((emotion, index) => (
                    <span key={index} className="emotion-tag" data-aos="zoom-in" data-aos-delay={600 + (index * 100)}>
                      {emotion}
                    </span>
                  ))}
                </div>
                </div>
              </div>

            {/* Conditional display based on sentiment */}
            {analysis.sentiment === 'positive' && (
              <div className="sentiment-specific-content animated-bg" data-aos="fade-up" data-aos-delay="800" style={{
                background: 'linear-gradient(135deg, #e6f7ff, #f0fff4)',
                borderRadius: 'var(--border-radius)',
                padding: '20px',
                marginBottom: '25px',
                borderLeft: '4px solid #4caf50',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
              }}>
                <h4 style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-sun"></i>
                  <TranslatedText text="Positive Mental State Insights" />
                </h4>
                <p style={{ marginBottom: '15px', fontSize: '1.05rem' }}>
                  Your words reflect a positive outlook. This state of mind can enhance cognitive flexibility, 
                  creativity, and resilience. Research shows that positive emotions can broaden attention and 
                  thought processes, leading to better problem-solving and relationship building.
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '15px',
                  flexWrap: 'wrap',
                  marginTop: '15px'
                }}>
                  <div style={{ 
                    flex: '1 1 calc(33% - 15px)', 
                    minWidth: '250px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <h5 style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fas fa-brain"></i> Cognitive Benefits
                    </h5>
                    <ul style={{ paddingLeft: '20px', margin: '0' }}>
                      <li>Enhanced problem-solving abilities</li>
                      <li>Improved creative thinking</li>
                      <li>Better attention and focus</li>
                    </ul>
                  </div>
                  <div style={{ 
                    flex: '1 1 calc(33% - 15px)', 
                    minWidth: '250px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <h5 style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fas fa-heartbeat"></i> Physical Benefits
                    </h5>
                    <ul style={{ paddingLeft: '20px', margin: '0' }}>
                      <li>Lower stress hormones</li>
                      <li>Improved immune function</li>
                      <li>Better sleep quality</li>
                    </ul>
                  </div>
                  <div style={{ 
                    flex: '1 1 calc(33% - 15px)', 
                    minWidth: '250px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <h5 style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fas fa-users"></i> Social Benefits
                    </h5>
                    <ul style={{ paddingLeft: '20px', margin: '0' }}>
                      <li>Stronger social connections</li>
                      <li>More effective communication</li>
                      <li>Increased empathy</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {analysis.sentiment === 'negative' && (
              <div className="sentiment-specific-content animated-bg" data-aos="fade-up" data-aos-delay="800" style={{
                background: 'linear-gradient(135deg, #fff5f5, #fdf2f2)',
                borderRadius: 'var(--border-radius)',
                padding: '20px',
                marginBottom: '25px',
                borderLeft: '4px solid #f44336',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
              }}>
                <h4 style={{ color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-cloud-rain"></i>
                  <TranslatedText text="Emotional Challenge Assessment" />
                </h4>
                <p style={{ marginBottom: '15px', fontSize: '1.05rem' }}>
                  Your expressions indicate you may be experiencing some challenging emotions. 
                  It's important to remember that difficult feelings are a normal part of human experience. 
                  Acknowledging these emotions is an important first step toward managing them effectively.
                </p>
                <div style={{ 
                  background: 'white', 
                  padding: '15px', 
                  borderRadius: '8px',
                  marginTop: '15px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  <h5 style={{ color: '#c62828', marginBottom: '10px' }}>Common Thought Patterns</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ 
                      padding: '8px 12px', 
                      background: 'rgba(244, 67, 54, 0.08)', 
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}>All-or-nothing thinking</div>
                    <div style={{ 
                      padding: '8px 12px', 
                      background: 'rgba(244, 67, 54, 0.08)', 
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}>Catastrophizing</div>
                    <div style={{ 
                      padding: '8px 12px', 
                      background: 'rgba(244, 67, 54, 0.08)', 
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}>Filtering out positives</div>
                    <div style={{ 
                      padding: '8px 12px', 
                      background: 'rgba(244, 67, 54, 0.08)', 
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}>Emotional reasoning</div>
                  </div>
                  <h5 style={{ color: '#c62828', marginBottom: '10px' }}>Immediate Relief Strategies</h5>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li>Practice deep breathing (4 seconds in, hold 2, 6 seconds out)</li>
                    <li>Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste</li>
                    <li>Engage in gentle physical movement for 5-10 minutes</li>
                    <li>Reach out to a trusted person to talk about your feelings</li>
                  </ul>
                </div>
              </div>
            )}

            {analysis.sentiment === 'neutral' && (
              <div className="sentiment-specific-content" style={{
                background: 'linear-gradient(135deg, #f9f9ff, #f5f5f5)',
                borderRadius: 'var(--border-radius)',
                padding: '20px',
                marginBottom: '25px',
                borderLeft: '4px solid #9e9e9e',
                boxShadow: '0 4px 12px rgba(158, 158, 158, 0.15)'
              }}>
                <h4 style={{ color: '#424242', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-balance-scale"></i>
                  <TranslatedText text="Balanced Mindset Analysis" />
                </h4>
                <p style={{ marginBottom: '15px', fontSize: '1.05rem' }}>
                  Your language suggests a balanced emotional state – neither strongly positive nor negative. 
                  This equilibrium can be a stable foundation for mindfulness and thoughtful decision-making. 
                  It can also indicate a contemplative or reflective state of mind.
                </p>
                
                <div style={{ 
                  display: 'flex',
                  gap: '15px',
                  marginTop: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    flex: '1 1 calc(50% - 15px)', 
                    minWidth: '300px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <h5 style={{ color: '#424242', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fas fa-lightbulb"></i> Mindfulness Opportunities
                    </h5>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                      Your current balanced state creates an excellent opportunity for mindfulness practice. 
                      Consider taking 5-10 minutes to engage in a mindful activity like focused breathing or 
                      a body scan meditation to further enhance your awareness and presence.
                    </p>
                  </div>
                  <div style={{ 
                    flex: '1 1 calc(50% - 15px)', 
                    minWidth: '300px',
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <h5 style={{ color: '#424242', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <i className="fas fa-compass"></i> Direction Setting
                    </h5>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                      A balanced mental state is ideal for evaluating priorities and setting intentions.
                      Consider what activities would be most meaningful to you right now, and how you might
                      direct your energy in alignment with your values and goals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="suggestions-section" data-aos="fade-up" data-aos-delay="1000">
              <h4><i className="fas fa-lightbulb" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i><TranslatedText text="Recommended Coping Strategies:" as="span" /></h4>
                <ul className="suggestions-list">
                  {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} data-aos="fade-left" data-aos-delay={1100 + (index * 100)}>
                    <TranslatedText text={suggestion} />
                  </li>
                  ))}
                </ul>
              </div>

            <div className="next-steps" data-aos="fade-up" data-aos-delay="1400">
              <p><TranslatedText text="Would you like to:" /></p>
              <div className="next-step-buttons">
                <button className="next-step-btn gradient-bg-success" data-aos="zoom-in" data-aos-delay="1500">
                  <i className="fas fa-tools"></i>
                  <TranslatedText text="Try Coping Tools" />
                </button>
                <button className="next-step-btn gradient-bg-primary" data-aos="zoom-in" data-aos-delay="1600" style={{ background: 'linear-gradient(135deg, #6a5acd, #4c3e9d)' }}>
                  <i className="fas fa-comments"></i>
                  <TranslatedText text="Chat with Mindmitra" />
                </button>
                <button className="next-step-btn gradient-bg-info" data-aos="zoom-in" data-aos-delay="1700" style={{ background: 'linear-gradient(135deg, #4285f4, #3367d6)' }}>
                  <i className="fas fa-user-md"></i>
                  <TranslatedText text="Find a Therapist" />
                </button>
                {/* Add debug button for developers */}
                <button 
                  className="debug-btn" 
                  style={{ 
                    marginTop: '10px', 
                    fontSize: '0.8rem', 
                    opacity: 0.7,
                    background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
                    color: '#555',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onClick={() => {
                    if (analysis.rawResults) {
                      console.log('Raw API results:', analysis.rawResults);
                      alert('API results have been logged to console.');
                    }
                  }}
                >
                  <i className="fas fa-bug"></i>
                  <span>Debug API Response</span>
                </button>
              </div>
            </div>

            {/* Add Health Resources section right after the next-steps section */}
            {showSearchResults && searchResults && (
              <div className="inline-health-resources">
                <h3><i className="fas fa-heart" style={{ marginRight: '8px', color: '#558b2f' }}></i><TranslatedText text="Relevant Health Resources" /></h3>
                <SearchResults 
                  results={searchResults}
                  isLoading={isSearching}
                  error={searchError}
                  query={searchQuery}
                  onClose={() => setShowSearchResults(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MindScan; 