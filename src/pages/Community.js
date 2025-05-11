import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Community.css';
import TranslatedText from '../components/TranslatedText';

function Community() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupType, setNewGroupType] = useState('support');
  const [newGroupTags, setNewGroupTags] = useState('');

  // Sample community groups data
  const communityGroups = [
    {
      id: 1,
      name: 'Anxiety Support Circle',
      description: 'A supportive community for people dealing with anxiety disorders, offering weekly virtual meetings and moderated discussions.',
      members: 1243,
      type: 'support',
      tags: ['anxiety', 'stress', 'panic'],
      image: 'https://images.unsplash.com/photo-1573497161161-c3e73707e25c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 2,
      name: 'Mindfulness Meditation Group',
      description: 'Join daily guided meditation sessions and learn mindfulness techniques from experienced practitioners.',
      members: 956,
      type: 'practice',
      tags: ['meditation', 'mindfulness', 'relaxation'],
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 3,
      name: 'Depression Recovery Network',
      description: 'A compassionate space for individuals experiencing depression to share their journeys and recovery strategies.',
      members: 1876,
      type: 'support',
      tags: ['depression', 'recovery', 'mood'],
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 4,
      name: 'Mental Health Advocates',
      description: 'Join forces with activists working to reduce mental health stigma and improve access to resources.',
      members: 742,
      type: 'advocacy',
      tags: ['advocacy', 'awareness', 'education'],
      image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 5,
      name: 'PTSD Peer Support',
      description: 'A secure environment for trauma survivors to connect, share coping strategies, and support one another.',
      members: 689,
      type: 'support',
      tags: ['ptsd', 'trauma', 'recovery'],
      image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      id: 6,
      name: 'Art Therapy Collective',
      description: 'Express yourself through various art forms while connecting with others who use creativity for healing.',
      members: 512,
      type: 'practice',
      tags: ['art', 'creativity', 'expression'],
      image: 'https://images.unsplash.com/photo-1607457716628-a2c9b3a3cd31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    }
  ];

  // Filter community groups based on type and search query
  const filteredGroups = communityGroups.filter(group => {
    const matchesType = filterType === 'all' || group.type === filterType;
    const matchesSearch = !searchQuery || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  // Handle joining a group
  const handleJoinGroup = (groupId) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter(id => id !== groupId));
      showTemporaryMessage(`You've left the group`);
    } else {
      setJoinedGroups([...joinedGroups, groupId]);
      showTemporaryMessage(`You've joined the group!`);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.trim()) {
      showTemporaryMessage(`Showing results for "${searchQuery}"`);
    }
  };

  // Create new community group
  const handleCreateCommunity = () => {
    if (!newGroupName || !newGroupDescription) {
      showTemporaryMessage('Please fill in all required fields');
      return;
    }

    // In a real app, this would send data to a server
    console.log('Creating new community:', {
      name: newGroupName,
      description: newGroupDescription,
      type: newGroupType,
      tags: newGroupTags.split(',').map(tag => tag.trim())
    });

    // Reset form and close modal
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupType('support');
    setNewGroupTags('');
    setShowCreateModal(false);
    showTemporaryMessage('Community created successfully!');
  };

  // Helper to show a temporary message
  const showTemporaryMessage = (message) => {
    setSuccessMessage(message);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="community-container">
      {successMessage && (
        <div className="notification-message">
          {successMessage}
        </div>
      )}
      
      <section className="community-hero">
        <div className="community-hero-content">
          <h1><TranslatedText text="Mental Wellness Community" as="span" /></h1>
          <p><TranslatedText text="Connect with others on your mental health journey. Find support, share experiences, and build lasting connections." /></p>
        </div>
      </section>

      <section className="community-filter">
        <div className="search-container">
          <input 
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <TranslatedText text="All" />
          </button>
          <button 
            className={`filter-btn ${filterType === 'support' ? 'active' : ''}`}
            onClick={() => setFilterType('support')}
          >
            <TranslatedText text="Support Groups" />
          </button>
          <button 
            className={`filter-btn ${filterType === 'practice' ? 'active' : ''}`}
            onClick={() => setFilterType('practice')}
          >
            <TranslatedText text="Practice Groups" />
          </button>
          <button 
            className={`filter-btn ${filterType === 'advocacy' ? 'active' : ''}`}
            onClick={() => setFilterType('advocacy')}
          >
            <TranslatedText text="Advocacy" />
          </button>
        </div>
      </section>

      <section className="community-groups">
        {filteredGroups.length > 0 ? (
          <div className="groups-grid">
            {filteredGroups.map(group => (
              <div key={group.id} className="group-card">
                <div className="group-card-image" style={{ backgroundImage: `url(${group.image})` }}>
                  <div className="group-type-tag">{group.type}</div>
                </div>
                <div className="group-card-content">
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                  <div className="group-meta">
                    <span className="members-count">
                      <i className="fas fa-users"></i> {joinedGroups.includes(group.id) ? group.members + 1 : group.members} members
                    </span>
                  </div>
                  <div className="group-tags">
                    {group.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <button 
                    className={`join-group-btn ${joinedGroups.includes(group.id) ? 'joined' : ''}`}
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    <TranslatedText text={joinedGroups.includes(group.id) ? "Leave Group" : "Join Group"} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3><TranslatedText text="No communities found" /></h3>
            <p><TranslatedText text="Try adjusting your search or filter criteria." /></p>
          </div>
        )}
      </section>

      <section className="create-community">
        <div className="create-card">
          <h2><TranslatedText text="Start Your Own Community" /></h2>
          <p><TranslatedText text="Don't see a group that meets your needs? Create your own community and connect with others who share similar experiences." /></p>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i>
            <TranslatedText text="Create Community" />
          </button>
        </div>
      </section>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><TranslatedText text="Create a New Community" /></h3>
              <button className="close-modal-btn" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><TranslatedText text="Community Name:" /></label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter a name for your community"
                />
              </div>
              
              <div className="form-group">
                <label><TranslatedText text="Description:" /></label>
                <textarea 
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Describe what your community is about"
                  rows="4"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label><TranslatedText text="Community Type:" /></label>
                <select 
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value)}
                >
                  <option value="support">Support Group</option>
                  <option value="practice">Practice Group</option>
                  <option value="advocacy">Advocacy</option>
                </select>
              </div>
              
              <div className="form-group">
                <label><TranslatedText text="Tags (comma separated):" /></label>
                <input 
                  type="text" 
                  value={newGroupTags}
                  onChange={(e) => setNewGroupTags(e.target.value)}
                  placeholder="anxiety, depression, mindfulness, etc."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                <TranslatedText text="Cancel" />
              </button>
              <button className="create-community-btn" onClick={handleCreateCommunity}>
                <TranslatedText text="Create Community" />
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="community-benefits">
        <h2><TranslatedText text="Benefits of Community Support" /></h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3><TranslatedText text="Mutual Support" /></h3>
            <p><TranslatedText text="Give and receive emotional support from others who truly understand your experiences." /></p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <h3><TranslatedText text="Shared Wisdom" /></h3>
            <p><TranslatedText text="Learn coping strategies and practical tips from people who have walked similar paths." /></p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3><TranslatedText text="Reduce Isolation" /></h3>
            <p><TranslatedText text="Break free from loneliness by connecting with others who validate your experiences." /></p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3><TranslatedText text="Safe Space" /></h3>
            <p><TranslatedText text="Express yourself in a non-judgmental environment dedicated to healing and growth." /></p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Community; 