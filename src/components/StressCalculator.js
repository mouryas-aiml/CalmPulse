import React, { useState, useEffect } from 'react';
import './StressCalculator.css';
import TranslatedText from './TranslatedText';

const StressCalculator = () => {
  const [stressLevel, setStressLevel] = useState(0);
  const [heartRate, setHeartRate] = useState(70);
  const [breathingRate, setBreathingRate] = useState(15);
  const [sleepHours, setSleepHours] = useState(7);
  const [anxietyLevel, setAnxietyLevel] = useState(3);
  const [stressColor, setStressColor] = useState('#4CAF50');
  const [stressMessage, setStressMessage] = useState('');

  // Calculate stress level in real-time whenever inputs change
  useEffect(() => {
    calculateStressLevel();
  }, [heartRate, breathingRate, sleepHours, anxietyLevel]);

  const calculateStressLevel = () => {
    // Normalize each parameter to a 0-10 scale
    const heartRateScore = Math.min(10, Math.max(0, (heartRate - 60) / 4));
    const breathingRateScore = Math.min(10, Math.max(0, (breathingRate - 10) / 1.5));
    const sleepScore = Math.min(10, Math.max(0, (9 - sleepHours) * 1.25));
    
    // Calculate weighted average (heart rate and breathing are physiological indicators)
    const calculatedStress = (
      (heartRateScore * 0.3) + 
      (breathingRateScore * 0.2) + 
      (sleepScore * 0.2) + 
      (anxietyLevel * 0.3)
    );
    
    // Round to one decimal place
    const roundedStress = Math.round(calculatedStress * 10) / 10;
    setStressLevel(roundedStress);
    
    // Set color based on stress level
    if (roundedStress < 3) {
      setStressColor('#4CAF50'); // Green
      setStressMessage('Low stress levels. Keep up the good work!');
    } else if (roundedStress < 6) {
      setStressColor('#FFC107'); // Yellow
      setStressMessage('Moderate stress. Consider some relaxation techniques.');
    } else {
      setStressColor('#F44336'); // Red
      setStressMessage('High stress detected. Please take time for self-care.');
    }
  };

  // Simulate real-time changes for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random fluctuations to simulate real-time monitoring
      if (Math.random() > 0.7) {
        setHeartRate(prev => Math.max(60, Math.min(100, prev + (Math.random() * 2 - 1))));
        setBreathingRate(prev => Math.max(10, Math.min(20, prev + (Math.random() * 0.4 - 0.2))));
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stress-calculator" data-aos="fade-up" data-aos-duration="1000">
      <div className="stress-meter" data-aos="fade-right" data-aos-delay="200">
        <h3><TranslatedText text="Real-Time Stress Monitor" /></h3>
        <div className="stress-gauge">
          <div 
            className="stress-indicator" 
            style={{ 
              width: `${(stressLevel / 10) * 100}%`, 
              backgroundColor: stressColor 
            }}
          ></div>
        </div>
        <div className="stress-level">
          <span><TranslatedText text="Stress Level:" /> {stressLevel}/10</span>
          <p className="stress-message">{stressMessage}</p>
        </div>
      </div>
      
      <div className="stress-parameters" data-aos="fade-left" data-aos-delay="400">
        <div className="parameter" data-aos="zoom-in" data-aos-delay="500">
          <label><TranslatedText text="Heart Rate (BPM):" /></label>
          <div className="parameter-input">
            <input 
              type="range" 
              min="60" 
              max="100" 
              value={heartRate} 
              onChange={(e) => setHeartRate(Number(e.target.value))}
            />
            <span>{Math.round(heartRate)}</span>
          </div>
        </div>
        
        <div className="parameter" data-aos="zoom-in" data-aos-delay="600">
          <label><TranslatedText text="Breathing Rate (per min):" /></label>
          <div className="parameter-input">
            <input 
              type="range" 
              min="10" 
              max="20" 
              step="0.5" 
              value={breathingRate} 
              onChange={(e) => setBreathingRate(Number(e.target.value))}
            />
            <span>{breathingRate}</span>
          </div>
        </div>
        
        <div className="parameter" data-aos="zoom-in" data-aos-delay="700">
          <label><TranslatedText text="Sleep Last Night (hours):" /></label>
          <div className="parameter-input">
            <input 
              type="range" 
              min="4" 
              max="9" 
              step="0.5" 
              value={sleepHours} 
              onChange={(e) => setSleepHours(Number(e.target.value))}
            />
            <span>{sleepHours}</span>
          </div>
        </div>
        
        <div className="parameter" data-aos="zoom-in" data-aos-delay="800">
          <label><TranslatedText text="Perceived Anxiety (1-10):" /></label>
          <div className="parameter-input">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={anxietyLevel} 
              onChange={(e) => setAnxietyLevel(Number(e.target.value))}
            />
            <span>{anxietyLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressCalculator; 