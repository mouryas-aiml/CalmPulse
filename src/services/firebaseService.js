import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  arrayUnion 
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