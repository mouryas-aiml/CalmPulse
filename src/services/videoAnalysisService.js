import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { transcribeVideo, processTranscription as processGladiaTranscription } from './gladiaService';

const API_ENDPOINT = 'https://videointelligence.googleapis.com/v1/videos:annotate';

export const analyzeVideo = async (videoFile, userId) => {
  try {
    // Get API key from localStorage
    const API_KEY = localStorage.getItem('videoApiKey');
    if (!API_KEY) {
      console.error('No Video Analysis API key found in localStorage');
      // Try to use a default key for demonstration purposes
      const defaultKey = 'AIzaSyC18kaP9SmOj790Ut9mUU-YnPqqGmNk5pc';
      console.log('Using default API key for video analysis');
      // Don't throw error yet, try with default key first
    }

    // First, get transcription from Gladia API
    console.log('Starting video analysis with Gladia transcription...');
    let transcriptionResult;
    let transcriptionText = '';
    
    try {
      // Use the new transcribeVideo function from gladiaService
      transcriptionResult = await transcribeVideo(videoFile);
      transcriptionText = transcriptionResult.transcription || '';
      console.log('Gladia transcription successful:', transcriptionText.substring(0, 100) + '...');
    } catch (error) {
      console.error('Error using Gladia for transcription:', error);
      console.log('Falling back to standard transcription method...');
    }

    // Process the transcription to get sentiment and emotions
    let transcriptionAnalysis = null;
    let usingMockEmotions = false;
    
    if (transcriptionText) {
      try {
        transcriptionAnalysis = await processGladiaTranscription(transcriptionText);
        usingMockEmotions = true;
        console.log('Generated emotion data from transcription sentiment');
      } catch (analysisError) {
        console.error('Error processing transcription:', analysisError);
      }
    }
    
    // If we have transcription analysis, we can provide results now without using Google API
    if (transcriptionAnalysis) {
      const results = {
        emotions: transcriptionAnalysis.emotions,
        transcription: transcriptionText,
        sentiment: transcriptionAnalysis.sentiment,
        dominantEmotion: transcriptionAnalysis.dominantEmotion,
        metadata: transcriptionResult?.metadata || null,
        timestamp: serverTimestamp(),
        transcriptionSource: 'gladia',
        usingMockEmotions
      };
      
      // Save results to Firestore if userId is provided
      if (userId) {
        try {
          await saveAnalysisResults(userId, results);
          console.log('Analysis results saved to Firestore');
        } catch (saveError) {
          console.error('Error saving results to Firestore:', saveError);
          // Don't fail the entire function if save fails
        }
      }
      
      console.log('Returning analysis with Gladia transcription');
      return results;
    }

    // If we don't have transcription or couldn't process it, try Google API
    console.log('Proceeding with Google Video Intelligence API for full analysis...');
    
    // Convert video file to base64 for emotion analysis
    console.log('Converting video to base64 for emotion analysis...');
    let base64Video;
    try {
      base64Video = await fileToBase64(videoFile);
      console.log('Video converted to base64 successfully, length:', base64Video?.length || 0);
    } catch (conversionError) {
      console.error('Error converting video to base64:', conversionError);
      throw new Error('Failed to convert video for analysis. Please try a different video file.');
    }

    // Use API key from localStorage or default
    const effectiveApiKey = API_KEY || 'AIzaSyC18kaP9SmOj790Ut9mUU-YnPqqGmNk5pc';
    
    // Prepare the request body
    const requestBody = {
      inputContent: base64Video,
      features: [
        'FACE_DETECTION',
        'PERSON_DETECTION',
        'EMOTION_DETECTION'
      ],
      videoContext: {
        speechTranscriptionConfig: {
          languageCode: 'en-US',
          enableAutomaticPunctuation: true
        }
      }
    };

    console.log('Making Google Cloud Video Intelligence API request...');
    
    // Make API request for emotion analysis
    const response = await fetch(`${API_ENDPOINT}?key=${effectiveApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Video API error:', errorText);
      
      if (transcriptionText) {
        // Fall back to mock emotion data if we have transcription but Google API failed
        try {
          const fallbackAnalysis = await processGladiaTranscription(transcriptionText);
          
          const results = {
            emotions: fallbackAnalysis.emotions,
            transcription: transcriptionText,
            sentiment: fallbackAnalysis.sentiment,
            dominantEmotion: fallbackAnalysis.dominantEmotion,
            metadata: transcriptionResult?.metadata || null,
            timestamp: serverTimestamp(),
            transcriptionSource: 'gladia',
            usingMockEmotions: true
          };
          
          console.log('Returning results with transcription and mock emotions after Google API failed');
          return results;
        } catch (fallbackError) {
          console.error('Failed to generate fallback analysis:', fallbackError);
        }
      }
      
      throw new Error(`Video analysis API error: ${response.status}. Please try again with a different video.`);
    }

    console.log('Video Intelligence API request successful, processing response...');
    const data = await response.json();

    // Process the results from Google API
    const results = {
      emotions: processEmotions(data),
      transcription: transcriptionText || processTranscription(data),
      sentiment: transcriptionAnalysis?.sentiment || null,
      dominantEmotion: transcriptionAnalysis?.dominantEmotion || getDominantEmotion(processEmotions(data)),
      metadata: transcriptionResult?.metadata || null,
      timestamp: serverTimestamp(),
      transcriptionSource: transcriptionText ? 'gladia' : 'google',
      usingMockEmotions: false
    };

    // Save results to Firestore if userId is provided
    if (userId) {
      try {
        await saveAnalysisResults(userId, results);
        console.log('Analysis results saved to Firestore');
      } catch (saveError) {
        console.error('Error saving results to Firestore:', saveError);
        // Don't fail the entire function if save fails
      }
    }

    return results;
  } catch (error) {
    console.error('Error analyzing video:', error);
    throw new Error(`Failed to analyze video: ${error.message}. Please try again with a different video.`);
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix and get only the base64 string
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const processEmotions = (data) => {
  // Process face detection and emotion results
  const emotions = {
    joy: 0,
    sorrow: 0,
    anger: 0,
    surprise: 0,
    neutral: 0
  };

  // Extract emotion scores from the API response
  if (data.annotationResults && data.annotationResults[0].faceDetectionAnnotations) {
    data.annotationResults[0].faceDetectionAnnotations.forEach(annotation => {
      annotation.frames.forEach(frame => {
        if (frame.emotions) {
          Object.keys(emotions).forEach(emotion => {
            if (frame.emotions[emotion]) {
              emotions[emotion] += frame.emotions[emotion].score;
            }
          });
        }
      });
    });
  }

  // Normalize emotion scores
  const total = Object.values(emotions).reduce((sum, score) => sum + score, 0);
  if (total > 0) {
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] = (emotions[emotion] / total) * 100;
    });
  }

  return emotions;
};

const processTranscription = (data) => {
  let transcription = '';

  // Extract transcription from the API response
  if (data.annotationResults && data.annotationResults[0].speechTranscriptions) {
    data.annotationResults[0].speechTranscriptions.forEach(transcriptionData => {
      if (transcriptionData.alternatives && transcriptionData.alternatives[0]) {
        transcription += transcriptionData.alternatives[0].transcript + ' ';
      }
    });
  }

  return transcription.trim();
};

const saveAnalysisResults = async (userId, results) => {
  try {
    const analysisRef = collection(db, 'users', userId, 'video-analysis');
    await addDoc(analysisRef, results);
  } catch (error) {
    console.error('Error saving video analysis results:', error);
  }
};

export const getMoodSuggestions = (emotions) => {
  const dominantEmotion = Object.entries(emotions)
    .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  const suggestions = {
    joy: [
      'Channel your positive energy into creative activities',
      'Share your happiness with others through acts of kindness',
      'Document this positive moment in your gratitude journal'
    ],
    sorrow: [
      'Practice gentle self-care activities',
      'Consider talking to a trusted friend or therapist',
      'Try mood-lifting activities like light exercise or nature walks'
    ],
    anger: [
      'Practice deep breathing exercises',
      'Try progressive muscle relaxation',
      'Consider journaling about your feelings'
    ],
    surprise: [
      'Take time to process your emotions',
      'Practice grounding exercises',
      'Share your experience with someone you trust'
    ],
    neutral: [
      'Maintain your emotional balance through mindfulness',
      'Engage in activities that bring you joy',
      'Set small goals for personal growth'
    ]
  };

  return {
    dominantEmotion,
    suggestions: suggestions[dominantEmotion] || suggestions.neutral
  };
};

/**
 * Get the dominant emotion from emotions object
 * @param {object} emotions - Emotions with scores
 * @returns {string} - The dominant emotion
 */
const getDominantEmotion = (emotions) => {
  if (!emotions) return 'neutral';
  
  const sortedEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1]);
  
  return sortedEmotions[0][0];
}; 