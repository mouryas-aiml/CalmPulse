import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useVideoAnalysis } from '../contexts/VideoAnalysisContext';
import { useAudioAnalysis } from '../contexts/AudioAnalysisContext';
import { useTextAnalysis } from '../contexts/TextAnalysisContext';
import { useMindmitra } from '../contexts/MindmitraContext';
import TranslatedText from '../components/TranslatedText';

function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { apiKey: translationApiKey, setApiKey: setTranslationApiKey, languages, currentLanguage, changeLanguage } = useLanguage();
  const { apiKey: videoApiKey, setApiKey: setVideoApiKey } = useVideoAnalysis();
  const { apiKey: audioApiKey, setApiKey: setAudioApiKey } = useAudioAnalysis();
  const { apiKey: textApiKey, setApiKey: setTextApiKey } = useTextAnalysis();
  const { apiKey: mindmitraApiKey, setApiKey: setMindmitraApiKey } = useMindmitra();
  
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
    routinesCompleted: 12,
    mindmitraChats: 23,
    moodTrend: "Improving",
    averageMoodLastWeek: 7.5,
    moodHistory: [5.2, 4.8, 6.1, 6.5, 7.2, 7.8, 7.5]
  };

  // Real-time progress tracking
  const [realTimeProgress, setRealTimeProgress] = useState({
    insightsRead: 0,
    toolsUsed: 0,
    routinesCompleted: 0,
    mindmitraChats: 0
  });

  // Recent activities tracking
  const [recentActivities, setRecentActivities] = useState([]);

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

  // Add state for temporary translation API key
  const [tempTranslationApiKey, setTempTranslationApiKey] = useState('');

  // Add state for temporary video API key
  const [tempVideoApiKey, setTempVideoApiKey] = useState('');

  // Add state for temporary audio API key
  const [tempAudioApiKey, setTempAudioApiKey] = useState('');

  // Add state for temporary text API key
  const [tempTextApiKey, setTempTextApiKey] = useState('');

  // Add state for temporary mindmitra API key
  const [tempMindmitraApiKey, setTempMindmitraApiKey] = useState('');

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

  // Fetch real-time progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        if (currentUser) {
          // Try to get progress data from Firestore
          const progressRef = doc(db, 'userProgress', currentUser.uid);
          const progressDoc = await getDoc(progressRef);
          
          if (progressDoc.exists()) {
            const data = progressDoc.data();
            setRealTimeProgress({
              insightsRead: data.insightsRead || 0,
              toolsUsed: data.toolsUsed || 0,
              routinesCompleted: data.routinesCompleted || 0,
              mindmitraChats: data.mindmitraChats || 0
            });
          } else {
            // Create default progress document if none exists
            await setDoc(progressRef, {
              insightsRead: progressData.insightsRead,
              toolsUsed: progressData.toolsUsed,
              routinesCompleted: progressData.routinesCompleted,
              mindmitraChats: progressData.mindmitraChats,
              updatedAt: serverTimestamp()
            });
            
            setRealTimeProgress({
              insightsRead: progressData.insightsRead,
              toolsUsed: progressData.toolsUsed,
              routinesCompleted: progressData.routinesCompleted,
              mindmitraChats: progressData.mindmitraChats
            });
          }
          
          // Fetch recent activities
          const activitiesRef = collection(db, 'users', currentUser.uid, 'activities');
          const activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'), limit(5));
          const activitiesSnapshot = await getDocs(activitiesQuery);
          
          const activities = [];
          activitiesSnapshot.forEach(doc => {
            activities.push({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date()
            });
          });
          
          if (activities.length > 0) {
            setRecentActivities(activities);
          } else {
            // Fallback to default activities if none exist
            setRecentActivities([
              {
                id: '1',
                type: 'insight',
                title: 'Read Insight: "AI in Mental Healthcare"',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
              },
              {
                id: '2',
                type: 'chat',
                title: 'Chat session with Mindmitra',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
              },
              {
                id: '3',
                type: 'routine',
                title: 'Completed "Morning Meditation" routine',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
              },
              {
                id: '4',
                type: 'tool',
                title: 'Used "Breathing Exercise" tool',
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
              }
            ]);
          }
        } else {
          // Use local storage for non-authenticated users
          const storedProgress = JSON.parse(localStorage.getItem('userProgress'));
          if (storedProgress) {
            setRealTimeProgress(storedProgress);
          } else {
            setRealTimeProgress({
              insightsRead: progressData.insightsRead,
              toolsUsed: progressData.toolsUsed,
              routinesCompleted: progressData.routinesCompleted,
              mindmitraChats: progressData.mindmitraChats
            });
          }
          
          const storedActivities = JSON.parse(localStorage.getItem('recentActivities'));
          if (storedActivities) {
            // Convert timestamp strings back to Date objects
            const activities = storedActivities.map(activity => ({
              ...activity,
              timestamp: new Date(activity.timestamp)
            }));
            setRecentActivities(activities);
          } else {
            // Default activities
            setRecentActivities([
              {
                id: '1',
                type: 'insight',
                title: 'Read Insight: "AI in Mental Healthcare"',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
              },
              {
                id: '2',
                type: 'routine',
                title: 'Completed "Morning Meditation" routine',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
              },
              {
                id: '3',
                type: 'tool',
                title: 'Used "Breathing Exercise" tool',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
              }
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading progress data:", error);
        // Fallback to default values
        setRealTimeProgress({
          insightsRead: progressData.insightsRead,
          toolsUsed: progressData.toolsUsed,
          routinesCompleted: progressData.routinesCompleted,
          mindmitraChats: progressData.mindmitraChats
        });
      }
    };
    
    fetchProgressData();
  }, [currentUser]);

  // Add this useEffect to load translation API key
  useEffect(() => {
    if (translationApiKey) {
      setTempTranslationApiKey(translationApiKey);
    }
  }, [translationApiKey]);

  // Load video API key on mount
  useEffect(() => {
    if (videoApiKey) {
      setTempVideoApiKey(videoApiKey);
    }
  }, [videoApiKey]);

  // Load audio API key on mount
  useEffect(() => {
    if (audioApiKey) {
      setTempAudioApiKey(audioApiKey);
    }
  }, [audioApiKey]);

  // Load text API key on mount
  useEffect(() => {
    if (textApiKey) {
      setTempTextApiKey(textApiKey);
    }
  }, [textApiKey]);

  // Load mindmitra API key on mount
  useEffect(() => {
    if (mindmitraApiKey) {
      setTempMindmitraApiKey(mindmitraApiKey);
    }
  }, [mindmitraApiKey]);

  // Format relative time (e.g., "2 days ago")
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? <TranslatedText text="Just now" /> : <TranslatedText text={`${diffInMinutes} minutes ago`} />;
      }
      return diffInHours === 1 ? <TranslatedText text="1 hour ago" /> : <TranslatedText text={`${diffInHours} hours ago`} />;
    } else if (diffInDays === 1) {
      return <TranslatedText text="Yesterday" />;
    } else if (diffInDays < 7) {
      return <TranslatedText text={`${diffInDays} days ago`} />;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? <TranslatedText text="1 week ago" /> : <TranslatedText text={`${weeks} weeks ago`} />;
    } else {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? <TranslatedText text="1 month ago" /> : <TranslatedText text={`${months} months ago`} />;
    }
  };

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
      // Handle nested properties (like preferences.darkMode)
      const [parent, child] = name.split('.');
      if (name === 'preferences.language') {
        // Update language in context when changed in profile
        changeLanguage(value);
      }
      setEditedUser({
        ...editedUser,
        [parent]: {
          ...editedUser[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setEditedUser({
        ...editedUser,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle translation API key changes
  const handleTranslationApiKeyChange = (e) => {
    setTempTranslationApiKey(e.target.value);
  };

  // Save translation API key
  const saveTranslationApiKey = () => {
    setTranslationApiKey(tempTranslationApiKey);
    localStorage.setItem('translationApiKey', tempTranslationApiKey);
    setUpdateMessage({
      text: 'Translation API key updated successfully',
      isError: false
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setUpdateMessage({ text: '', isError: false });
    }, 3000);
  };

  // Handle video API key changes
  const handleVideoApiKeyChange = (e) => {
    setTempVideoApiKey(e.target.value);
  };

  // Save video API key
  const saveVideoApiKey = () => {
    setVideoApiKey(tempVideoApiKey);
    localStorage.setItem('videoApiKey', tempVideoApiKey);
    setUpdateMessage({
      text: 'Video API key updated successfully',
      isError: false
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setUpdateMessage({ text: '', isError: false });
    }, 3000);
  };

  // Handle audio API key changes
  const handleAudioApiKeyChange = (e) => {
    setTempAudioApiKey(e.target.value);
  };

  // Save audio API key
  const saveAudioApiKey = () => {
    setAudioApiKey(tempAudioApiKey);
    localStorage.setItem('audioApiKey', tempAudioApiKey);
    setUpdateMessage({
      text: 'Audio API key updated successfully',
      isError: false
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setUpdateMessage({ text: '', isError: false });
    }, 3000);
  };

  // Handle text API key changes
  const handleTextApiKeyChange = (e) => {
    setTempTextApiKey(e.target.value);
  };

  // Save text API key
  const saveTextApiKey = () => {
    setTextApiKey(tempTextApiKey);
    localStorage.setItem('textApiKey', tempTextApiKey);
    setUpdateMessage({
      text: 'Text Analysis API key updated successfully',
      isError: false
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setUpdateMessage({ text: '', isError: false });
    }, 3000);
  };

  // Handle mindmitra API key changes
  const handleMindmitraApiKeyChange = (e) => {
    setTempMindmitraApiKey(e.target.value);
  };

  // Save mindmitra API key
  const saveMindmitraApiKey = () => {
    setMindmitraApiKey(tempMindmitraApiKey);
    localStorage.setItem('mindmitraApiKey', tempMindmitraApiKey);
    setUpdateMessage({
      text: 'Mindmitra Chatbot API key updated successfully',
      isError: false
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setUpdateMessage({ text: '', isError: false });
    }, 3000);
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

  // Add this function for handling logout
  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to the get-started page
      navigate('/get-started');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Show loading state while fetching user data
  if (isLoading && !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p><TranslatedText text="Loading profile data..." /></p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <h1><TranslatedText text="My Profile" /></h1>
        <p className="profile-description">
          <TranslatedText text="Manage your account settings and view your progress" />
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
            <p className="join-date">
              <TranslatedText text="Member since" /> {user.joinDate}
            </p>
            
            <ul className="profile-nav">
              <li 
                className={activeTab === 'account' ? 'active' : ''}
                onClick={() => handleTabChange('account')}
              >
                <i className="fas fa-user"></i> <TranslatedText text="Account Settings" />
              </li>
              <li 
                className={activeTab === 'progress' ? 'active' : ''}
                onClick={() => handleTabChange('progress')}
              >
                <i className="fas fa-chart-line"></i> <TranslatedText text="My Progress" />
              </li>
              <li 
                className={activeTab === 'privacy' ? 'active' : ''}
                onClick={() => handleTabChange('privacy')}
              >
                <i className="fas fa-shield-alt"></i> <TranslatedText text="Privacy & Data" />
              </li>
              <li 
                className={activeTab === 'help' ? 'active' : ''}
                onClick={() => handleTabChange('help')}
              >
                <i className="fas fa-question-circle"></i> <TranslatedText text="Help & Support" />
              </li>
              <li 
                className={activeTab === 'logout' ? 'active' : ''}
                onClick={() => handleTabChange('logout')}
              >
                <i className="fas fa-sign-out-alt"></i> <TranslatedText text="Logout" />
              </li>
            </ul>
          </div>
          
          <div className="profile-main">
            {activeTab === 'account' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2><TranslatedText text="Account Settings" /></h2>
                  <button 
                    className={`edit-btn ${isEditing ? 'cancel' : ''}`}
                    onClick={toggleEditMode}
                  >
                    {isEditing ? (
                      <>
                        <i className="fas fa-times"></i> <TranslatedText text="Cancel" />
                      </>
                    ) : (
                      <>
                        <i className="fas fa-edit"></i> <TranslatedText text="Edit" />
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
                    <label><TranslatedText text="Full Name" /></label>
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
                    <label><TranslatedText text="Email Address" /></label>
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
                    <label><TranslatedText text="Password" /></label>
                    {!showPasswordFields ? (
                      <div className="password-section">
                        <div className="setting-value">••••••••</div>
                        <button 
                          onClick={togglePasswordFields}
                          className="change-password-btn"
                        >
                          <TranslatedText text="Change Password" />
                        </button>
                      </div>
                    ) : (
                      <form className="password-form" onSubmit={updateUserPassword}>
                        {passwordError && <div className="error-message">{passwordError}</div>}
                        {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                        
                        <div className="form-row">
                          <label htmlFor="old-password"><TranslatedText text="Current Password" /></label>
                        <input 
                            type="password"
                            id="old-password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                          />
                      </div>
                        
                        <div className="form-row">
                          <label htmlFor="new-password"><TranslatedText text="New Password" /></label>
                          <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="form-row">
                          <label htmlFor="confirm-password"><TranslatedText text="Confirm Password" /></label>
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
                            <TranslatedText text="Cancel" />
                          </button>
                          <button type="submit" className="save-btn">
                            <TranslatedText text="Update Password" />
                          </button>
                      </div>
                      </form>
                    )}
                  </div>
                  
                  <div className="form-divider"></div>
                  
                  {/* Standalone Preferences Component */}
                  <div className="preferences-container">
                    <div className="preference-item">
                      <div className="preference-label"><TranslatedText text="Notification Preferences" /></div>
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
                            <option value="Enabled"><TranslatedText text="Enabled" /></option>
                            <option value="Disabled"><TranslatedText text="Disabled" /></option>
                          </select>
                        ) : (
                          <div className="status-value">
                            {user.preferences.notifications ? <TranslatedText text="Enabled" /> : <TranslatedText text="Disabled" />}
                      </div>
                    )}
                      </div>
                  </div>
                  
                    <div className="preference-item">
                      <div className="preference-label"><TranslatedText text="Dark Mode" /></div>
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
                            <option value="Enabled"><TranslatedText text="Enabled" /></option>
                            <option value="Disabled"><TranslatedText text="Disabled" /></option>
                          </select>
                    ) : (
                          <div className="status-value">
                            {user.preferences.darkMode ? <TranslatedText text="Enabled" /> : <TranslatedText text="Disabled" />}
                      </div>
                    )}
                      </div>
                  </div>
                  
                    <div className="preference-item">
                      <div className="preference-label"><TranslatedText text="Language" /></div>
                      <div className="preference-status">
                    {isEditing ? (
                      <select 
                        name="preferences.language" 
                        value={editedUser.preferences.language} 
                        onChange={handleInputChange}
                      >
                            <option value="English"><TranslatedText text="English" /></option>
                            <option value="Hindi"><TranslatedText text="Hindi" /></option>
                            <option value="Tamil"><TranslatedText text="Tamil" /></option>
                            <option value="Telugu"><TranslatedText text="Telugu" /></option>
                            <option value="Punjabi"><TranslatedText text="Punjabi" /></option>
                            <option value="Spanish"><TranslatedText text="Spanish" /></option>
                            <option value="French"><TranslatedText text="French" /></option>
                            <option value="German"><TranslatedText text="German" /></option>
                            <option value="Chinese"><TranslatedText text="Chinese" /></option>
                            <option value="Japanese"><TranslatedText text="Japanese" /></option>
                      </select>
                    ) : (
                          <div className="status-value">{user.preferences.language}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="settings-section">
                    <h3><TranslatedText text="Translation Settings" /></h3>
                    <p><TranslatedText text="Configure your translation preferences and API key for language translation features." /></p>
                    
                    <div className="translation-section">
                      <div className="preference-item">
                        <div className="preference-label">
                          <TranslatedText text="Default Language" />
                        </div>
                        <div className="preference-status">
                    {isEditing ? (
                      <select 
                        name="preferences.language" 
                        value={editedUser.preferences.language} 
                        onChange={handleInputChange}
                      >
                              {languages.map(lang => (
                                <option key={lang.code} value={lang.name}>
                                  {lang.name}
                                </option>
                              ))}
                      </select>
                    ) : (
                            <div className="status-value">{user.preferences.language}</div>
                    )}
                        </div>
                      </div>
                      
                      <div className="api-key-input">
                        <label><TranslatedText text="Google Translate API Key" /></label>
                        <input 
                          type="text" 
                          value={tempTranslationApiKey} 
                          onChange={handleTranslationApiKeyChange}
                          placeholder="Enter Google Translate API Key"
                          className="api-key-field"
                        />
                        <button className="save-api-key" onClick={saveTranslationApiKey}>
                          <i className="fas fa-save"></i> <TranslatedText text="Save API Key" />
                        </button>
                        <p className="key-note">
                          <TranslatedText text="Current API key: " />{translationApiKey}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3><TranslatedText text="Video Analysis Settings" /></h3>
                    <p><TranslatedText text="Configure your video analysis API key for emotion detection and speech transcription features." /></p>
                    
                    <div className="translation-section">
                      <div className="api-key-input">
                        <label><TranslatedText text="Google Cloud Video Intelligence API Key" /></label>
                        <input 
                          type="text" 
                          value={tempVideoApiKey} 
                          onChange={handleVideoApiKeyChange}
                          placeholder="Enter Google Cloud Video Intelligence API Key"
                          className="api-key-field"
                        />
                        <button className="save-api-key" onClick={saveVideoApiKey}>
                          <i className="fas fa-save"></i> <TranslatedText text="Save API Key" />
                        </button>
                        <p className="key-note">
                          <TranslatedText text="Current API key: " />{videoApiKey}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3><TranslatedText text="Audio Analysis Settings" /></h3>
                    <p><TranslatedText text="Configure your audio analysis API key for speech-to-text and sentiment analysis features." /></p>
                    
                    <div className="translation-section">
                      <div className="api-key-input">
                        <label><TranslatedText text="Google Cloud Speech-to-Text API Key" /></label>
                        <input 
                          type="text" 
                          value={tempAudioApiKey} 
                          onChange={handleAudioApiKeyChange}
                          placeholder="Enter Google Cloud Speech-to-Text API Key"
                          className="api-key-field"
                        />
                        <button className="save-api-key" onClick={saveAudioApiKey}>
                          <i className="fas fa-save"></i> <TranslatedText text="Save API Key" />
                        </button>
                        <p className="key-note">
                          <TranslatedText text="Current API key: " />{audioApiKey}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3><TranslatedText text="Text Analysis Settings" /></h3>
                    <p><TranslatedText text="Configure your text analysis API key for sentiment analysis and natural language processing features." /></p>
                    
                    <div className="translation-section">
                      <div className="api-key-input">
                        <label><TranslatedText text="Google Cloud Natural Language API Key" /></label>
                        <input 
                          type="text" 
                          value={tempTextApiKey} 
                          onChange={handleTextApiKeyChange}
                          placeholder="Enter Google Cloud Natural Language API Key"
                          className="api-key-field"
                        />
                        <button className="save-api-key" onClick={saveTextApiKey}>
                          <i className="fas fa-save"></i> <TranslatedText text="Save API Key" />
                        </button>
                        <p className="key-note">
                          <TranslatedText text="Current API key: " />{textApiKey}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3><TranslatedText text="Mindmitra Chatbot Settings" /></h3>
                    <p><TranslatedText text="Configure your Mindmitra chatbot API key for advanced conversational AI and mental health support features." /></p>
                    
                    <div className="translation-section">
                      <div className="api-key-input">
                        <label><TranslatedText text="Mindmitra Chatbot API Key" /></label>
                        <input 
                          type="text" 
                          value={tempMindmitraApiKey} 
                          onChange={handleMindmitraApiKeyChange}
                          placeholder="Enter Mindmitra Chatbot API Key"
                          className="api-key-field"
                        />
                        <button className="save-api-key" onClick={saveMindmitraApiKey}>
                          <i className="fas fa-save"></i> <TranslatedText text="Save API Key" />
                        </button>
                        <p className="key-note">
                          <TranslatedText text="Current API key: " />{mindmitraApiKey}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="form-actions">
                      <button className="cancel-btn" onClick={cancelChanges}>
                        <i className="fas fa-times"></i> <TranslatedText text="Cancel" />
                      </button>
                      <button className="save-btn" onClick={saveChanges}>
                        <i className="fas fa-check"></i> <TranslatedText text="Save Changes" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'progress' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2><TranslatedText text="My Progress" /></h2>
                  <div className="date-filter">
                    <select>
                      <option><TranslatedText text="Last 7 Days" /></option>
                      <option><TranslatedText text="Last 30 Days" /></option>
                      <option><TranslatedText text="Last 3 Months" /></option>
                      <option><TranslatedText text="Last 6 Months" /></option>
                      <option><TranslatedText text="All Time" /></option>
                    </select>
                  </div>
                </div>
                
                <div className="stats-overview">
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-lightbulb"></i></div>
                    <div className="stat-value">{realTimeProgress.insightsRead}</div>
                    <div className="stat-label"><TranslatedText text="Insights Read" /></div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-tools"></i></div>
                    <div className="stat-value">{realTimeProgress.toolsUsed}</div>
                    <div className="stat-label"><TranslatedText text="Tools Used" /></div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
                    <div className="stat-value">{realTimeProgress.routinesCompleted}</div>
                    <div className="stat-label"><TranslatedText text="Routines Completed" /></div>
                  </div>
                </div>
                
                <div className="mood-tracker">
                  <h3><TranslatedText text="Wellness Trend" /></h3>
                  <div className="mood-status">
                    <div className="trend-label">
                      <i className={`fas fa-arrow-${progressData.moodTrend === 'Improving' ? 'up' : 'down'}`}></i>
                      <TranslatedText text={progressData.moodTrend} />
                    </div>
                    <div className="average-mood">
                      <strong><TranslatedText text="Average wellness score last week:" /></strong> 
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
                        <span><TranslatedText text="Mon" /></span>
                        <span><TranslatedText text="Tue" /></span>
                        <span><TranslatedText text="Wed" /></span>
                        <span><TranslatedText text="Thu" /></span>
                        <span><TranslatedText text="Fri" /></span>
                        <span><TranslatedText text="Sat" /></span>
                        <span><TranslatedText text="Sun" /></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="activity-summary">
                  <h3><TranslatedText text="Recent Activity" /></h3>
                  <ul className="activity-list">
                    {recentActivities.map(activity => (
                      <li className="activity-item" key={activity.id}>
                        <i className={`fas ${
                          activity.type === 'insight' ? 'fa-lightbulb' : 
                          activity.type === 'chat' ? 'fa-comments' :
                          activity.type === 'routine' ? 'fa-calendar-check' :
                          activity.type === 'tool' ? 'fa-tools' : 'fa-chart-line'
                        }`}></i>
                      <div className="activity-content">
                          <div className="activity-title"><TranslatedText text={activity.title} /></div>
                          <div className="activity-time">{getRelativeTime(activity.timestamp)}</div>
                      </div>
                    </li>
                    ))}
                    {recentActivities.length === 0 && (
                      <li className="no-activity">
                        <p><TranslatedText text="No recent activity. Start using the app to track your progress!" /></p>
                    </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2><TranslatedText text="Privacy & Data" /></h2>
                </div>
                
                <div className="privacy-section">
                  <div className="privacy-group">
                    <h3><TranslatedText text="Data Privacy Settings" /></h3>
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
                        <h4><TranslatedText text="Anonymous Data Sharing" /></h4>
                        <p><TranslatedText text="Allow anonymized data to be used for improving mental health support recommendations." /></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="privacy-group">
                    <h3><TranslatedText text="Your Data" /></h3>
                    <p>
                      <TranslatedText text="Your privacy matters to us. All your personal data and journal entries are encrypted and stored securely." />
                    </p>
                    <div className="data-actions">
                      <button className="data-btn">
                        <i className="fas fa-download"></i> <TranslatedText text="Download My Data" />
                      </button>
                      <button className="data-btn delete">
                        <i className="fas fa-trash-alt"></i> <TranslatedText text="Delete Account" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'help' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2><TranslatedText text="Help & Support" /></h2>
                </div>
                
                <div className="help-section">
                  <div className="faq-section">
                    <h3><TranslatedText text="Frequently Asked Questions" /></h3>
                    <div className="faq-list">
                      <div className="faq-item">
                        <div className="faq-question">
                          <i className="fas fa-question-circle"></i>
                          <TranslatedText text="How does the mood analysis work?" />
                        </div>
                        <div className="faq-answer">
                          <TranslatedText text="Our AI analyzes text and speech patterns to detect emotional cues. The analysis looks at word choice, sentence structure, and voice characteristics to identify potential indicators of various emotions." />
                        </div>
                      </div>
                      
                      <div className="faq-item">
                        <div className="faq-question">
                          <i className="fas fa-question-circle"></i>
                          <TranslatedText text="Is my data shared with therapists?" />
                        </div>
                        <div className="faq-answer">
                          <TranslatedText text="Your data is only shared with therapists if you explicitly choose to connect with one through our platform and grant permission to share specific information." />
                        </div>
                      </div>
                      
                      <div className="faq-item">
                        <div className="faq-question">
                          <i className="fas fa-question-circle"></i>
                          <TranslatedText text="How can I get the most out of this app?" />
                        </div>
                        <div className="faq-answer">
                          <TranslatedText text="Regular check-ins, journal entries, and practicing recommended coping tools are great ways to benefit from the app. We recommend at least 3 check-ins per week for the best results." />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-support">
                    <h3><TranslatedText text="Contact Support" /></h3>
                    <p><TranslatedText text="Need additional help? Our support team is here for you." /></p>
                    <button className="support-btn">
                      <i className="fas fa-envelope"></i> <TranslatedText text="Email Support" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'logout' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2><TranslatedText text="Logout" /></h2>
          </div>
                
                <div className="settings-section">
                  <h3><TranslatedText text="Sign Out" /></h3>
                  <p><TranslatedText text="Sign out from your CalmPulse account. You will need to log in again to access your account." /></p>
                  <button className="logout-btn profile-logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> <TranslatedText text="Logout" />
                  </button>
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