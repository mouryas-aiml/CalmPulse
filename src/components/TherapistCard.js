import React, { useState } from 'react';
import './TherapistCard.css';
import TranslatedText from './TranslatedText';

// Default placeholder image as base64 string
const placeholderImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ZmIzYmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIzNiIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Eb2N0b3IgSW1hZ2U8L3RleHQ+PC9zdmc+";

function TherapistCard({ therapist }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    type: 'video',
    notes: ''
  });
  const [messageData, setMessageData] = useState({
    message: ''
  });

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Get image source with fallback
  const getImageSrc = () => {
    if (imageError) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=4fb3bf&color=fff&size=256`;
    }
    return therapist.image || placeholderImg;
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    // Here you would integrate with your backend to handle the scheduling
    console.log('Schedule data:', scheduleData);
    alert('Consultation scheduled successfully!');
    setShowScheduleForm(false);
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    // Here you would integrate with your backend to send the message
    console.log('Message data:', messageData);
    alert('Message sent successfully!');
    setShowMessageForm(false);
  };

  const renderScheduleForm = () => (
    <div className="schedule-form">
      <h3><TranslatedText text="Schedule Consultation" /></h3>
      <form onSubmit={handleScheduleSubmit}>
        <div className="form-group">
          <label><TranslatedText text="Date:" /></label>
          <input
            type="date"
            value={scheduleData.date}
            onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label><TranslatedText text="Time:" /></label>
          <input
            type="time"
            value={scheduleData.time}
            onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label><TranslatedText text="Session Type:" /></label>
          <select
            value={scheduleData.type}
            onChange={(e) => setScheduleData({...scheduleData, type: e.target.value})}
          >
            <option value="video"><TranslatedText text="Video Call" /></option>
            <option value="audio"><TranslatedText text="Audio Call" /></option>
            <option value="in-person"><TranslatedText text="In-Person" /></option>
          </select>
        </div>
        <div className="form-group">
          <label><TranslatedText text="Notes:" /></label>
          <textarea
            value={scheduleData.notes}
            onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
            placeholder="Any specific concerns or topics you'd like to discuss..."
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="primary-btn">
            <TranslatedText text="Confirm Booking" />
          </button>
          <button 
            type="button" 
            className="secondary-btn"
            onClick={() => setShowScheduleForm(false)}
          >
            <TranslatedText text="Cancel" />
          </button>
        </div>
      </form>
    </div>
  );

  const renderMessageForm = () => (
    <div className="message-form">
      <h3><TranslatedText text="Send Message" /></h3>
      <form onSubmit={handleMessageSubmit}>
        <div className="form-group">
          <label><TranslatedText text="Message:" /></label>
          <textarea
            value={messageData.message}
            onChange={(e) => setMessageData({...messageData, message: e.target.value})}
            placeholder="Type your message here..."
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="primary-btn">
            <TranslatedText text="Send Message" />
          </button>
          <button 
            type="button" 
            className="secondary-btn"
            onClick={() => setShowMessageForm(false)}
          >
            <TranslatedText text="Cancel" />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      <div className="therapist-card" onClick={() => setIsModalOpen(true)}>
        <div className="therapist-img">
          <img 
            src={getImageSrc()} 
            alt={therapist.name}
            onError={handleImageError}
          />
          <div className="professional-badge">
            <i className="fas fa-check-circle"></i> Verified
          </div>
        </div>
        <div className="therapist-info">
          <div className="info-header">
            <h3>{therapist.name}</h3>
            <div className="rating">
              <i className="fas fa-star"></i>
              <span>{therapist.rating}</span>
            </div>
          </div>
          <div className="experience-level">
            <i className="fas fa-briefcase"></i>
            <span>{therapist.experience}</span>
          </div>
          <p className="specialization">{therapist.specialization}</p>
          <p className="approach">{therapist.bio}</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="therapist-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="therapist-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="modal-content">
              <div className="modal-header">
                <div className="therapist-profile-img">
                  <img 
                    src={getImageSrc()} 
                    alt={therapist.name}
                    onError={handleImageError}
                  />
                  <div className="professional-badge">
                    <i className="fas fa-check-circle"></i> Verified
                  </div>
                </div>
                <div className="therapist-profile-info">
                  <h2>{therapist.name}</h2>
                  <p className="specialization">{therapist.specialization}</p>
                  <div className="therapist-badges">
                    <span className="badge">
                      <i className="fas fa-star"></i> {therapist.rating}
                    </span>
                    <span className="badge">
                      <i className="fas fa-briefcase"></i> {therapist.experience}
                    </span>
                    <span className="badge">
                      <i className="fas fa-rupee-sign"></i> {therapist.sessionFee}/session
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-body">
                <div className="tab-container">
                  <div className="tab-nav">
                    <button 
                      className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                      onClick={() => setActiveTab('about')}
                    >
                      <TranslatedText text="About" />
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'approach' ? 'active' : ''}`}
                      onClick={() => setActiveTab('approach')}
                    >
                      <TranslatedText text="Approach" />
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'qualifications' ? 'active' : ''}`}
                      onClick={() => setActiveTab('qualifications')}
                    >
                      <TranslatedText text="Qualifications" />
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'insurance' ? 'active' : ''}`}
                      onClick={() => setActiveTab('insurance')}
                    >
                      <TranslatedText text="Insurance" />
                    </button>
                  </div>
                  
                  <div className="tab-content">
                    {activeTab === 'about' && (
                      <div className="tab-pane active">
                        <h3><TranslatedText text="About" /></h3>
                        <p>{therapist.bio}</p>
                        
                        <h3><TranslatedText text="Specializes In" /></h3>
                        <p>{therapist.specialization}</p>
                        
                        <h3><TranslatedText text="Languages" /></h3>
                        <p>{therapist.languages.join(', ')}</p>
                      </div>
                    )}
                    
                    {activeTab === 'approach' && (
                      <div className="tab-pane active">
                        <h3><TranslatedText text="Therapeutic Approach" /></h3>
                        <p>{therapist.approach}</p>
                      </div>
                    )}
                    
                    {activeTab === 'qualifications' && (
                      <div className="tab-pane active">
                        <h3><TranslatedText text="Education" /></h3>
                        <p>{therapist.education}</p>
                      </div>
                    )}
                    
                    {activeTab === 'insurance' && (
                      <div className="tab-pane active">
                        <h3><TranslatedText text="Accepted Insurance" /></h3>
                        <ul className="insurance-list">
                          {therapist.insurances.map((insurance, index) => (
                            <li key={index}>{insurance}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="availability-section">
                  <h3><TranslatedText text="Availability" /></h3>
                  <div className="availability-calendar">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                      <div 
                        key={day} 
                        className={`calendar-day ${therapist.availability.includes(day) ? 'available' : 'unavailable'}`}
                      >
                        <span>{day}</span>
                        {therapist.availability.includes(day) ? 
                          <i className="fas fa-check-circle"></i> : 
                          <i className="fas fa-times-circle"></i>
                        }
                      </div>
                    ))}
                  </div>
                  
                  <div className="next-session">
                    <div className="next-label">
                      <TranslatedText text="Next available session:" />
                    </div>
                    <div className="next-time">{therapist.nextAvailable}</div>
                  </div>
                  
                  <div className="cta-buttons">
                    <button 
                      className="primary-btn"
                      onClick={() => setShowScheduleForm(true)}
                    >
                      <i className="fas fa-calendar-alt"></i>
                      <TranslatedText text="Schedule Now" />
                    </button>
                    <button 
                      className="secondary-btn"
                      onClick={() => setShowMessageForm(true)}
                    >
                      <i className="fas fa-comment"></i>
                      <TranslatedText text="Send Message" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showScheduleForm && renderScheduleForm()}
            {showMessageForm && renderMessageForm()}
          </div>
        </div>
      )}
    </>
  );
}

export default TherapistCard; 