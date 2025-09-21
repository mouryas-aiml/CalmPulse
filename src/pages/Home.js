import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import TranslatedText from '../components/TranslatedText';

// Base64 encoded hero image
const heroImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmMWY1ZjkiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIyMDAiIHI9IjE1MCIgZmlsbD0iIzRmYjNiZiIgZmlsbC1vcGFjaXR5PSIwLjUiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyNTAiIHI9IjEwMCIgZmlsbD0iIzM0OThmZiIgZmlsbC1vcGFjaXR5PSIwLjciLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIxNTAiIHI9IjEyMCIgZmlsbD0iIzM0OThmZiIgZmlsbC1vcGFjaXR5PSIwLjQiLz48dGV4dCB4PSIzMDAiIHk9IjIwMCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5NZW50YWwgV2VsbG5lc3MgSWxsdXN0cmF0aW9uPC90ZXh0Pjwvc3ZnPg==";

// Base64 encoded background pattern - more advanced with wave pattern
const backgroundPattern = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgxMCkiPjxwYXRoIGQ9Ik0yNSAwIEMyNSAwIDUwIDI1IDc1IDI1IEwxMDAgMjUgTDEwMCAwIEwwIDAgTDAgMjUgTDI1IDI1IEMyNSAyNSAwIDAgMCAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==";

// Base64 encoded testimonials background pattern - subtle dots
const testimonialsBgPattern = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiM0ZmIzYmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+";

function Home() {
  return (
    <div className="home-container">
      <section 
        className="hero-section gradient-bg"
        style={{ 
          backgroundImage: `url(${backgroundPattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      >
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
          <img src={heroImage} alt="Mental wellness illustration" />
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

      <section 
        className="testimonials-section"
        style={{ 
          backgroundImage: `url(${testimonialsBgPattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      >
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

      <section 
        className="cta-section gradient-bg"
        style={{ 
          backgroundImage: `url(${backgroundPattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      >
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