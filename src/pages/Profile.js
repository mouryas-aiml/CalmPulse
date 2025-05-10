import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

function Profile() {
  const { currentUser } = useAuth();
  
  // Default user data
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

  // Sample progress data
  const progressData = {
    insightsRead: 15,
    toolsUsed: 8,
    sessionsCompleted: 10,
    mindmitraChats: 23,
    moodTrend: "Improving",
    averageMoodLastWeek: 7.5,
    moodHistory: [5.2, 4.8, 6.1, 6.5, 7.2, 7.8, 7.5]
  };

  // Password reset fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // UI States
  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({...user});
  const [updateMessage, setUpdateMessage] = useState({ text: '', isError: false });
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from Firebase and Firestore on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        if (currentUser) {
          // Start with auth data
          const updatedUser = {
            ...user,
            name: currentUser.displayName || user.name,
            email: currentUser.email || user.email,
            avatar: currentUser.photoURL || user.avatar
          };
          
          // Try to get Firestore data
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Create a timestamp for join date if not present
            const createdAt = userData.createdAt ? 
              new Date(userData.createdAt.toDate()) : 
              new Date();
            
            updatedUser.name = userData.displayName || updatedUser.name;
            updatedUser.email = userData.email || updatedUser.email;
            updatedUser.avatar = userData.photoURL || updatedUser.avatar;
            updatedUser.joinDate = createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            // Get preferences if they exist
            if (userData.preferences) {
              updatedUser.preferences = {
                ...updatedUser.preferences,
                ...userData.preferences
              };
            }
            
            console.log("User data loaded from Firestore");
          } else {
            console.log("No Firestore document for user, creating one...");
            // Create a new document if none exists
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email.split('@')[0],
              photoURL: currentUser.photoURL || null,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              preferences: updatedUser.preferences
            });
          }
          
          setUser(updatedUser);
        } else {
          // Fallback to localStorage if no Firebase user
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) {
            setUser(prevUser => ({
              ...prevUser,
              name: storedUser.name || prevUser.name,
              email: storedUser.email || prevUser.email
            }));
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  // Update editedUser when user changes (after Firebase load)
  useEffect(() => {
    setEditedUser({...user});
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isEditing) {
      setIsEditing(false);
      setEditedUser({...user});
    }
    // Reset password fields and messages
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordFields(false);
    setPasswordError('');
    setPasswordSuccess('');
    setUpdateMessage({ text: '', isError: false });
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedUser({...user});
    }
    setUpdateMessage({ text: '', isError: false });
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

  const saveChanges = async () => {
    setUpdateMessage({ text: '', isError: false });
    setIsLoading(true);
    
    try {
      // Only if we have a currentUser from Firebase
      if (auth.currentUser) {
        // Update display name in Firebase Auth if changed
        if (editedUser.name !== user.name) {
          await updateProfile(auth.currentUser, {
            displayName: editedUser.name
          });
        }
        
        // Update email in Firebase Auth if changed
        if (editedUser.email !== user.email) {
          await updateEmail(auth.currentUser, editedUser.email);
        }
        
        // Update Firestore document
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          displayName: editedUser.name,
          email: editedUser.email,
          lastUpdated: serverTimestamp(),
          preferences: editedUser.preferences
        });
        
        // Update local user state
        setUser({...editedUser});
        
        // Update localStorage for fallback
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          name: editedUser.name,
          email: editedUser.email
        }));
        
        setUpdateMessage({ text: 'Profile updated successfully', isError: false });
      } else {
        // Just update local state if no Firebase user
        setUser({...editedUser});
        setUpdateMessage({ text: 'Profile updated successfully', isError: false });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage({ 
        text: `Error updating profile: ${error.message}`, 
        isError: true 
      });
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const cancelChanges = () => {
    setEditedUser({...user});
    setIsEditing(false);
    setUpdateMessage({ text: '', isError: false });
  };

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    // Reset password fields and messages
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  const updateUserPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Password validation
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      if (auth.currentUser) {
        // Re-authenticate user before password change
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          oldPassword
        );
        
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Update password
        await updatePassword(auth.currentUser, newPassword);
        
        // Reset fields and show success message
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('Password updated successfully');
        setShowPasswordFields(false);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      
      switch (error.code) {
        case 'auth/wrong-password':
          setPasswordError('Current password is incorrect');
          break;
        case 'auth/weak-password':
          setPasswordError('New password is too weak');
          break;
        default:
          setPasswordError(`Error: ${error.message}`);
      }
    }
  };

  // Show loading state while fetching user data
  if (isLoading && !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

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
                
                {updateMessage.text && (
                  <div className={`message ${updateMessage.isError ? 'error' : 'success'}`}>
                    {updateMessage.text}
                  </div>
                )}
                
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
                  
                  {/* Password management section */}
                  <div className="form-group">
                    <label>Password</label>
                    {!showPasswordFields ? (
                      <div className="password-section">
                        <div className="setting-value">••••••••</div>
                        <button 
                          onClick={togglePasswordFields}
                          className="change-password-btn"
                        >
                          Change Password
                        </button>
                      </div>
                    ) : (
                      <form className="password-form" onSubmit={updateUserPassword}>
                        {passwordError && <div className="error-message">{passwordError}</div>}
                        {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                        
                        <div className="form-row">
                          <label htmlFor="old-password">Current Password</label>
                          <input
                            type="password"
                            id="old-password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="form-row">
                          <label htmlFor="new-password">New Password</label>
                          <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="form-row">
                          <label htmlFor="confirm-password">Confirm Password</label>
                          <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="password-actions">
                          <button type="button" onClick={togglePasswordFields} className="cancel-btn">
                            Cancel
                          </button>
                          <button type="submit" className="save-btn">
                            Update Password
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                  
                  <div className="form-divider"></div>
                  
                  {/* Standalone Preferences Component */}
                  <div className="preferences-container">
                    <div className="preference-item">
                      <div className="preference-label">Notification Preferences</div>
                      <div className="preference-status">
                        {isEditing ? (
                          <select 
                            name="preferences.notifications" 
                            value={editedUser.preferences.notifications ? "Enabled" : "Disabled"} 
                            onChange={(e) => {
                              handleInputChange({
                                target: {
                                  name: 'preferences.notifications',
                                  type: 'checkbox',
                                  checked: e.target.value === "Enabled"
                                }
                              });
                            }}
                          >
                            <option value="Enabled">Enabled</option>
                            <option value="Disabled">Disabled</option>
                          </select>
                        ) : (
                          <div className="status-value">
                            {user.preferences.notifications ? 'Enabled' : 'Disabled'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="preference-item">
                      <div className="preference-label">Dark Mode</div>
                      <div className="preference-status">
                        {isEditing ? (
                          <select 
                            name="preferences.darkMode" 
                            value={editedUser.preferences.darkMode ? "Enabled" : "Disabled"} 
                            onChange={(e) => {
                              handleInputChange({
                                target: {
                                  name: 'preferences.darkMode',
                                  type: 'checkbox',
                                  checked: e.target.value === "Enabled"
                                }
                              });
                            }}
                          >
                            <option value="Enabled">Enabled</option>
                            <option value="Disabled">Disabled</option>
                          </select>
                        ) : (
                          <div className="status-value">
                            {user.preferences.darkMode ? 'Enabled' : 'Disabled'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="preference-item">
                      <div className="preference-label">Language</div>
                      <div className="preference-status">
                        {isEditing ? (
                          <select 
                            name="preferences.language" 
                            value={editedUser.preferences.language} 
                            onChange={handleInputChange}
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Punjabi">Punjabi</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Japanese">Japanese</option>
                          </select>
                        ) : (
                          <div className="status-value">{user.preferences.language}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="form-actions">
                      <button className="cancel-btn" onClick={cancelChanges}>
                        <i className="fas fa-times"></i> Cancel
                      </button>
                      <button className="save-btn" onClick={saveChanges}>
                        <i className="fas fa-check"></i> Save Changes
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
                      <option>Last 6 Months</option>
                      <option>All Time</option>
                    </select>
                  </div>
                </div>
                
                <div className="stats-overview">
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-lightbulb"></i></div>
                    <div className="stat-value">{progressData.insightsRead}</div>
                    <div className="stat-label">Insights Read</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-tools"></i></div>
                    <div className="stat-value">{progressData.toolsUsed}</div>
                    <div className="stat-label">Tools Used</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-comments"></i></div>
                    <div className="stat-value">{progressData.mindmitraChats}</div>
                    <div className="stat-label">Mindmitra Chats</div>
                  </div>
                </div>
                
                <div className="mood-tracker">
                  <h3>Wellness Trend</h3>
                  <div className="mood-status">
                    <div className="trend-label">
                      <i className={`fas fa-arrow-${progressData.moodTrend === 'Improving' ? 'up' : 'down'}`}></i>
                      {progressData.moodTrend}
                    </div>
                    <div className="average-mood">
                      <strong>Average wellness score last week:</strong> 
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
                      <i className="fas fa-lightbulb"></i>
                      <div className="activity-content">
                        <div className="activity-title">Read Insight: "AI in Mental Healthcare"</div>
                        <div className="activity-time">1 day ago</div>
                      </div>
                    </li>
                    <li className="activity-item">
                      <i className="fas fa-comments"></i>
                      <div className="activity-content">
                        <div className="activity-title">Chat session with Mindmitra</div>
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
                      <i className="fas fa-lightbulb"></i>
                      <div className="activity-content">
                        <div className="activity-title">Read Insight: "Trauma-Informed Care Approach"</div>
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