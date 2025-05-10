import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.name) {
      setUserName(storedUser.name);
    }
  }, []);

  return (
    <div className="home">
      <div className="hero-container">
        <h1>{userName ? `Welcome, ${userName}!` : 'Welcome to CalmPulse'}</h1>
        <p>Your AI-powered mental health companion</p>
        <div className="hero-btns">
          <button className="btn primary-btn">Start Assessment</button>
          <button className="btn secondary-btn">Explore Features</button>
        </div>
      </div>

      <div className="features-section">
        <h2>How CalmPulse Can Help You</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-brain"></i></div>
            <h3>AI Analysis</h3>
            <p>Analyze your speech or text inputs to understand emotional patterns</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-user-md"></i></div>
            <h3>Therapist Connect</h3>
            <p>Find and connect with mental health professionals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-hammer"></i></div>
            <h3>Coping Strategies</h3>
            <p>Learn personalized coping tools and techniques</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-book"></i></div>
            <h3>Self-Awareness</h3>
            <p>Track your progress and gain insights into your mental health journey</p>
          </div>
        </div>
      </div>

      <div className="chat-preview">
        <h2>Start a Conversation</h2>
        <div className="chat-container">
          <div className="chat-box">
            <div className="message bot">
              <p>{userName ? `Hi ${userName}! How are you feeling today?` : 'Hi there! How are you feeling today?'}</p>
            </div>
            <div className="input-area">
              <input type="text" placeholder="Type your message here..." />
              <button><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 