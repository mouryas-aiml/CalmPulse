// This service handles web search functionality without requiring API keys
// using a free CORS proxy

// List of available free CORS proxies (we'll cycle through them if one fails)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

// Function to extract search results from HTML content
const extractSearchResults = (htmlContent) => {
  try {
    // Create a DOM parser to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Define result object to store different types of results
    const results = {
      textResults: [],
      videoResults: [],
      imageResults: [],
      error: null
    };

    // Extract text search results - try multiple selector patterns
    const searchResultSelectors = [
      'div.g', 
      'div.xpd', 
      'div[data-hveid]', 
      'div.tF2Cxc',
      'div.yuRUbf'
    ];
    
    searchResultSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      
      if (elements && elements.length > 0) {
        console.log(`Found ${elements.length} results with selector: ${selector}`);
        
        elements.forEach(result => {
          // Look for headings and links - try various selector patterns
          const titleElement = result.querySelector('h3') || result.querySelector('h4') || result.querySelector('a > h3');
          const linkElement = result.querySelector('a[href]');
          const snippetElement = 
            result.querySelector('div.VwiC3b') || 
            result.querySelector('span.aCOpRe') || 
            result.querySelector('div[role="complementary"]') ||
            result.querySelector('.IsZvec');
          
          if (titleElement && linkElement) {
            const title = titleElement.textContent.trim();
            const link = linkElement.href;
            const snippet = snippetElement ? snippetElement.textContent.trim() : 'No description available';
            
            // Check for duplicates before adding
            const isDuplicate = results.textResults.some(item => item.title === title || item.link === link);
            
            if (!isDuplicate && title && link) {
              results.textResults.push({
                title,
                link,
                snippet
              });
            }
          }
        });
      }
    });
    
    // Try to extract video results - use multiple selectors
    const videoSelectors = [
      'div.dXiKIc', 
      'div.P94G9b', 
      'div[jscontroller="K6HGfd"]',
      'video',
      'div.X5OiLe'
    ];
    
    videoSelectors.forEach(selector => {
      const videoResults = doc.querySelectorAll(selector);
      
      if (videoResults && videoResults.length > 0) {
        console.log(`Found ${videoResults.length} video results with selector: ${selector}`);
        
        videoResults.forEach(videoResult => {
          const titleElement = 
            videoResult.querySelector('h3') || 
            videoResult.querySelector('div.fc9yUc') || 
            videoResult.querySelector('a');
          const linkElement = videoResult.querySelector('a[href]');
          const thumbnailElement = videoResult.querySelector('img');
          
          if (titleElement && linkElement) {
            const title = titleElement.textContent.trim();
            const link = linkElement.href;
            const thumbnail = thumbnailElement ? thumbnailElement.src : null;
            
            // Check for duplicates
            const isDuplicate = results.videoResults.some(item => 
              (item.title === title) || (item.link === link)
            );
            
            if (!isDuplicate && title && link) {
              results.videoResults.push({
                title,
                link,
                thumbnail
              });
            }
          }
        });
      }
    });
    
    // Add some demo/fallback video results if none were found but text results were
    if (results.videoResults.length === 0 && results.textResults.length > 0) {
      // Add some mental health related videos that might be helpful
      results.videoResults = [
        {
          title: "5-Minute Meditation for Anxiety Relief",
          link: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
          thumbnail: "https://img.youtube.com/vi/O-6f5wQXSu8/mqdefault.jpg"
        },
        {
          title: "Understanding Depression: What You Need to Know",
          link: "https://www.youtube.com/watch?v=1Evwgu369Jw",
          thumbnail: "https://img.youtube.com/vi/1Evwgu369Jw/mqdefault.jpg"
        }
      ];
    }
    
    // Log what we found
    console.log(`Extracted ${results.textResults.length} text results and ${results.videoResults.length} video results`);
    
    return results;
  } catch (error) {
    console.error('Error extracting search results:', error);
    return {
      textResults: [],
      videoResults: [],
      imageResults: [],
      error: 'Failed to extract search results from response'
    };
  }
};

// Main search function
export const performWebSearch = async (searchQuery) => {
  // Sanitize the search query
  const sanitizedQuery = encodeURIComponent(searchQuery);
  const searchUrl = `https://www.google.com/search?q=${sanitizedQuery}`;
  
  // Try each proxy until one works
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Attempting to fetch search results using proxy: ${proxy}`);
      
      const response = await fetch(`${proxy}${encodeURIComponent(searchUrl)}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.error(`Proxy ${proxy} failed with status: ${response.status}`);
        continue; // Try the next proxy
      }
      
      const htmlContent = await response.text();
      
      // Check if we got a valid response
      if (htmlContent.includes('captcha') || htmlContent.includes('CAPTCHA')) {
        console.warn('CAPTCHA detected in response, proxy may be rate limited');
        continue; // Try the next proxy
      }
      
      // Extract results from HTML
      const results = extractSearchResults(htmlContent);
      
      // If we found some results, return them
      if (results.textResults.length > 0 || results.videoResults.length > 0) {
        return {
          ...results,
          source: 'web-search',
          success: true
        };
      } else {
        console.warn('No results extracted from response');
      }
    } catch (error) {
      console.error(`Error with proxy ${proxy}:`, error);
      // Continue to next proxy
    }
  }
  
  // If all proxies failed, return a fallback response with a link to Google
  return {
    textResults: [],
    videoResults: [],
    imageResults: [],
    success: false,
    error: 'Could not retrieve search results. Try again later.',
    fallbackUrl: `https://www.google.com/search?q=${sanitizedQuery}`
  };
};

// Function to get fallback mental health resources
export const getFallbackMentalHealthResources = (query) => {
  // Convert query to lowercase for easier matching
  const queryLower = query.toLowerCase();
  
  // Define response sets for common mental health queries
  const stressReductionResources = {
    textResults: [
      {
        title: "Effective Stress Reduction Techniques",
        snippet: "Practice deep breathing exercises: Inhale for 4 counts, hold for 2, exhale for 6. Regular physical activity for 30 minutes daily can significantly reduce stress levels. Adopt a healthy diet with reduced caffeine and sugar. Prioritize 7-8 hours of quality sleep and practice regular mindfulness meditation.",
        link: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
        isFallback: true
      },
      {
        title: "Progressive Muscle Relaxation for Stress Relief",
        snippet: "Tense and then gradually release each muscle group from head to toe. Hold the tension for 5 seconds, then release for 30 seconds, noticing the contrast between tension and relaxation. Practice for 10-15 minutes daily for best results.",
        link: "https://www.apa.org/topics/stress/tips",
        isFallback: true
      },
      {
        title: "Nature's Effect on Stress Levels",
        snippet: "Spending just 20 minutes in nature can lower stress hormone levels. Research shows that 'forest bathing' (spending time in forests) reduces stress, improves mood, and boosts immune function. Try to incorporate outdoor time into your daily routine.",
        link: "https://www.health.harvard.edu/mind-and-mood/a-20-minute-nature-break-relieves-stress",
        isFallback: true
      }
    ],
    videoResults: [
      {
        title: "5-Minute Stress Relief Meditation",
        description: "This guided meditation uses breathing techniques and visualization to quickly reduce stress levels.",
        thumbnailUrl: "https://picsum.photos/200/112",
        videoUrl: "https://example.com/stress-meditation",
        isFallback: true
      }
    ]
  };
  
  const calmingTechniquesResources = {
    textResults: [
      {
        title: "Quick Calming Techniques for Immediate Relief",
        snippet: "Try the 5-4-3-2-1 grounding technique: Acknowledge 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste. Practice box breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Splash cold water on your face to trigger the mammalian dive reflex.",
        link: "https://www.healthline.com/health/grounding-techniques",
        isFallback: true
      },
      {
        title: "Physical Techniques to Calm Down Quickly",
        snippet: "Place your hand on your chest and breathe deeply into your belly. Try progressive muscle relaxation by tensing and releasing muscle groups. Use bilateral stimulation by tapping alternating sides of your body. Hum a calming song to regulate your nervous system.",
        link: "https://www.verywellmind.com/how-to-calm-down-quickly-when-overwhelmed-5088674",
        isFallback: true
      },
      {
        title: "The Science Behind Quick Calming Techniques",
        snippet: "Deep breathing activates the parasympathetic nervous system, triggering a relaxation response. Physical grounding techniques shift focus from emotional distress to sensory experiences. Gentle stretching releases tension and increases blood flow to muscles.",
        link: "https://www.psychologytoday.com/us/blog/some-assembly-required/201703/how-self-regulate-your-nervous-system",
        isFallback: true
      }
    ],
    videoResults: [
      {
        title: "90-Second Calm Down Technique",
        description: "Learn how to calm your nervous system in just 90 seconds using evidence-based techniques.",
        thumbnailUrl: "https://picsum.photos/200/112",
        videoUrl: "https://example.com/quick-calm",
        isFallback: true
      }
    ]
  };
  
  const anxietyAttackResources = {
    textResults: [
      {
        title: "Managing Anxiety Attacks: Step-by-Step Guide",
        snippet: "Recognize that you're having an anxiety attack and remind yourself it's temporary. Focus on your breathing – inhale for 4 counts, exhale for 6. Use grounding techniques like the 5-4-3-2-1 method. Challenge catastrophic thoughts by asking 'What's the evidence?' Close your eyes and visualize a safe, calm place.",
        link: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
        isFallback: true
      },
      {
        title: "Physical Approaches to Stop Anxiety Attacks",
        snippet: "Try applying an ice pack to your face or holding ice cubes in your hands to disrupt the anxiety cycle. Engage in vigorous physical movement for 1-2 minutes to burn off excess adrenaline. Practice progressive muscle relaxation from head to toe. Focus on a single object and describe it in detail.",
        link: "https://www.health.harvard.edu/blog/coping-with-anxiety-and-panic-during-a-crisis-2020032619885",
        isFallback: true
      },
      {
        title: "Long-term Strategies to Prevent Future Anxiety Attacks",
        snippet: "Regular exercise helps reduce anxiety sensitivity. Maintain a consistent sleep schedule of 7-9 hours. Limit caffeine, alcohol, and sugar intake. Practice daily mindfulness meditation. Consider cognitive-behavioral therapy (CBT) which is highly effective for anxiety disorders.",
        link: "https://adaa.org/understanding-anxiety/panic-disorder-agoraphobia/treatment/treatment-strategies-panic-disorder",
        isFallback: true
      }
    ],
    videoResults: [
      {
        title: "Stop Anxiety Attacks With This Simple Technique",
        description: "Learn the physiological techniques that can halt an anxiety attack in progress.",
        thumbnailUrl: "https://picsum.photos/200/112",
        videoUrl: "https://example.com/anxiety-technique",
        isFallback: true
      }
    ]
  };
  
  const breathingExercisesResources = {
    textResults: [
      {
        title: "Evidence-Based Breathing Exercises for Mental Health",
        snippet: "Box Breathing: Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat for 5 minutes. 4-7-8 Breathing: Inhale for 4 counts, hold for 7, exhale for 8. Diaphragmatic Breathing: Place one hand on chest, one on stomach, breathe deeply so only the hand on stomach moves. Alternate Nostril Breathing: Close right nostril, inhale through left, close left, exhale through right.",
        link: "https://www.health.harvard.edu/lung-health-and-disease/learning-diaphragmatic-breathing",
        isFallback: true
      },
      {
        title: "Breathing Exercises for Different Emotional States",
        snippet: "For anxiety: Use extended exhale breathing (4-count inhale, 6-count exhale). For anger: Try cooling breath (inhale through mouth as if sipping through straw, exhale through nose). For focus: Use rhythmic breathing (equal inhale and exhale with mental counting). For sleep: Practice 4-7-8 breathing while lying down.",
        link: "https://www.healthline.com/health/breathing-exercises",
        isFallback: true
      },
      {
        title: "The Science Behind Breathing Exercises",
        snippet: "Controlled breathing activates the parasympathetic nervous system, reducing stress hormones like cortisol. Extended exhales stimulate the vagus nerve, which improves heart rate variability and emotional regulation. Regular breathing practice increases respiratory capacity and oxygen efficiency.",
        link: "https://www.scientificamerican.com/article/proper-breathing-brings-better-health/",
        isFallback: true
      }
    ],
    videoResults: [
      {
        title: "3 Breathing Exercises for Immediate Calm",
        description: "A step-by-step guide to three powerful breathing techniques you can use anywhere.",
        thumbnailUrl: "https://picsum.photos/200/112",
        videoUrl: "https://example.com/breathing-exercises",
        isFallback: true
      }
    ]
  };
  
  // Match query to appropriate resources
  if (queryLower.includes("stress") || queryLower.includes("overwhelm")) {
    return stressReductionResources;
  } else if (queryLower.includes("calm") || queryLower.includes("relax")) {
    return calmingTechniquesResources;
  } else if (queryLower.includes("anxiety") || queryLower.includes("panic") || queryLower.includes("worry")) {
    return anxietyAttackResources;
  } else if (queryLower.includes("breath") || queryLower.includes("breathing")) {
    return breathingExercisesResources;
  } else {
    // Default fallback resources for other mental health queries
    return {
      textResults: [
        {
          title: "Mental Health Self-Care Strategies",
          snippet: "Practice daily mindfulness meditation starting with just 5 minutes. Maintain social connections - aim to connect meaningfully with others regularly. Get regular physical activity - even short walks can improve mood. Ensure adequate sleep by maintaining a consistent schedule. Limit social media consumption and news intake if it causes distress.",
          link: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
          isFallback: true
        },
        {
          title: "When to Seek Professional Mental Health Support",
          snippet: "Consider reaching out if symptoms persist for more than two weeks, interfere with daily functioning, cause significant distress, include thoughts of self-harm, or involve substance use to cope. Professional help can include therapy, counseling, psychiatric services, or support groups.",
          link: "https://www.mentalhealth.gov/get-help/immediate-help",
          isFallback: true
        },
        {
          title: "Building Mental Health Resilience",
          snippet: "Develop resilience through purposeful daily routines, positive self-talk practices, realistic goal setting, and celebrating small wins. Learn to recognize cognitive distortions and challenge unhelpful thought patterns. Regular journaling and gratitude practices can significantly improve outlook.",
          link: "https://www.apa.org/topics/resilience",
          isFallback: true
        }
      ],
      videoResults: [
        {
          title: "5-Minute Mental Health Check-In",
          description: "A simple daily practice to assess and improve your mental wellbeing.",
          thumbnailUrl: "https://picsum.photos/200/112",
          videoUrl: "https://example.com/mental-health-check",
          isFallback: true
        }
      ]
    };
  }
}; 