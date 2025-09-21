// Simple positive and negative word lists for basic sentiment analysis
const positiveWords = [
  'good', 'great', 'excellent', 'wonderful', 'fantastic', 'amazing', 'happy', 'joy', 'joyful',
  'calm', 'peaceful', 'content', 'satisfied', 'love', 'like', 'positive', 'beautiful', 'perfect',
  'hope', 'hopeful', 'excited', 'exciting', 'pleasant', 'pleased', 'glad', 'thankful', 'grateful',
  'appreciate', 'impressive', 'confident', 'success', 'successful', 'achievement', 'accomplish',
  'enjoy', 'enjoying', 'fun', 'funny', 'laugh', 'smile', 'proud', 'proudly', 'win', 'winner',
  'better', 'best', 'improve', 'improved', 'improving', 'improvement', 'helpful', 'beneficial',
  'nice', 'kindness', 'kind', 'gentle', 'comfortable', 'comforting', 'inspiring', 'motivated',
  'progress', 'progressing', 'forward', 'fortunate', 'blessed', 'blessing', 'lucky', 'optimistic',
  'relief', 'relieved', 'safe', 'secure', 'enthusiastic', 'enthusiasm', 'energetic', 'vibrant',
  'thriving', 'thrive', 'prosper', 'prosperity', 'wealth', 'healthy', 'wellness', 'well-being'
];

const negativeWords = [
  'bad', 'terrible', 'horrible', 'awful', 'poor', 'sad', 'unhappy', 'depressed', 'depression',
  'angry', 'anger', 'mad', 'upset', 'hate', 'dislike', 'negative', 'ugly', 'imperfect', 'flawed',
  'despair', 'despairing', 'worried', 'worrying', 'worry', 'anxious', 'anxiety', 'stress', 'stressed',
  'stressful', 'unpleasant', 'displeased', 'sorry', 'regret', 'regretful', 'unfortunate', 'ungrateful',
  'disappointing', 'disappointed', 'disappointment', 'unimpressive', 'doubt', 'doubtful', 'failure',
  'failed', 'fail', 'miserable', 'misery', 'suffering', 'suffer', 'pain', 'painful', 'hurt', 'hurting',
  'worse', 'worst', 'decline', 'declining', 'declined', 'unhelpful', 'harmful', 'mean', 'cruel',
  'uncomfortable', 'disturbing', 'discouraging', 'unmotivated', 'regress', 'regressing', 'backward',
  'unfortunate', 'cursed', 'curse', 'unlucky', 'pessimistic', 'distress', 'distressed', 'unsafe',
  'insecure', 'unenthusiastic', 'lethargic', 'tired', 'exhausted', 'dying', 'die', 'suffer', 'suffering',
  'poverty', 'sick', 'illness', 'unwell', 'struggling', 'struggle', 'difficult', 'difficulty'
];

/**
 * Analyzes the sentiment of a text string
 * @param {string} text - The text to analyze
 * @returns {object} - The sentiment analysis result
 */
export const analyzeSentiment = async (text) => {
  if (!text || text.trim() === '') {
    return {
      sentiment: 'neutral',
      score: 0,
      positiveWords: 0,
      negativeWords: 0
    };
  }
  
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase();
  
  // Split into words and clean them
  const words = lowerText.split(/\s+/)
    .map(word => word.replace(/[^\w']/g, '')) // Remove punctuation except apostrophes
    .filter(word => word.length > 0);
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveCount++;
    } else if (negativeWords.includes(word)) {
      negativeCount++;
    }
  });
  
  // Calculate the sentiment score (-1 to +1)
  const totalSentimentWords = positiveCount + negativeCount;
  let score = 0;
  
  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords;
  }
  
  // Determine sentiment label
  let sentiment;
  if (score > 0.05) {
    sentiment = 'positive';
  } else if (score < -0.05) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return {
    sentiment,
    score,
    positiveWords: positiveCount,
    negativeWords: negativeCount
  };
}; 