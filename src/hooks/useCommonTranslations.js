import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const defaultTranslations = {
  // Navigation items
  home: 'Home',
  aiHealthAnalysis: 'AI Health Analysis',
  therapists: 'Therapists',
  copingTools: 'Coping Tools',
  mindmitra: 'Mindmitra',
  insights: 'Insights',
  profile: 'Profile',
  logout: 'Logout',
  
  // Page titles
  personalizedJourney: 'Personalized Mental Wellness Journey',
  discoverWellness: 'Discover Your Path to Wellness',
  successStories: 'Success Stories',
  beginJourney: 'Begin Your Wellness Journey Today',
  
  // Common actions
  getStarted: 'Get Started',
  startAnalysis: 'Start AI Analysis',
  findTherapists: 'Find Therapists',
  explore: 'Explore',
  chatNow: 'Chat Now',
  findMatch: 'Find Match',
  viewTools: 'View Tools',
  
  // Settings
  settings: 'Settings',
  language: 'Language',
  helpSupport: 'Help & Support',
  getSupport: 'Get Support',
};

/**
 * Hook that provides translated common navigation items and page titles
 * 
 * @returns {Object} translations - Object containing translated strings
 * @returns {boolean} isLoading - Whether translations are loading
 */
export const useCommonTranslations = () => {
  const { translate, currentLanguage, isLoading } = useLanguage();
  const [translations, setTranslations] = useState(defaultTranslations);

  useEffect(() => {
    async function translateCommonStrings() {
      // Reset to default English translations when language is English
      if (currentLanguage === 'English') {
        setTranslations(defaultTranslations);
        return;
      }

      const translatedStrings = {};
      
      // Translate all keys in parallel
      const translationPromises = Object.entries(defaultTranslations).map(async ([key, value]) => {
        const translatedValue = await translate(value);
        return [key, translatedValue];
      });
      
      try {
        // Wait for all translations to complete
        const translatedEntries = await Promise.all(translationPromises);
        
        // Create new translations object
        translatedEntries.forEach(([key, value]) => {
          translatedStrings[key] = value;
        });
        
        setTranslations(translatedStrings);
      } catch (error) {
        console.error('Error translating common strings:', error);
        // Fallback to default translations on error
        setTranslations(defaultTranslations);
      }
    }
    
    translateCommonStrings();
  }, [currentLanguage, translate]);

  return { translations, isLoading };
};

export default useCommonTranslations;