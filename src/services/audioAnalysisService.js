import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const SPEECH_TO_TEXT_ENDPOINT = 'https://speech.googleapis.com/v1/speech:recognize';
const LANGUAGE_ENDPOINT = 'https://language.googleapis.com/v1/documents:analyzeSentiment';

export const analyzeAudio = async (audioFile, userId) => {
  try {
    // Get API key from localStorage
    const API_KEY = localStorage.getItem('audioApiKey');
    if (!API_KEY) {
      throw new Error('Audio Analysis API key not found. Please set it in your profile settings.');
    }

    // Convert audio to base64
    const base64Audio = await fileToBase64(audioFile);

    // First, convert speech to text
    const transcriptionResponse = await fetch(`${SPEECH_TO_TEXT_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'default'
        },
        audio: {
          content: base64Audio
        }
      })
    });

    if (!transcriptionResponse.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcription = transcriptionData.results?.[0]?.alternatives?.[0]?.transcript || '';

    // Then, analyze sentiment of the transcribed text
    const sentimentResponse = await fetch(`${LANGUAGE_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          type: 'PLAIN_TEXT',
          content: transcription
        },
        encodingType: 'UTF8'
      })
    });

    if (!sentimentResponse.ok) {
      throw new Error('Failed to analyze sentiment');
    }

    const sentimentData = await sentimentResponse.json();

    // Process the results
    const results = {
      transcription,
      sentiment: {
        score: sentimentData.documentSentiment.score,
        magnitude: sentimentData.documentSentiment.magnitude
      },
      timestamp: serverTimestamp()
    };

    // Save results to Firestore if userId is provided
    if (userId) {
      await saveAnalysisResults(userId, results);
    }

    return results;
  } catch (error) {
    console.error('Error analyzing audio:', error);
    throw error;
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

const saveAnalysisResults = async (userId, results) => {
  try {
    const analysisRef = collection(db, 'users', userId, 'audio-analysis');
    await addDoc(analysisRef, results);
  } catch (error) {
    console.error('Error saving audio analysis results:', error);
  }
}; 