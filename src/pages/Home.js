import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import TranslatedText from '../components/TranslatedText';

function Home() {
  return (
    <div className="home-container">
      <section className="hero-section gradient-bg">
        <div className="hero-content">
          <h1><TranslatedText text="Personalized Mental Wellness Journey" as="span" /></h1>
          <p><TranslatedText text="CalmPulse helps you understand your mental health patterns and connect with professional support when you need it." /></p>
          <div className="hero-buttons">
            <Link to="/mindscan" className="primary-btn">
              <TranslatedText text="Start AI Analysis" />
            </Link>
            <Link to="/therapists" className="secondary-btn">
              <TranslatedText text="Find Therapists" />
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1957&q=80" alt="Mental wellness illustration" />
      </div>
      </section>

      <section className="features-section">
        <h2><TranslatedText text="Discover Your Path to Wellness" as="span" /></h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h3><TranslatedText text="AI Health Analysis" as="span" /></h3>
            <p><TranslatedText text="Get insights into your mental health patterns through advanced AI analysis of text and voice inputs." /></p>
            <Link to="/mindscan" className="feature-link">
              <TranslatedText text="Explore" /> <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-comments"></i>
            </div>
            <h3><TranslatedText text="Mindmitra Chatbot" as="span" /></h3>
            <p><TranslatedText text="Chat with our AI assistant for immediate support, coping strategies, and wellness guidance." /></p>
            <Link to="/mindmitra" className="feature-link">
              <TranslatedText text="Chat Now" /> <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <h3><TranslatedText text="Therapist Matching" as="span" /></h3>
            <p><TranslatedText text="Find the right therapist based on your needs, preferences, and goals." /></p>
            <Link to="/therapists" className="feature-link">
              <TranslatedText text="Find Match" /> <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <h3><TranslatedText text="Coping Tools" as="span" /></h3>
            <p><TranslatedText text="Access evidence-based techniques for managing stress, anxiety, and other challenges." /></p>
            <Link to="/coping-tools" className="feature-link">
              <TranslatedText text="View Tools" /> <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2><TranslatedText text="Success Stories" as="span" /></h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
            <p className="testimonial-text">
              <TranslatedText text='CalmPulse helped me recognize patterns in my anxiety and gave me tools to manage it effectively. The AI analysis was surprisingly accurate.' />
            </p>
            <div className="testimonial-author">
              <TranslatedText text="- Sarah M." />
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="quote-icon"><i className="fas fa-quote-left"></i></div>
            <p className="testimonial-text">
              <TranslatedText text='The therapist matching service connected me with a professional who perfectly understood my needs. I have made significant progress in just a few months.' />
            </p>
            <div className="testimonial-author">
              <TranslatedText text="- Michael T." />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section gradient-bg">
        <h2><TranslatedText text="Begin Your Wellness Journey Today" as="span" /></h2>
        <p><TranslatedText text="Take the first step towards better mental health with personalized support." /></p>
        <Link to="/community" className="cta-button">
          <TranslatedText text="Build Your Community" />
        </Link>
      </section>
    </div>
  );
}

export default Home; 