import { useState } from 'react';
import * as firebaseService from '../services/firebaseService';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOperation = async (operation, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    // User Profile Operations
    updateUserProfile: (userId, profileData) => 
      handleOperation(firebaseService.updateUserProfile, userId, profileData),
    getUserData: (userId) => 
      handleOperation(firebaseService.getUserData, userId),
    updateUserSettings: (userId, settingsData) => 
      handleOperation(firebaseService.updateUserSettings, userId, settingsData),

    // Mood Analysis Operations
    saveMoodEntry: (userId, moodData) => 
      handleOperation(firebaseService.saveMoodEntry, userId, moodData),

    // Routine Operations
    saveRoutine: (userId, routineData) => 
      handleOperation(firebaseService.saveRoutine, userId, routineData),
    updateRoutine: (userId, routineId, routineData) => 
      handleOperation(firebaseService.updateRoutine, userId, routineId, routineData),

    // Journal Operations
    saveJournalEntry: (userId, journalData) => 
      handleOperation(firebaseService.saveJournalEntry, userId, journalData),

    // Therapy Session Operations
    saveTherapySession: (userId, sessionData) => 
      handleOperation(firebaseService.saveTherapySession, userId, sessionData),

    // Coping Tools Operations
    saveCopingToolProgress: (userId, toolData) => 
      handleOperation(firebaseService.saveCopingToolProgress, userId, toolData),

    // AI Analysis Operations
    saveAIAnalysis: (userId, analysisData) => 
      handleOperation(firebaseService.saveAIAnalysis, userId, analysisData),

    // Goals Operations
    saveGoal: (userId, goalData) => 
      handleOperation(firebaseService.saveGoal, userId, goalData),
    updateGoalProgress: (userId, goalId, progressData) => 
      handleOperation(firebaseService.updateGoalProgress, userId, goalId, progressData),

    // Meditation Operations
    saveMeditationSession: (userId, meditationData) => 
      handleOperation(firebaseService.saveMeditationSession, userId, meditationData),
  };
}; 