// Gladia API Service for Video Transcription
// API Key: f377096a-0765-4e02-bb60-238c38c8b4db

import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { analyzeSentiment } from './sentimentService';

const GLADIA_API_ENDPOINT = 'https://api.gladia.io/v2/transcription';
const GLADIA_API_KEY = 'f377096a-0765-4e02-bb60-238c38c8b4db';

/**
 * Transcribes a video file using the Gladia API
 * @param {File} videoFile - The video file to transcribe
 * @param {string} apiKey - Optional API key to override the default
 * @returns {Promise<object>} - The transcription result with metadata
 */
export const transcribeVideo = async (videoFile, apiKey = GLADIA_API_KEY) => {
  console.log('Transcribing video using Gladia API...');
  
  if (!videoFile) {
    throw new Error('No video file provided');
  }
  
  const formData = new FormData();
  formData.append('audio', videoFile);
  formData.append('language_behaviour', 'automatic single language');
  formData.append('toggle_diarization', true);
  formData.append('detect_language', true);
  formData.append('toggle_noise_reduction', true);
  
  try {
    const response = await axios.post(
      'https://api.gladia.io/audio/text/audio-transcription/',
      formData,
      {
        headers: {
          'x-gladia-key': apiKey,
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for larger files
        timeout: 300000, // 5 minutes
      }
    );
    
    console.log('Gladia API response status:', response.status);
    
    if (!response.data || !response.data.prediction) {
      console.error('Unexpected API response format:', response.data);
      throw new Error('Invalid API response from Gladia');
    }
    
    // Extract the transcription and metadata
    const result = {
      transcription: response.data.prediction,
      metadata: {
        language: response.data.language || 'Unknown',
        durationSeconds: response.data.audio_duration || 0,
        confidence: response.data.confidence || 0,
        wordCount: countWords(response.data.prediction)
      },
      transcriptionSource: 'gladia'
    };
    
    return result;
  } catch (error) {
    console.error('Gladia transcription error:', error);
    
    // Detailed error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error('API error details:', {
        status,
        data: errorData,
        headers: error.response.headers
      });
      
      let message;
      
      switch (status) {
        case 400:
          message = 'Invalid request format. Please check your video file.';
          break;
        case 401:
          message = 'API key is invalid or expired.';
          break;
        case 402:
          message = 'Payment required. API usage limit may have been reached.';
          break;
        case 413:
          message = 'Video file is too large for processing.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          message = 'Gladia API server error. Please try again later.';
          break;
        default:
          message = `API error: ${status}`;
      }
      
      throw new Error(`Gladia API error: ${message}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from Gladia API. Please check your internet connection.');
    } else {
      // Something happened in setting up the request
      throw new Error(`Transcription setup error: ${error.message}`);
    }
  }
};

/**
 * Process transcription data from Gladia API
 * @param {Object} data - The API response data
 * @returns {string} - Formatted transcription text
 */
const processGladiaTranscription = (data) => {
  try {
    // Check if we have the expected structure
    if (!data.transcription) {
      return 'No transcription data available';
    }
    
    // Combine all segments into a single text
    let fullText = '';
    
    if (data.transcription.segments && data.transcription.segments.length > 0) {
      // Sort segments by start time to ensure proper order
      const sortedSegments = [...data.transcription.segments].sort((a, b) => a.start - b.start);
      
      // Combine segments with proper spacing and punctuation
      fullText = sortedSegments.map(segment => segment.text.trim()).join(' ');
      
      // Fix double spaces
      fullText = fullText.replace(/\s{2,}/g, ' ');
    }
    
    return fullText || 'No transcription text available';
  } catch (error) {
    console.error('Error processing Gladia transcription:', error);
    return 'Error processing transcription data';
  }
};

/**
 * Extract useful metadata from the Gladia response
 * @param {Object} data - The API response data
 * @returns {Object} - Metadata object
 */
const extractGladiaMetadata = (data) => {
  const metadata = {
    language: data.transcription?.language || 'unknown',
    durationSeconds: data.transcription?.duration || 0,
    wordCount: 0,
    confidence: 0
  };
  
  // Calculate average confidence and word count
  if (data.transcription?.segments && data.transcription.segments.length > 0) {
    let totalConfidence = 0;
    let words = 0;
    
    data.transcription.segments.forEach(segment => {
      if (segment.words) {
        words += segment.words.length;
        segment.words.forEach(word => {
          totalConfidence += word.confidence || 0;
        });
      }
    });
    
    metadata.wordCount = words;
    metadata.confidence = words > 0 ? totalConfidence / words : 0;
  }
  
  return metadata;
};

/**
 * Save transcription results to Firestore
 * @param {string} userId - The user ID
 * @param {Object} results - The transcription results
 */
const saveTranscriptionResults = async (userId, results) => {
  try {
    const transcriptionRef = collection(db, 'users', userId, 'video-transcriptions');
    await addDoc(transcriptionRef, results);
    console.log('Transcription results saved to Firestore');
  } catch (error) {
    console.error('Error saving transcription results:', error);
  }
};

/**
 * Get transcription job status from Gladia
 * @param {string} jobId - The job ID to check
 * @returns {Promise<Object>} - Job status
 */
export const getTranscriptionStatus = async (jobId) => {
  try {
    const response = await fetch(`${GLADIA_API_ENDPOINT}/${jobId}`, {
      method: 'GET',
      headers: {
        'x-gladia-key': GLADIA_API_KEY,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking transcription status:', error);
    throw error;
  }
};

/**
 * Extract sentiment from transcription text
 * @param {string} transcriptionText - The transcription text
 * @returns {Object} - Basic sentiment analysis
 */
export const analyzeTextSentiment = (transcriptionText) => {
  // Simple word-based sentiment analysis
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'joy', 'exciting', 
                         'positive', 'love', 'like', 'enjoy', 'pleased', 'satisfied', 'optimistic',
                         'confident', 'calm', 'relaxed', 'peaceful'];
                         
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'depressed', 'anxious',
                         'worried', 'stress', 'negative', 'hate', 'dislike', 'angry', 'upset',
                         'frustrated', 'annoyed', 'tired', 'exhausted', 'pain', 'hurt'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Count occurrences of sentiment words
  const words = transcriptionText.toLowerCase().split(/\s+/);
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  // Calculate sentiment score (-1 to 1 scale)
  const totalSentimentWords = positiveCount + negativeCount;
  let sentimentScore = 0;
  
  if (totalSentimentWords > 0) {
    sentimentScore = (positiveCount - negativeCount) / totalSentimentWords;
  }
  
  // Determine sentiment category
  let sentiment = 'neutral';
  if (sentimentScore > 0.3) sentiment = 'positive';
  else if (sentimentScore < -0.3) sentiment = 'negative';
  
  return {
    sentiment,
    score: sentimentScore,
    positiveWords: positiveCount,
    negativeWords: negativeCount,
    wordCount: words.length
  };
};

/**
 * Processes the transcription result to extract additional insights
 * @param {string} transcription - The transcribed text
 * @returns {Promise<object>} - Sentiment analysis and other insights
 */
export const processTranscription = async (transcription) => {
  if (!transcription || transcription.trim() === '') {
    return {
      sentiment: {
        sentiment: 'neutral',
        score: 0,
        positiveWords: 0,
        negativeWords: 0
      }
    };
  }
  
  try {
    // Perform sentiment analysis
    const sentiment = await analyzeTextSentiment(transcription);
    
    // Generate mock emotion data based on sentiment for now
    // This can be replaced with actual emotion analysis later
    const emotions = generateEmotionsFromSentiment(sentiment);
    
    return {
      sentiment,
      emotions,
      dominantEmotion: getDominantEmotion(emotions)
    };
  } catch (error) {
    console.error('Error processing transcription:', error);
    throw new Error(`Failed to process transcription: ${error.message}`);
  }
};

/**
 * Extract metadata from the video file directly
 * @param {File} videoFile - The video file
 * @returns {Promise<object>} - Video metadata
 */
export const extractVideoMetadata = (videoFile) => {
  return new Promise((resolve) => {
    const metadata = {
      name: videoFile.name,
      type: videoFile.type,
      size: formatFileSize(videoFile.size),
      lastModified: new Date(videoFile.lastModified).toLocaleString()
    };
    
    // For audio duration and other properties, we need to create a temporary URL
    const url = URL.createObjectURL(videoFile);
    const audio = new Audio();
    
    audio.addEventListener('loadedmetadata', () => {
      metadata.duration = formatDuration(audio.duration);
      metadata.durationSeconds = audio.duration;
      URL.revokeObjectURL(url);
      resolve(metadata);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      // Just resolve with what we have if we can't get duration
      resolve(metadata);
    });
    
    audio.src = url;
  });
};

// Helper functions

/**
 * Count words in a text string
 * @param {string} text - The text to count words in
 * @returns {number} - Number of words
 */
function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Generate mock emotion data based on sentiment analysis
 * @param {object} sentiment - Sentiment analysis result
 * @returns {object} - Generated emotions
 */
function generateEmotionsFromSentiment(sentiment) {
  // Default neutral distribution
  let emotions = {
    calm: 50,
    stressed: 50,
    focused: 50,
    distracted: 50,
    energetic: 50,
    tired: 50
  };
  
  if (!sentiment) return emotions;
  
  // Adjust based on sentiment
  const sentimentScore = sentiment.score || 0;
  
  if (sentimentScore > 0) {
    // More positive sentiment
    emotions = {
      calm: 50 + sentimentScore * 30,
      stressed: 50 - sentimentScore * 30,
      focused: 50 + sentimentScore * 20,
      distracted: 50 - sentimentScore * 20,
      energetic: 50 + sentimentScore * 25,
      tired: 50 - sentimentScore * 25
    };
  } else if (sentimentScore < 0) {
    // More negative sentiment
    const absScore = Math.abs(sentimentScore);
    emotions = {
      calm: 50 - absScore * 30,
      stressed: 50 + absScore * 30,
      focused: 50 - absScore * 20,
      distracted: 50 + absScore * 20,
      energetic: 50 - absScore * 25,
      tired: 50 + absScore * 25
    };
  }
  
  // Ensure all values are between 0 and 100
  Object.keys(emotions).forEach(key => {
    emotions[key] = Math.max(0, Math.min(100, emotions[key]));
  });
  
  return emotions;
}

/**
 * Get the dominant emotion from emotions object
 * @param {object} emotions - Emotions with scores
 * @returns {string} - The dominant emotion
 */
function getDominantEmotion(emotions) {
  if (!emotions) return 'neutral';
  
  // Group emotions into positive/negative pairs
  const pairs = [
    { positive: 'calm', negative: 'stressed' },
    { positive: 'focused', negative: 'distracted' },
    { positive: 'energetic', negative: 'tired' }
  ];
  
  // Calculate which emotion is dominant in each pair
  const dominantEmotions = pairs.map(pair => {
    return emotions[pair.positive] >= emotions[pair.negative] 
      ? pair.positive 
      : pair.negative;
  });
  
  // Find the emotion with the highest absolute score
  const highestScore = Math.max(
    ...dominantEmotions.map(emotion => Math.abs(emotions[emotion] - 50))
  );
  
  // Find the emotion that has this highest score
  const dominantEmotion = dominantEmotions.find(
    emotion => Math.abs(emotions[emotion] - 50) === highestScore
  );
  
  return dominantEmotion || 'neutral';
} 