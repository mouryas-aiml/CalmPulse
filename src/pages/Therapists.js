import React, { useState } from 'react';
import './Therapists.css';

// Enhanced therapist data with additional fields
const therapistsData = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialization: "Anxiety & Depression",
    experience: "12 years",
    rating: 4.9,
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    availability: ["Mon", "Tue", "Thu"],
    bio: "Dr. Sharma has extensive experience treating anxiety and depression using an integrative approach that combines CBT, mindfulness, and traditional Indian wellness practices. She specializes in helping professionals manage workplace stress and burnout.",
    insurances: ["Star Health", "HDFC ERGO", "Bajaj Allianz"],
    languages: ["English", "Hindi", "Punjabi"],
    approach: "Cognitive Behavioral Therapy, Mindfulness, Yoga-integrated Therapy",
    nextAvailable: "Tomorrow",
    sessionFee: "₹2,500",
    education: "Ph.D. Clinical Psychology, NIMHANS Bangalore"
  },
  {
    id: 2,
    name: "Dr. Arjun Menon",
    specialization: "Trauma & PTSD",
    experience: "15 years",
    rating: 4.8,
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    availability: ["Wed", "Fri", "Sat"],
    bio: "Dr. Menon is trained in EMDR therapy and specializes in trauma recovery. His approach combines Western psychological techniques with Eastern mindfulness practices to provide holistic treatment for PTSD and complex trauma.",
    insurances: ["Aditya Birla Health", "ICICI Lombard", "Religare Health"],
    languages: ["English", "Malayalam", "Tamil"],
    approach: "EMDR, Trauma-Focused CBT, Somatic Experiencing",
    nextAvailable: "This week",
    sessionFee: "₹3,000",
    education: "M.D. Psychiatry, AIIMS Delhi, Advanced training in Trauma Therapy"
  },
  {
    id: 3,
    name: "Dr. Sneha Desai",
    specialization: "Relationships & Family",
    experience: "10 years",
    rating: 4.9,
    image: "https://randomuser.me/api/portraits/women/64.jpg",
    availability: ["Mon", "Wed", "Fri"],
    bio: "Dr. Desai focuses on helping individuals and couples navigate relationship challenges with cultural sensitivity. She incorporates family systems theory with an understanding of traditional Indian family dynamics to help clients find harmony in their relationships.",
    insurances: ["Star Health", "Max Bupa", "HDFC ERGO"],
    languages: ["English", "Hindi", "Gujarati"],
    approach: "Gottman Method, Emotionally Focused Therapy, Family Systems",
    nextAvailable: "Today",
    sessionFee: "₹2,800",
    education: "Ph.D. Family Therapy, Tata Institute of Social Sciences"
  },
  {
    id: 4,
    name: "Dr. Vikram Kapoor",
    specialization: "Stress Management & Mindfulness",
    experience: "8 years",
    rating: 4.7,
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    availability: ["Tue", "Thu", "Sat"],
    bio: "Dr. Kapoor combines modern psychological approaches with traditional Indian wisdom for holistic mental wellness. He specializes in mindfulness-based interventions and stress reduction techniques adapted for the Indian context.",
    insurances: ["Religare Health", "ICICI Lombard", "Aditya Birla Health"],
    languages: ["English", "Hindi", "Urdu"],
    approach: "Mindfulness-Based Stress Reduction, ACT, Meditation Therapy",
    nextAvailable: "This week",
    sessionFee: "₹2,200",
    education: "M.Phil Clinical Psychology, Delhi University, Certified in Mindfulness-Based Interventions"
  },
  {
    id: 5,
    name: "Dr. Lakshmi Nair",
    specialization: "Child & Adolescent Mental Health",
    experience: "14 years",
    rating: 4.9,
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    availability: ["Mon", "Tue", "Fri"],
    bio: "Dr. Nair specializes in working with children and adolescents facing emotional and behavioral challenges. She uses play therapy, art therapy, and family involvement to help young minds flourish while being sensitive to Indian parenting contexts.",
    insurances: ["Star Health", "Max Bupa", "Bajaj Allianz"],
    languages: ["English", "Malayalam", "Hindi"],
    approach: "Play Therapy, Cognitive Behavioral Therapy, Family Systems",
    nextAvailable: "Tomorrow",
    sessionFee: "₹2,600",
    education: "Ph.D. Child Psychology, NIMHANS Bangalore, Certified Play Therapist"
  },
  {
    id: 6,
    name: "Dr. Rajiv Singh",
    specialization: "Addiction & Recovery",
    experience: "18 years",
    rating: 4.8,
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    availability: ["Wed", "Thu", "Sat"],
    bio: "Dr. Singh has extensive experience treating various forms of addiction, from substance use to behavioral addictions. He utilizes a culturally informed approach that addresses the specific challenges faced by individuals in the Indian context.",
    insurances: ["ICICI Lombard", "Aditya Birla Health", "HDFC ERGO"],
    languages: ["English", "Hindi", "Punjabi"],
    approach: "Motivational Interviewing, 12-Step Facilitation, Harm Reduction",
    nextAvailable: "This week",
    sessionFee: "₹3,200",
    education: "M.D. Psychiatry, PGI Chandigarh, Certification in Addiction Medicine"
  }
];

function Therapists() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    insurance: '',
    language: '',
    availability: []
  });
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState('grid');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleAvailabilityFilter = (day) => {
    const newAvailability = filters.availability.includes(day)
      ? filters.availability.filter(d => d !== day)
      : [...filters.availability, day];
    
    setFilters({
      ...filters,
      availability: newAvailability
    });
  };

  const resetFilters = () => {
    setFilters({
      specialization: '',
      insurance: '',
      language: '',
      availability: []
    });
    setSearchTerm('');
  };

  const filteredTherapists = therapistsData
    .filter(therapist => 
      therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.approach.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(therapist => 
      filters.specialization === '' || 
      therapist.specialization.includes(filters.specialization)
    )
    .filter(therapist => 
      filters.insurance === '' || 
      therapist.insurances.includes(filters.insurance)
    )
    .filter(therapist => 
      filters.language === '' || 
      therapist.languages.includes(filters.language)
    )
    .filter(therapist => 
      filters.availability.length === 0 ||
      filters.availability.some(day => therapist.availability.includes(day))
    );

  return (
    <div className="therapists">
      <div className="therapist-banner gradient-bg">
        <div className="banner-content">
          <h1>Find Your Ideal Therapist in India</h1>
          <p>Connect with licensed mental health professionals who understand Indian cultural context</p>
        </div>
      </div>

      <div className="therapists-container">
        <div className="search-filter-section">
          <div className="search-top">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, specialty, or approach..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="filter-toggle">
              <button onClick={() => setShowFilters(!showFilters)}>
                <i className="fas fa-filter"></i> {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className="view-toggle">
                <button 
                  className={view === 'grid' ? 'active' : ''} 
                  onClick={() => setView('grid')}
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  className={view === 'list' ? 'active' : ''} 
                  onClick={() => setView('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Specialization</label>
                  <select name="specialization" onChange={handleFilterChange} value={filters.specialization}>
                    <option value="">All Specializations</option>
                    <option value="Anxiety & Depression">Anxiety & Depression</option>
                    <option value="Trauma & PTSD">Trauma & PTSD</option>
                    <option value="Relationships & Family">Relationships & Family</option>
                    <option value="Stress Management & Mindfulness">Stress Management & Mindfulness</option>
                    <option value="Child & Adolescent Mental Health">Child & Adolescent Mental Health</option>
                    <option value="Addiction & Recovery">Addiction & Recovery</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Insurance</label>
                  <select name="insurance" onChange={handleFilterChange} value={filters.insurance}>
                    <option value="">All Insurance</option>
                    <option value="Star Health">Star Health</option>
                    <option value="HDFC ERGO">HDFC ERGO</option>
                    <option value="Bajaj Allianz">Bajaj Allianz</option>
                    <option value="ICICI Lombard">ICICI Lombard</option>
                    <option value="Aditya Birla Health">Aditya Birla Health</option>
                    <option value="Religare Health">Religare Health</option>
                    <option value="Max Bupa">Max Bupa</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Language</label>
                  <select name="language" onChange={handleFilterChange} value={filters.language}>
                    <option value="">All Languages</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>

              <div className="filter-group availability-filter">
                <label>Availability</label>
                <div className="availability-options">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <button
                      key={day}
                      className={`day-btn ${filters.availability.includes(day) ? 'active' : ''}`}
                      onClick={() => handleAvailabilityFilter(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-actions">
                <button className="reset-btn" onClick={resetFilters}>
                  <i className="fas fa-redo"></i> Reset Filters
                </button>
                <div className="results-count">
                  {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`therapists-list ${view === 'list' ? 'list-view' : 'grid-view'}`}>
          {filteredTherapists.length > 0 ? (
            filteredTherapists.map(therapist => (
              <div 
                className="therapist-card" 
                key={therapist.id}
                onClick={() => setSelectedTherapist(therapist)}
              >
                <div className="therapist-img">
                  <img src={therapist.image} alt={therapist.name} />
                  <div className="next-available">
                    <i className="far fa-calendar-check"></i> {therapist.nextAvailable}
                  </div>
                </div>
                <div className="therapist-info">
                  <div className="info-header">
                    <h3>{therapist.name}</h3>
                    <div className="rating">
                      <i className="fas fa-star"></i> {therapist.rating}
                    </div>
                  </div>
                  <p className="specialization">{therapist.specialization}</p>
                  <p className="approach">{therapist.approach}</p>
                  
                  <div className="therapist-details">
                    <div className="detail-item">
                      <i className="fas fa-briefcase"></i> {therapist.experience}
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-dollar-sign"></i> {therapist.sessionFee}/session
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-globe"></i> {therapist.languages.join(', ')}
                    </div>
                  </div>
                  
                  <div className="insurance-tags">
                    {therapist.insurances.map(insurance => (
                      <span key={insurance} className="insurance-tag">{insurance}</span>
                    ))}
                  </div>
                  
                  <button className="connect-btn">Schedule Consultation</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-user-md fa-3x"></i>
              <h3>No therapists match your criteria</h3>
              <p>Try adjusting your search filters or try a different search term.</p>
              <button className="reset-btn" onClick={resetFilters}>Reset All Filters</button>
            </div>
          )}
        </div>

        {selectedTherapist && (
          <div className="therapist-modal-overlay" onClick={() => setSelectedTherapist(null)}>
            <div className="therapist-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setSelectedTherapist(null)}>
                <i className="fas fa-times"></i>
              </button>
              
              <div className="modal-content">
                <div className="modal-header">
                  <div className="therapist-profile-img">
                    <img src={selectedTherapist.image} alt={selectedTherapist.name} />
                  </div>
                  <div className="therapist-profile-info">
                    <h2>{selectedTherapist.name}</h2>
                    <p className="specialization">{selectedTherapist.specialization}</p>
                    <div className="therapist-badges">
                      <span className="badge"><i className="fas fa-star"></i> {selectedTherapist.rating}</span>
                      <span className="badge"><i className="fas fa-briefcase"></i> {selectedTherapist.experience}</span>
                      <span className="badge"><i className="fas fa-dollar-sign"></i> {selectedTherapist.sessionFee}/session</span>
                    </div>
                    <button className="schedule-btn">
                      <i className="fas fa-calendar-alt"></i> Schedule Consultation
                    </button>
                  </div>
                </div>
                
                <div className="modal-body">
                  <div className="tab-container">
                    <div className="tab-nav">
                      <button className="tab-btn active">About</button>
                      <button className="tab-btn">Approach</button>
                      <button className="tab-btn">Qualifications</button>
                      <button className="tab-btn">Insurance</button>
                    </div>
                    
                    <div className="tab-content">
                      <div className="tab-pane active">
                        <h3>About</h3>
                        <p>{selectedTherapist.bio}</p>
                        
                        <h3>Specializes In</h3>
                        <p>{selectedTherapist.specialization}</p>
                        
                        <h3>Languages</h3>
                        <p>{selectedTherapist.languages.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="availability-section">
                    <h3>Availability</h3>
                    <div className="availability-calendar">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                        <div 
                          key={day} 
                          className={`calendar-day ${selectedTherapist.availability.includes(day) ? 'available' : 'unavailable'}`}
                        >
                          <span>{day}</span>
                          {selectedTherapist.availability.includes(day) ? 
                            <i className="fas fa-check-circle"></i> : 
                            <i className="fas fa-times-circle"></i>
                          }
                        </div>
                      ))}
                    </div>
                    
                    <div className="next-session">
                      <div className="next-label">Next available session:</div>
                      <div className="next-time">{selectedTherapist.nextAvailable}</div>
                    </div>
                    
                    <div className="cta-buttons">
                      <button className="schedule-btn primary-btn">
                        <i className="fas fa-calendar-alt"></i> Schedule Now
                      </button>
                      <button className="message-btn secondary-btn">
                        <i className="fas fa-comment"></i> Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Therapists; 