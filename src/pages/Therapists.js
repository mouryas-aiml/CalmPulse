import React, { useState } from 'react';
import './Therapists.css';
import TranslatedText from '../components/TranslatedText';
import TherapistCard from '../components/TherapistCard';

// Base64 encoded placeholder images for doctors
// These would be replaced with actual images in production
const drSharmaImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ZmIzYmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Eci4gUHJpeWEgU2hhcm1hPC90ZXh0Pjwvc3ZnPg==";
const drMenonImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ZmIzYmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Eci4gQXJqdW4gTWVub248L3RleHQ+PC9zdmc+";
const drDesaiImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ZmIzYmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Eci4gU25laGEgRGVzYWk8L3RleHQ+PC9zdmc+";
const drKapoorImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ZmIzYmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Eci4gVmlrcmFtIEthcG9vcjwvdGV4dD48L3N2Zz4=";
const drNairImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ZmIzYmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Eci4gTGFrc2htaSBOYWlyPC90ZXh0Pjwvc3ZnPg==";
const drSinghImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ZmIzYmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Eci4gUmFqaXYgU2luZ2g8L3RleHQ+PC9zdmc+";

// Enhanced therapist data with additional fields
const therapistsData = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialization: "Anxiety & Depression",
    experience: "12 years",
    rating: 4.9,
    image: drSharmaImg,
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
    image: drMenonImg,
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
    image: drDesaiImg,
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
    image: drKapoorImg,
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
    image: drNairImg,
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
    image: drSinghImg,
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
    availability: [],
    sessionType: 'all'
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setFilters({
      specialization: '',
      insurance: '',
      language: '',
      availability: [],
      sessionType: 'all'
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
          <h1><TranslatedText text="Find Your Ideal Therapist in India" /></h1>
          <p><TranslatedText text="Connect with licensed mental health professionals who understand Indian cultural context" /></p>
        </div>
      </div>

      <div className="therapists-container">
        <div className="therapists-header">
          <h1><TranslatedText text="Find a Therapist" as="span" /></h1>
          <p><TranslatedText text="Connect with licensed mental health professionals who match your needs and preferences." /></p>
        </div>

        <div className="search-filters">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name, specialty, or location" 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="filter-section">
            <span className="filter-label"><TranslatedText text="Filter by:" /></span>
            
            <div className="filter-group">
              <label><TranslatedText text="Specialty:" /></label>
              <select 
                value={filters.specialization} 
                onChange={(e) => setFilters({
                  ...filters,
                  specialization: e.target.value
                })}
              >
                <option value=""><TranslatedText text="All Specialties" /></option>
                <option value="Anxiety & Depression"><TranslatedText text="Anxiety & Depression" /></option>
                <option value="Trauma & PTSD"><TranslatedText text="Trauma & PTSD" /></option>
                <option value="Relationships & Family"><TranslatedText text="Relationships & Family" /></option>
                <option value="Stress Management & Mindfulness"><TranslatedText text="Stress Management & Mindfulness" /></option>
                <option value="Child & Adolescent Mental Health"><TranslatedText text="Child & Adolescent Mental Health" /></option>
                <option value="Addiction & Recovery"><TranslatedText text="Addiction & Recovery" /></option>
              </select>
            </div>

            <div className="filter-group">
              <label><TranslatedText text="Availability:" /></label>
              <select 
                value={filters.availability.join(',')}
                onChange={(e) => setFilters({
                  ...filters,
                  availability: e.target.value.split(',')
                })}
              >
                <option value=""><TranslatedText text="Any Availability" /></option>
                <option value="Mon,Tue,Wed"><TranslatedText text="Weekdays" /></option>
                <option value="Sat,Sun"><TranslatedText text="Weekends" /></option>
                <option value="Mon,Tue,Wed,Thu,Fri"><TranslatedText text="This Week" /></option>
              </select>
              </div>
            
            <div className="filter-group">
              <label><TranslatedText text="Session Type:" /></label>
              <select 
                value={filters.sessionType}
                onChange={(e) => setFilters({
                  ...filters,
                  sessionType: e.target.value
                })}
              >
                <option value="all"><TranslatedText text="All Types" /></option>
                <option value="video"><TranslatedText text="Video Call" /></option>
                <option value="audio"><TranslatedText text="Audio Call" /></option>
                <option value="in-person"><TranslatedText text="In-Person" /></option>
              </select>
            </div>

            {(filters.specialization !== '' || filters.availability.length > 0 || filters.sessionType !== 'all') && (
              <button 
                className="clear-filters-btn"
                onClick={resetFilters}
              >
                <TranslatedText text="Clear Filters" />
              </button>
            )}
          </div>
        </div>

        <div className="therapists-list">
          {filteredTherapists.length > 0 ? (
            filteredTherapists.map(therapist => (
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-user-md fa-3x"></i>
              <h3><TranslatedText text="No therapists match your criteria" /></h3>
              <p><TranslatedText text="Try adjusting your search filters or try a different search term." /></p>
              <button className="reset-btn" onClick={resetFilters}>
                <TranslatedText text="Reset All Filters" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Therapists; 