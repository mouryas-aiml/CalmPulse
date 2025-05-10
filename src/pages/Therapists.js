import React, { useState } from 'react';
import './Therapists.css';

// Mock therapist data
const therapistsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "Anxiety & Depression",
    experience: "15 years",
    rating: 4.8,
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    availability: ["Mon", "Tue", "Thu"],
    bio: "Dr. Johnson specializes in cognitive behavioral therapy approaches for anxiety and depression. She has extensive experience working with young adults and professionals dealing with workplace stress."
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialization: "Trauma & PTSD",
    experience: "12 years",
    rating: 4.7,
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    availability: ["Wed", "Fri", "Sat"],
    bio: "Dr. Chen is trained in EMDR therapy and specializes in helping individuals process traumatic experiences. His approach is compassionate and client-centered."
  },
  {
    id: 3,
    name: "Dr. Rebecca Williams",
    specialization: "Relationships & Family",
    experience: "10 years",
    rating: 4.9,
    image: "https://randomuser.me/api/portraits/women/64.jpg",
    availability: ["Mon", "Wed", "Fri"],
    bio: "Dr. Williams focuses on helping individuals and couples navigate relationship challenges. She is trained in emotionally focused therapy and Gottman method couples therapy."
  },
  {
    id: 4,
    name: "Dr. James Peterson",
    specialization: "Stress Management",
    experience: "8 years",
    rating: 4.6,
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    availability: ["Tue", "Thu", "Sat"],
    bio: "Dr. Peterson helps clients develop effective stress management techniques and build resilience. He incorporates mindfulness practices and practical coping strategies."
  }
];

function Therapists() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    availability: []
  });
  const [selectedTherapist, setSelectedTherapist] = useState(null);

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

  const filteredTherapists = therapistsData
    .filter(therapist => 
      therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(therapist => 
      filters.specialization === '' || 
      therapist.specialization.includes(filters.specialization)
    )
    .filter(therapist => 
      filters.availability.length === 0 ||
      filters.availability.some(day => therapist.availability.includes(day))
    );

  return (
    <div className="therapists">
      <div className="therapists-container">
        <h1>Connect with Mental Health Professionals</h1>
        <p className="therapists-description">
          Find and connect with qualified therapists who specialize in various aspects of mental health.
        </p>

        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search therapists by name or specialization..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Specialization</label>
              <select name="specialization" onChange={handleFilterChange} value={filters.specialization}>
                <option value="">All Specializations</option>
                <option value="Anxiety & Depression">Anxiety & Depression</option>
                <option value="Trauma & PTSD">Trauma & PTSD</option>
                <option value="Relationships & Family">Relationships & Family</option>
                <option value="Stress Management">Stress Management</option>
              </select>
            </div>

            <div className="filter-group">
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
          </div>
        </div>

        <div className="therapists-list">
          {filteredTherapists.length > 0 ? (
            filteredTherapists.map(therapist => (
              <div 
                className="therapist-card" 
                key={therapist.id}
                onClick={() => setSelectedTherapist(therapist)}
              >
                <div className="therapist-img">
                  <img src={therapist.image} alt={therapist.name} />
                </div>
                <div className="therapist-info">
                  <h3>{therapist.name}</h3>
                  <p className="specialization">{therapist.specialization}</p>
                  <div className="experience-rating">
                    <span><i className="fas fa-briefcase"></i> {therapist.experience}</span>
                    <span><i className="fas fa-star"></i> {therapist.rating}</span>
                  </div>
                  <div className="availability">
                    {therapist.availability.map(day => (
                      <span key={day} className="available-day">{day}</span>
                    ))}
                  </div>
                  <button className="connect-btn">Connect</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-user-md fa-3x"></i>
              <p>No therapists match your current filters. Try adjusting your search criteria.</p>
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
                  <img src={selectedTherapist.image} alt={selectedTherapist.name} />
                  <div>
                    <h2>{selectedTherapist.name}</h2>
                    <p className="specialization">{selectedTherapist.specialization}</p>
                    <div className="experience-rating">
                      <span><i className="fas fa-briefcase"></i> {selectedTherapist.experience}</span>
                      <span><i className="fas fa-star"></i> {selectedTherapist.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="modal-body">
                  <h3>About</h3>
                  <p>{selectedTherapist.bio}</p>
                  
                  <h3>Availability</h3>
                  <div className="availability-calendar">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                      <div 
                        key={day} 
                        className={`calendar-day ${selectedTherapist.availability.includes(day) ? 'available' : 'unavailable'}`}
                      >
                        <span>{day}</span>
                        {selectedTherapist.availability.includes(day) ? 
                          <i className="fas fa-check"></i> : 
                          <i className="fas fa-times"></i>
                        }
                      </div>
                    ))}
                  </div>
                  
                  <div className="appointment-buttons">
                    <button className="schedule-btn primary-btn">
                      <i className="fas fa-calendar-alt"></i> Schedule Appointment
                    </button>
                    <button className="message-btn secondary-btn">
                      <i className="fas fa-comment"></i> Send Message
                    </button>
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