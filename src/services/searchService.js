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

// Fallback function when proxies fail - returns predefined mental health resources
export const getFallbackMentalHealthResources = (query) => {
  // Common mental health topics and their resources
  const resources = {
    anxiety: [
      { 
        title: 'Understanding Anxiety Disorders', 
        snippet: 'Anxiety disorders are mental health conditions that involve excessive worry, fear, or anxiety. They include generalized anxiety disorder, panic disorder, phobias, and more.',
        link: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders'
      },
      { 
        title: 'Anxiety Coping Strategies', 
        snippet: 'Techniques include deep breathing, progressive muscle relaxation, mindfulness meditation, physical exercise, and cognitive restructuring.',
        link: 'https://www.apa.org/topics/anxiety'
      }
    ],
    depression: [
      { 
        title: 'Depression: Understanding the Basics', 
        snippet: "Depression is more than just feeling sad. It's a serious mental health condition that affects how you think, feel, and handle daily activities.",
        link: 'https://www.nimh.nih.gov/health/topics/depression'
      },
      { 
        title: 'Treatment Options for Depression', 
        snippet: 'Effective treatments include psychotherapy (talk therapy), medication, or a combination of both. Self-help strategies can also be beneficial.',
        link: 'https://www.mayoclinic.org/diseases-conditions/depression/diagnosis-treatment/drc-20356013'
      }
    ],
    stress: [
      { 
        title: 'Stress Management Techniques', 
        snippet: 'Effective strategies include identifying stress triggers, practicing relaxation techniques, maintaining physical activity, and building a support network.',
        link: 'https://www.apa.org/topics/stress'
      },
      { 
        title: 'The Physical Effects of Stress', 
        snippet: 'Chronic stress can affect your immune, digestive, cardiovascular, and reproductive systems. It\'s important to manage stress for overall health.',
        link: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress/art-20046037'
      }
    ],
    // General resources that apply to most mental health queries
    general: [
      { 
        title: 'National Institute of Mental Health', 
        snippet: 'The NIMH is the lead federal agency for research on mental disorders, providing reliable information on mental health conditions.',
        link: 'https://www.nimh.nih.gov/'
      },
      { 
        title: 'American Psychological Association', 
        snippet: 'The APA is the leading scientific and professional organization representing psychology in the United States.',
        link: 'https://www.apa.org/'
      },
      { 
        title: 'Mental Health America', 
        snippet: 'MHA is a community-based nonprofit dedicated to addressing the needs of those living with mental illness.',
        link: 'https://www.mhanational.org/'
      }
    ]
  };
  
  // Video resources for common mental health topics
  const videoResources = {
    anxiety: [
      {
        title: "5-Minute Breathing Exercise for Anxiety",
        link: "https://www.youtube.com/watch?v=aXItOY0sLRY",
        thumbnail: "https://img.youtube.com/vi/aXItOY0sLRY/mqdefault.jpg"
      },
      {
        title: "How to Stop Anxiety Attacks - 3 Quick Steps",
        link: "https://www.youtube.com/watch?v=ZJqEEJf_TGU",
        thumbnail: "https://img.youtube.com/vi/ZJqEEJf_TGU/mqdefault.jpg"
      }
    ],
    depression: [
      {
        title: "Understanding Depression - Stanford Medicine",
        link: "https://www.youtube.com/watch?v=GOK1tKFFIQI",
        thumbnail: "https://img.youtube.com/vi/GOK1tKFFIQI/mqdefault.jpg"
      },
      {
        title: "5 Evidence-Based Techniques to Beat Depression",
        link: "https://www.youtube.com/watch?v=TVgQ_tgWMyU",
        thumbnail: "https://img.youtube.com/vi/TVgQ_tgWMyU/mqdefault.jpg"
      }
    ],
    stress: [
      {
        title: "Stress Management - 10 Minute Deep Relaxation",
        link: "https://www.youtube.com/watch?v=c1Ndym-IsQg",
        thumbnail: "https://img.youtube.com/vi/c1Ndym-IsQg/mqdefault.jpg"
      },
      {
        title: "How Stress Affects Your Brain - TED-Ed",
        link: "https://www.youtube.com/watch?v=WuyPuH9ojCE",
        thumbnail: "https://img.youtube.com/vi/WuyPuH9ojCE/mqdefault.jpg"
      }
    ],
    general: [
      {
        title: "How to Practice Emotional First Aid - TED Talk",
        link: "https://www.youtube.com/watch?v=F2hc2FLOdhI",
        thumbnail: "https://img.youtube.com/vi/F2hc2FLOdhI/mqdefault.jpg"
      },
      {
        title: "The Power of Mental Health Self-Care Routines",
        link: "https://www.youtube.com/watch?v=bhVXjq7VUR8",
        thumbnail: "https://img.youtube.com/vi/bhVXjq7VUR8/mqdefault.jpg"
      }
    ]
  };
  
  // Determine which category the query falls into
  const lowerQuery = query.toLowerCase();
  let textResults = [];
  let videos = [];
  
  if (lowerQuery.includes('anxi')) {
    textResults = resources.anxiety;
    videos = videoResources.anxiety;
  } else if (lowerQuery.includes('depress')) {
    textResults = resources.depression;
    videos = videoResources.depression;
  } else if (lowerQuery.includes('stress')) {
    textResults = resources.stress;
    videos = videoResources.stress;
  } else {
    // If no specific category matches, use all resources for a comprehensive response
    textResults = [
      ...resources.anxiety.slice(0, 1),
      ...resources.depression.slice(0, 1),
      ...resources.stress.slice(0, 1),
      ...resources.general
    ];
    
    videos = [
      videoResources.general[0],
      videoResources.anxiety[0],
      videoResources.depression[0]
    ];
  }
  
  // Always include general resources for text if not enough category-specific results
  if (textResults.length < 3) {
    textResults = [...textResults, ...resources.general];
  }
  
  // Format the results in the same structure as our web search
  return {
    textResults: textResults.map(resource => ({
      title: resource.title,
      snippet: resource.snippet,
      link: resource.link
    })),
    videoResults: videos,
    imageResults: [],
    source: 'fallback-resources',
    success: true
  };
}; 