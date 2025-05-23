import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  arrayUnion,
  getDocs,
  query,
  orderBy,
  limit,
  increment,
  onSnapshot
} from 'firebase/firestore';

// User Profile Operations
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Mood Analysis Operations
export const saveMoodEntry = async (userId, moodData) => {
  try {
    const moodRef = collection(db, 'users', userId, 'moods');
    await addDoc(moodRef, {
      ...moodData,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw error;
  }
};

// Routine Operations
export const saveRoutine = async (userId, routineData) => {
  try {
    const routineRef = collection(db, 'users', userId, 'routines');
    await addDoc(routineRef, {
      ...routineData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving routine:', error);
    throw error;
  }
};

export const updateRoutine = async (userId, routineId, routineData) => {
  try {
    const routineRef = doc(db, 'users', userId, 'routines', routineId);
    await updateDoc(routineRef, {
      ...routineData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
};

// Journal Operations
export const saveJournalEntry = async (userId, journalData) => {
  try {
    const journalRef = collection(db, 'users', userId, 'journal');
    await addDoc(journalRef, {
      ...journalData,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

// Therapy Session Operations
export const saveTherapySession = async (userId, sessionData) => {
  try {
    const sessionRef = collection(db, 'users', userId, 'therapy-sessions');
    await addDoc(sessionRef, {
      ...sessionData,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving therapy session:', error);
    throw error;
  }
};

// Coping Tools Progress
export const saveCopingToolProgress = async (userId, toolData) => {
  try {
    const toolRef = collection(db, 'users', userId, 'coping-tools');
    await addDoc(toolRef, {
      ...toolData,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving coping tool progress:', error);
    throw error;
  }
};

// AI Analysis Data
export const saveAIAnalysis = async (userId, analysisData) => {
  try {
    const analysisRef = collection(db, 'users', userId, 'ai-analysis');
    await addDoc(analysisRef, {
      ...analysisData,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving AI analysis:', error);
    throw error;
  }
};

// Goals and Progress
export const saveGoal = async (userId, goalData) => {
  try {
    const goalRef = collection(db, 'users', userId, 'goals');
    await addDoc(goalRef, {
      ...goalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

export const updateGoalProgress = async (userId, goalId, progressData) => {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(goalRef, {
      progress: arrayUnion(progressData),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating goal progress:', error);
    throw error;
  }
};

// Meditation Progress
export const saveMeditationSession = async (userId, meditationData) => {
  try {
    const meditationRef = collection(db, 'users', userId, 'meditation-sessions');
    await addDoc(meditationRef, {
      ...meditationData,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving meditation session:', error);
    throw error;
  }
};

// User Settings
export const updateUserSettings = async (userId, settingsData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      settings: settingsData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Get User Data
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Mindmitra Topic Interactions
export const trackTopicInteraction = async (userId, category, topic) => {
  try {
    // Create a unique ID for the topic
    const topicId = `${category}-${topic.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Reference to the user's topic interactions document
    const topicRef = doc(db, 'users', userId, 'topic-interactions', topicId);
    
    // Check if document exists
    const topicDoc = await getDoc(topicRef);
    
    if (topicDoc.exists()) {
      // Update existing topic interaction
      await updateDoc(topicRef, {
        count: increment(1),
        lastInteraction: serverTimestamp()
      });
    } else {
      // Create new topic interaction
      await setDoc(topicRef, {
        category,
        topic,
        count: 1,
        firstInteraction: serverTimestamp(),
        lastInteraction: serverTimestamp()
      });
    }
    
    // Also update the category interaction count
    const categoryRef = doc(db, 'users', userId, 'category-interactions', category.replace(/\s+/g, '-').toLowerCase());
    const categoryDoc = await getDoc(categoryRef);
    
    if (categoryDoc.exists()) {
      await updateDoc(categoryRef, {
        count: increment(1),
        lastInteraction: serverTimestamp()
      });
    } else {
      await setDoc(categoryRef, {
        category,
        count: 1,
        firstInteraction: serverTimestamp(),
        lastInteraction: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking topic interaction:', error);
    throw error;
  }
};

export const getUserTopicInteractions = async (userId) => {
  try {
    // Get all topic interactions for the user
    const topicInteractionsRef = collection(db, 'users', userId, 'topic-interactions');
    const topicSnapshot = await getDocs(query(
      topicInteractionsRef, 
      orderBy('count', 'desc'),
      limit(20)
    ));
    
    const topicInteractions = [];
    topicSnapshot.forEach(doc => {
      topicInteractions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get category interactions
    const categoryInteractionsRef = collection(db, 'users', userId, 'category-interactions');
    const categorySnapshot = await getDocs(query(
      categoryInteractionsRef,
      orderBy('count', 'desc')
    ));
    
    const categoryInteractions = [];
    categorySnapshot.forEach(doc => {
      categoryInteractions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      topics: topicInteractions,
      categories: categoryInteractions
    };
  } catch (error) {
    console.error('Error getting user topic interactions:', error);
    throw error;
  }
};

// Save chat message
export const saveChatMessage = async (userId, message) => {
  try {
    const chatRef = collection(db, 'users', userId, 'chat-history');
    await addDoc(chatRef, {
      ...message,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

// User Progress Tracking
export const getUserProgress = async (userId) => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      return progressDoc.data();
    }
    
    // Create default progress document if none exists
    const defaultProgress = {
      insightsRead: 0,
      toolsUsed: 0,
      routinesCompleted: 0,
      mindmitraChats: 0,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(progressRef, defaultProgress);
    return defaultProgress;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (userId, field, value) => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    
    // Check if document exists
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      // Update existing document with increment
      await updateDoc(progressRef, {
        [field]: typeof value === 'number' ? value : increment(1),
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new document with initial value
      const initialData = {
        insightsRead: 0,
        toolsUsed: 0,
        routinesCompleted: 0,
        mindmitraChats: 0,
        [field]: typeof value === 'number' ? value : 1,
        updatedAt: serverTimestamp()
      };
      await setDoc(progressRef, initialData);
    }
    
    // Also log this as an activity
    await addUserActivity(userId, getActivityTypeFromField(field), getActivityTitleFromField(field));
    
    return true;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

export const subscribeToUserProgress = (userId, callback) => {
  if (!userId) return null;
  
  const progressRef = doc(db, 'userProgress', userId);
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(progressRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      // Create default progress document if none exists
      const defaultProgress = {
        insightsRead: 0,
        toolsUsed: 0,
        routinesCompleted: 0,
        mindmitraChats: 0,
        updatedAt: new Date()
      };
      callback(defaultProgress);
      
      // Create the document in Firestore
      setDoc(progressRef, {
        ...defaultProgress,
        updatedAt: serverTimestamp()
      }).catch(error => {
        console.error('Error creating default progress document:', error);
      });
    }
  }, (error) => {
    console.error('Error listening to user progress:', error);
  });
  
  // Return unsubscribe function
  return unsubscribe;
};

// User Activities
export const addUserActivity = async (userId, type, title) => {
  try {
    const activityRef = collection(db, 'users', userId, 'activities');
    await addDoc(activityRef, {
      type,
      title,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error adding user activity:', error);
    throw error;
  }
};

export const getUserActivities = async (userId, limit = 10) => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const activitiesQuery = query(
      activitiesRef, 
      orderBy('timestamp', 'desc'), 
      limit(limit)
    );
    
    const snapshot = await getDocs(activitiesQuery);
    
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting user activities:', error);
    throw error;
  }
};

export const subscribeToUserActivities = (userId, limit = 5, callback) => {
  if (!userId) return null;
  
  const activitiesRef = collection(db, 'users', userId, 'activities');
  const activitiesQuery = query(
    activitiesRef, 
    orderBy('timestamp', 'desc'), 
    limit(limit)
  );
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      });
    });
    callback(activities);
  }, (error) => {
    console.error('Error listening to user activities:', error);
  });
  
  // Return unsubscribe function
  return unsubscribe;
};

// Helper functions
const getActivityTypeFromField = (field) => {
  switch (field) {
    case 'insightsRead': return 'insight';
    case 'toolsUsed': return 'tool';
    case 'routinesCompleted': return 'routine';
    case 'mindmitraChats': return 'chat';
    default: return 'other';
  }
};

const getActivityTitleFromField = (field) => {
  switch (field) {
    case 'insightsRead': return 'Read an insight';
    case 'toolsUsed': return 'Used a coping tool';
    case 'routinesCompleted': return 'Completed a routine';
    case 'mindmitraChats': return 'Chat session with Mindmitra';
    default: return 'Activity recorded';
  }
}; 