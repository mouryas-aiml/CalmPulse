import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const LANGUAGE_ENDPOINT = 'https://language.googleapis.com/v1/documents:analyzeSentiment';
const ENTITY_ENDPOINT = 'https://language.googleapis.com/v1/documents:analyzeEntities';
const SYNTAX_ENDPOINT = 'https://language.googleapis.com/v1/documents:analyzeSyntax';

// Simple fallback sentiment analysis when API fails
const localSentimentAnalysis = (text) => {
  // Lists of positive and negative words for basic sentiment analysis
  const positiveWords = [
    'happy', 'joy', 'love', 'excellent', 'good', 'great', 'positive', 'wonderful', 
    'amazing', 'fantastic', 'delighted', 'excited', 'glad', 'pleased', 'satisfied',
    'fortunate', 'grateful', 'impressive', 'better', 'success', 'thank', 'thanks',
    'appreciated', 'calm', 'peaceful', 'relaxed', 'confident', 'beautiful', 'lovely'
  ];
  
  const negativeWords = [
    'sad', 'unhappy', 'hate', 'bad', 'terrible', 'awful', 'negative', 'horrible',
    'disappointing', 'upset', 'angry', 'furious', 'miserable', 'depressed', 'anxious',
    'stressed', 'worried', 'fear', 'scared', 'sorry', 'regret', 'difficult', 'hard',
    'trouble', 'pain', 'hurt', 'annoyed', 'frustrated', 'tired', 'exhausted', 'sick'
  ];
  
  // Normalize text for analysis (convert to lowercase and remove punctuation)
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = normalizedText.split(/\s+/);
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  // Calculate simple sentiment score between -1 and 1
  const totalSentimentWords = positiveCount + negativeCount;
  let score = 0;
  
  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords;
  }
  
  // Calculate simple magnitude based on the total sentiment words relative to text length
  const magnitude = Math.min(totalSentimentWords / words.length * 10, 2);
  
  console.log('Local sentiment analysis results:', { score, magnitude, positiveCount, negativeCount });
  
  return {
    documentSentiment: {
      score,
      magnitude
    },
    language: 'en',
    sentences: [{
      text: { content: text },
      sentiment: { score, magnitude }
    }]
  };
};

export const analyzeText = async (text, userId) => {
  try {
    // Get API key from localStorage
    const API_KEY = localStorage.getItem('textApiKey');
    if (!API_KEY) {
      throw new Error('Text Analysis API key not found. Please set it in your profile settings.');
    }

    let sentimentData;
    let entityData;
    let syntaxData;
    let usedFallback = false;

    try {
      // Analyze sentiment
      const sentimentResponse = await fetch(`${LANGUAGE_ENDPOINT}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: {
            type: 'PLAIN_TEXT',
            content: text
          },
          encodingType: 'UTF8'
        })
      });

      if (!sentimentResponse.ok) {
        const errorText = await sentimentResponse.text();
        console.error('Sentiment analysis failed:', {
          status: sentimentResponse.status,
          statusText: sentimentResponse.statusText,
          response: errorText
        });
        // Use local fallback
        sentimentData = localSentimentAnalysis(text);
        usedFallback = true;
      } else {
        sentimentData = await sentimentResponse.json();
      }
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      // Use local fallback
      sentimentData = localSentimentAnalysis(text);
      usedFallback = true;
    }

    // Only proceed with entity and syntax analysis if we didn't use the fallback
    if (!usedFallback) {
      try {
        // Analyze entities
        const entityResponse = await fetch(`${ENTITY_ENDPOINT}?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document: {
              type: 'PLAIN_TEXT',
              content: text
            },
            encodingType: 'UTF8'
          })
        });

        if (!entityResponse.ok) {
          const errorText = await entityResponse.text();
          console.error('Entity analysis failed:', {
            status: entityResponse.status,
            statusText: entityResponse.statusText,
            response: errorText
          });
          entityData = { entities: [] };
        } else {
          entityData = await entityResponse.json();
        }

        // Analyze syntax
        const syntaxResponse = await fetch(`${SYNTAX_ENDPOINT}?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document: {
              type: 'PLAIN_TEXT',
              content: text
            },
            encodingType: 'UTF8'
          })
        });

        if (!syntaxResponse.ok) {
          const errorText = await syntaxResponse.text();
          console.error('Syntax analysis failed:', {
            status: syntaxResponse.status,
            statusText: syntaxResponse.statusText,
            response: errorText
          });
          syntaxData = { sentences: [], tokens: [] };
        } else {
          syntaxData = await syntaxResponse.json();
        }
      } catch (error) {
        console.error('Error in entity/syntax analysis:', error);
        entityData = { entities: [] };
        syntaxData = { sentences: [], tokens: [] };
      }
    } else {
      // Set dummy values for entity and syntax when using fallback
      entityData = { entities: [] };
      syntaxData = { 
        sentences: [{ text: { content: text } }], 
        tokens: [] 
      };
    }

    // Process the results
    const results = {
      text,
      sentiment: {
        score: sentimentData.documentSentiment.score,
        magnitude: sentimentData.documentSentiment.magnitude,
        sentences: sentimentData.sentences?.map(s => ({
          text: s.text.content,
          score: s.sentiment.score,
          magnitude: s.sentiment.magnitude
        })) || []
      },
      entities: entityData.entities?.map(e => ({
        name: e.name,
        type: e.type,
        salience: e.salience,
        sentiment: e.sentiment
      })) || [],
      syntax: {
        sentences: syntaxData.sentences?.map(s => s.text.content) || [],
        tokens: syntaxData.tokens?.map(t => ({
          text: t.text.content,
          partOfSpeech: t.partOfSpeech.tag,
          dependencyEdge: t.dependencyEdge
        })) || []
      },
      usedFallback: usedFallback,
      timestamp: serverTimestamp()
    };

    // Save results to Firestore if userId is provided
    if (userId) {
      await saveAnalysisResults(userId, results);
    }

    return results;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};

const saveAnalysisResults = async (userId, results) => {
  try {
    const analysisRef = collection(db, 'users', userId, 'text-analysis');
    await addDoc(analysisRef, results);
  } catch (error) {
    console.error('Error saving text analysis results:', error);
  }
}; 