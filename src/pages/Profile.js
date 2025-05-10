import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
  // Get user data from localStorage
  const [user, setUser] = useState({
    name: "Guest User",
    email: "guest@example.com",
    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    preferences: {
      notifications: true,
      darkMode: false,
      language: "English",
      dataSharingConsent: true
    }
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(prevUser => ({
        ...prevUser,
        name: storedUser.name || prevUser.name,
        email: storedUser.email || prevUser.email
      }));
    }
  }, []);

  // Sample progress data
  const progressData = {
    journalEntries: 12,
    toolsUsed: 8,
    sessionsCompleted: 15,
    moodTrend: "Improving",
    averageMoodLastWeek: 7.5,
    moodHistory: [5.2, 4.8, 6.1, 6.5, 7.2, 7.8, 7.5]
  };

  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({...user});

  // Update editedUser when user changes (after localStorage load)
  useEffect(() => {
    setEditedUser({...user});
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isEditing) {
      setIsEditing(false);
      setEditedUser({...user});
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedUser({...user});
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setEditedUser({
        ...editedUser,
        [section]: {
          ...editedUser[section],
          [field]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setEditedUser({
        ...editedUser,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const saveChanges = () => {
    setUser({...editedUser});
    setIsEditing(false);
  };

  const cancelChanges = () => {
    setEditedUser({...user});
    setIsEditing(false);
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <h1>My Profile</h1>
        <p className="profile-description">
          Manage your account settings and view your progress
        </p>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="user-avatar">
              <img src={user.avatar} alt={user.name} />
              {isEditing && (
                <button className="change-avatar-btn">
                  <i className="fas fa-camera"></i>
                </button>
              )}
            </div>
            <h2 className="user-name">{user.name}</h2>
            <p className="join-date">Member since {user.joinDate}</p>
            
            <ul className="profile-nav">
              <li 
                className={activeTab === 'account' ? 'active' : ''}
                onClick={() => handleTabChange('account')}
              >
                <i className="fas fa-user"></i> Account Settings
              </li>
              <li 
                className={activeTab === 'progress' ? 'active' : ''}
                onClick={() => handleTabChange('progress')}
              >
                <i className="fas fa-chart-line"></i> My Progress
              </li>
              <li 
                className={activeTab === 'privacy' ? 'active' : ''}
                onClick={() => handleTabChange('privacy')}
              >
                <i className="fas fa-shield-alt"></i> Privacy & Data
              </li>
              <li 
                className={activeTab === 'help' ? 'active' : ''}
                onClick={() => handleTabChange('help')}
              >
                <i className="fas fa-question-circle"></i> Help & Support
              </li>
            </ul>
          </div>
          
          <div className="profile-main">
            {activeTab === 'account' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Account Settings</h2>
                  <button 
                    className={`edit-btn ${isEditing ? 'cancel' : ''}`}
                    onClick={toggleEditMode}
                  >
                    {isEditing ? (
                      <>
                        <i className="fas fa-times"></i> Cancel
                      </>
                    ) : (
                      <>
                        <i className="fas fa-edit"></i> Edit
                      </>
                    )}
                  </button>
                </div>
                
                <div className="settings-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="name" 
                        value={editedUser.name} 
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="setting-value">{user.name}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        name="email" 
                        value={editedUser.email} 
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="setting-value">{user.email}</div>
                    )}
                  </div>
                  
                  <div className="form-divider"></div>
                  
                  <div className="form-group">
                    <label>Notification Preferences</label>
                    {isEditing ? (
                      <div className="checkbox-group">
                        <input 
                          type="checkbox" 
                          id="notifications" 
                          name="preferences.notifications" 
                          checked={editedUser.preferences.notifications} 
                          onChange={handleInputChange}
                        />
                        <label htmlFor="notifications">Receive email notifications</label>
                      </div>
                    ) : (
                      <div className="setting-value">
                        {user.preferences.notifications ? 'Enabled' : 'Disabled'}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Display Mode</label>
                    {isEditing ? (
                      <div className="checkbox-group">
                        <input 
                          type="checkbox" 
                          id="darkMode" 
                          name="preferences.darkMode" 
                          checked={editedUser.preferences.darkMode} 
                          onChange={handleInputChange}
                        />
                        <label htmlFor="darkMode">Dark Mode</label>
                      </div>
                    ) : (
                      <div className="setting-value">
                        {user.preferences.darkMode ? 'Dark Mode' : 'Light Mode'}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Language</label>
                    {isEditing ? (
                      <select 
                        name="preferences.language" 
                        value={editedUser.preferences.language} 
                        onChange={handleInputChange}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    ) : (
                      <div className="setting-value">{user.preferences.language}</div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="form-actions">
                      <button className="cancel-btn" onClick={cancelChanges}>
                        Cancel
                      </button>
                      <button className="save-btn" onClick={saveChanges}>
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'progress' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Progress</h2>
                  <div className="date-filter">
                    <select>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 3 Months</option>
                      <option>All Time</option>
                    </select>
                  </div>
                </div>
                
                <div className="stats-overview">
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-book"></i></div>
                    <div className="stat-value">{progressData.journalEntries}</div>
                    <div className="stat-label">Journal Entries</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-tools"></i></div>
                    <div className="stat-value">{progressData.toolsUsed}</div>
                    <div className="stat-label">Tools Used</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
                    <div className="stat-value">{progressData.sessionsCompleted}</div>
                    <div className="stat-label">Sessions Completed</div>
                  </div>
                </div>
                
                <div className="mood-tracker">
                  <h3>Mood Trend</h3>
                  <div className="mood-status">
                    <div className="trend-label">
                      <i className={`fas fa-arrow-${progressData.moodTrend === 'Improving' ? 'up' : 'down'}`}></i>
                      {progressData.moodTrend}
                    </div>
                    <div className="average-mood">
                      <strong>Average mood last week:</strong> 
                      <span className="mood-score">{progressData.averageMoodLastWeek}/10</span>
                    </div>
                  </div>
                  
                  <div className="mood-chart">
                    <div className="chart-placeholder">
                      <div className="chart-bars">
                        {progressData.moodHistory.map((value, index) => (
                          <div 
                            key={index} 
                            className="chart-bar" 
                            style={{height: `${value * 10}%`}}
                            data-value={value}
                          ></div>
                        ))}
                      </div>
                      <div className="chart-days">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="activity-summary">
                  <h3>Recent Activity</h3>
                  <ul className="activity-list">
                    <li className="activity-item">
                      <i className="fas fa-book"></i>
                      <div className="activity-content">
                        <div className="activity-title">Journal Entry: "Finding Balance"</div>
                        <div className="activity-time">2 days ago</div>
                      </div>
                    </li>
                    <li className="activity-item">
                      <i className="fas fa-brain"></i>
                      <div className="activity-content">
                        <div className="activity-title">Completed "Mindful Breathing" exercise</div>
                        <div className="activity-time">3 days ago</div>
                      </div>
                    </li>
                    <li className="activity-item">
                      <i className="fas fa-comment"></i>
                      <div className="activity-content">
                        <div className="activity-title">Chat session with AI assistant</div>
                        <div className="activity-time">4 days ago</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Privacy & Data</h2>
                </div>
                
                <div className="privacy-section">
                  <div className="privacy-group">
                    <h3>Data Privacy Settings</h3>
                    <div className="privacy-option">
                      <div className="privacy-toggle">
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={user.preferences.dataSharingConsent}
                            onChange={(e) => {
                              if (isEditing) {
                                handleInputChange({
                                  target: {
                                    name: 'preferences.dataSharingConsent',
                                    type: 'checkbox',
                                    checked: e.target.checked
                                  }
                                });
                              }
                            }}
                            disabled={!isEditing}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="privacy-info">
                        <h4>Anonymous Data Sharing</h4>
                        <p>Allow anonymized data to be used for improving mental health support recommendations.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="privacy-group">
                    <h3>Your Data</h3>
                    <p>
                      Your privacy matters to us. All your personal data and journal entries are encrypted and stored securely.
                    </p>
                    <div className="data-actions">
                      <button className="data-btn">
                        <i className="fas fa-download"></i> Download My Data
                      </button>
                      <button className="data-btn delete">
                        <i className="fas fa-trash-alt"></i> Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'help' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Help & Support</h2>
                </div>
                
                <div className="help-section">
                  <div className="faq-section">
                    <h3>Frequently Asked Questions</h3>
                    <div className="faq-list">
                      <div className="faq-item">
                        <div className="faq-question">
                          <i className="fas fa-question-circle"></i>
                          How does the mood analysis work?
                        </div>
                        <div className="faq-answer">
                          Our AI analyzes text and speech patterns to detect emotional cues. The analysis looks at word choice, sentence structure, and voice characteristics to identify potential indicators of various emotions.
                        </div>
                      </div>
                      
                      <div className="faq-item">
                        <div className="faq-question">
                          <i className="fas fa-question-circle"></i>
                          Is my data shared with therapists?
                        </div>
                        <div className="faq-answer">
                          Your data is only shared with therapists if you explicitly choose to connect with one through our platform and grant permission to share specific information.
                        </div>
                      </div>
                      
                      <div className="faq-item">
                        <div className="faq-question">
                          <i className="fas fa-question-circle"></i>
                          How can I get the most out of this app?
                        </div>
                        <div className="faq-answer">
                          Regular check-ins, journal entries, and practicing recommended coping tools are great ways to benefit from the app. We recommend at least 3 check-ins per week for the best results.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-support">
                    <h3>Contact Support</h3>
                    <p>Need additional help? Our support team is here for you.</p>
                    <button className="support-btn">
                      <i className="fas fa-envelope"></i> Email Support
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 