import React, { useState } from 'react';
import './MindScan.css';

function MindScan() {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate AI analysis with a placeholder
    setTimeout(() => {
      setAnalysis({
        sentiment: 'neutral',
        emotions: ['contemplative', 'curious'],
        suggestions: [
          'Consider practicing mindful breathing exercises',
          'Try journaling about your thoughts to gain clarity',
          'A short walk outdoors might help refresh your perspective'
        ]
      });
    }, 1500);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording and analysis
      setTimeout(() => {
        setIsRecording(false);
        setAnalysis({
          sentiment: 'positive',
          emotions: ['hopeful', 'engaged'],
          suggestions: [
            'Continue building on this positive momentum',
            'Consider setting some achievable goals while in this state',
            'Share your positivity with someone who might need it'
          ]
        });
      }, 3000);
    }
  };

  return (
    <div className="mindscan">
      <div className="mindscan-container">
        <h1>MindScan AI Analysis</h1>
        <p className="mindscan-description">
          Share your thoughts through text or voice, and our AI will analyze your emotional state 
          and provide personalized suggestions.
        </p>

        <div className="input-section">
          <h2>How are you feeling today?</h2>
          <form onSubmit={handleSubmit}>
            <textarea 
              value={inputText}
              onChange={handleTextChange}
              placeholder="Describe how you're feeling or what's on your mind..."
              rows={6}
            />
            <div className="input-buttons">
              <button type="submit" className="submit-btn">
                Analyze Text
              </button>
              <button 
                type="button" 
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
              >
                {isRecording ? 'Stop Recording' : 'Start Voice Recording'}
                <i className={`fas ${isRecording ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
              </button>
            </div>
          </form>
        </div>

        {analysis && (
          <div className="analysis-results">
            <h2>Your MindScan Results</h2>
            <div className="result-card">
              <div className="result-section">
                <h3>Emotional Tone</h3>
                <div className="sentiment-indicator">
                  <div className={`sentiment ${analysis.sentiment}`}>
                    {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h3>Detected Emotions</h3>
                <div className="emotions-list">
                  {analysis.emotions.map((emotion, index) => (
                    <span key={index} className="emotion-tag">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>

              <div className="result-section">
                <h3>Personalized Suggestions</h3>
                <ul className="suggestions-list">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div className="result-actions">
                <button className="action-btn">Save Results</button>
                <button className="action-btn">Talk to Therapist</button>
                <button className="action-btn">View Coping Tools</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MindScan; 