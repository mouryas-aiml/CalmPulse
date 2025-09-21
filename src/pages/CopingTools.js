import React, { useState, useEffect, useRef } from 'react';
import './CopingTools.css';
import TranslatedText from '../components/TranslatedText';

const copingTools = [
  {
    id: 1,
    title: "Breathing Exercises",
    category: "Stress Relief",
    duration: "5 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Guided breathing exercises to help reduce stress and anxiety.",
    steps: [
      "Find a comfortable seated position",
      "Inhale deeply through your nose for 4 counts",
      "Hold your breath for 2 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat for 5 minutes"
    ]
  },
  {
    id: 2,
    title: "Progressive Muscle Relaxation",
    category: "Stress Relief",
    duration: "15 min",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Systematically tense and relax muscle groups to reduce physical tension.",
    steps: [
      "Lie down in a comfortable position",
      "Focus on your breathing for 1 minute",
      "Tense the muscles in your feet for 5 seconds, then release",
      "Continue up your body: calves, thighs, abdomen, arms, shoulders, and face",
      "Notice the feeling of relaxation as you release each muscle group"
    ]
  },
  {
    id: 3,
    title: "Mindful Journaling",
    category: "Mindfulness",
    duration: "10 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1517842264405-72bb906a1936?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Write down your thoughts and feelings to gain clarity and emotional release.",
    steps: [
      "Find a quiet space with minimal distractions",
      "Set a timer for 10 minutes",
      "Write continuously about how you're feeling right now",
      "Don't worry about grammar or structure—focus on expressing your thoughts",
      "Review what you've written and reflect on any patterns or insights"
    ]
  },
  {
    id: 4,
    title: "Guided Visualization",
    category: "Relaxation",
    duration: "10 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Use your imagination to visualize a peaceful scene and relax your mind.",
    steps: [
      "Find a comfortable position and close your eyes",
      "Take several deep breaths",
      "Imagine yourself in a peaceful location (beach, forest, etc.)",
      "Engage all your senses: what do you see, hear, smell, feel?",
      "Spend time exploring this safe place before gently returning to awareness"
    ]
  },
  {
    id: 5,
    title: "Gratitude Practice",
    category: "Positive Psychology",
    duration: "5 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1602525962574-3bc829fbed3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Cultivate appreciation for the positive aspects of your life.",
    steps: [
      "Take a few moments to reflect on your day",
      "Identify three things you're grateful for (big or small)",
      "For each item, write down why you're grateful for it",
      "Notice how you feel as you acknowledge these positive aspects",
      "Try to practice regularly to build a habit of gratitude"
    ]
  },
  {
    id: 6,
    title: "5-4-3-2-1 Grounding Technique",
    category: "Anxiety Management",
    duration: "3 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Use your senses to ground yourself in the present moment during anxiety or panic.",
    steps: [
      "Acknowledge 5 things you can see",
      "Acknowledge 4 things you can touch/feel",
      "Acknowledge 3 things you can hear",
      "Acknowledge 2 things you can smell",
      "Acknowledge 1 thing you can taste"
    ]
  },
  {
    id: 7,
    title: "Color Match Memory Game",
    category: "Games",
    duration: "5-10 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Improve focus and reduce anxiety with this memory matching game that engages your brain's executive functions.",
    steps: [
      "Start with a 4x4 grid of face-down cards",
      "Flip two cards at a time to find matching pairs",
      "Try to remember the location of cards you've already seen",
      "Take deep breaths between moves to maintain calm",
      "Challenge yourself with larger grids as you improve"
    ],
    gameType: "Memory"
  },
  {
    id: 8,
    title: "Mindful Puzzle Solving",
    category: "Games",
    duration: "10-15 min",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Engage in puzzle solving as a form of focused meditation to reduce rumination and promote flow state.",
    steps: [
      "Choose a puzzle that interests you (sudoku, crossword, jigsaw)",
      "Set a timer for your desired duration",
      "Focus completely on the puzzle, noticing when your mind wanders",
      "Gently bring your attention back to the puzzle when distracted",
      "Notice the calming effect of sustained, focused attention"
    ],
    gameType: "Puzzle"
  },
  {
    id: 9,
    title: "Emotion Sorting Game",
    category: "Games",
    duration: "8 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1576328077645-2dd68934d2b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Sort different emotions into categories to build emotional intelligence and recognition skills.",
    steps: [
      "Cards with different emotions will appear on screen",
      "Sort them into categories (happy, sad, angry, etc.)",
      "Try to identify subtle differences between similar emotions",
      "Reflect on how these emotions feel in your body",
      "Practice naming emotions you experience regularly"
    ],
    gameType: "Educational"
  },
  {
    id: 10,
    title: "Balloon Breathing Game",
    category: "Games",
    duration: "5 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "A visual breathing exercise where you inflate and deflate virtual balloons in time with your breath.",
    steps: [
      "Follow the animated balloon on screen",
      "Inhale slowly as the balloon inflates",
      "Hold your breath briefly at the top",
      "Exhale slowly as the balloon deflates",
      "Continue for 5-10 cycles or until you feel calmer"
    ],
    gameType: "Breathing"
  },
  {
    id: 11,
    title: "Thought Bubbles",
    category: "Games",
    duration: "7 min",
    difficulty: "Medium",
    image: "https://images.unsplash.com/photo-1515023115689-589c33041d3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Pop negative thought bubbles and strengthen positive thinking patterns with this interactive game.",
    steps: [
      "Negative and positive thoughts appear as bubbles",
      "Pop negative thought bubbles before they reach the top",
      "Let positive thought bubbles float up and collect them",
      "As you progress, bubbles move faster to increase challenge",
      "Practice recognizing and countering negative thoughts"
    ],
    gameType: "Cognitive"
  },
  {
    id: 12,
    title: "Mindful Coloring",
    category: "Games",
    duration: "15-20 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Digital coloring book with intricate patterns to promote mindfulness and creative expression.",
    steps: [
      "Choose from various templates (mandalas, nature scenes, etc.)",
      "Select colors that reflect your current mood",
      "Focus on the process rather than the final product",
      "Notice the sensations of coloring and your breathing",
      "Save your creation as a reminder of your mindful moment"
    ],
    gameType: "Creative"
  }
];

function CopingTools() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeTab, setActiveTab] = useState('tools');
  
  // Exercise state
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  
  // Feedback and completion state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [mood, setMood] = useState(null);
  const [effectiveness, setEffectiveness] = useState(null);
  const [notes, setNotes] = useState('');
  const [exerciseHistory, setExerciseHistory] = useState([]);
  
  // Routine state
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [selectedRoutineTools, setSelectedRoutineTools] = useState([]);
  const [savedRoutines, setSavedRoutines] = useState([]);
  
  // Routine exercise state
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [currentRoutineTools, setCurrentRoutineTools] = useState([]);
  const [currentRoutineToolIndex, setCurrentRoutineToolIndex] = useState(0);
  const [isRoutineActive, setIsRoutineActive] = useState(false);
  const [showRoutineCompletionModal, setShowRoutineCompletionModal] = useState(false);

  const categories = ['All', 'Stress Relief', 'Mindfulness', 'Relaxation', 'Positive Psychology', 'Anxiety Management', 'Games'];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'games') {
      setSelectedCategory('Games');
    } else if (tab === 'all') {
      setSelectedCategory('All');
    } else if (tab === 'traditional') {
      setSelectedCategory('All');
      // Filter out games when traditional tab is selected
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTools = copingTools.filter(tool => {
    // First filter by tab selection
    if (activeTab === 'games' && tool.category !== 'Games') {
      return false;
    }
    if (activeTab === 'traditional' && tool.category === 'Games') {
      return false;
    }
    
    // Then filter by category and search term
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openToolDetails = (tool) => {
    setSelectedTool(tool);
  };

  const closeToolDetails = () => {
    setSelectedTool(null);
  };

  // New functions for exercise functionality
  const startExercise = () => {
    setIsExerciseActive(true);
    setCurrentStep(0);
    setProgress(0);
    
    // For timed exercises, set up the timer
    if (selectedTool.duration.includes('min')) {
      const durationInMinutes = parseInt(selectedTool.duration);
      if (!isNaN(durationInMinutes)) {
        setTimer(durationInMinutes * 60);
        startTimer();
      }
    }
  };

  const startTimer = () => {
    setIsTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          setIsTimerActive(false);
          completeExercise();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
    clearInterval(timerRef.current);
  };

  const resumeTimer = () => {
    if (timer > 0) {
      startTimer();
    }
  };

  const nextStep = () => {
    if (currentStep < selectedTool.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      const newProgress = ((currentStep + 1) / selectedTool.steps.length) * 100;
      setProgress(newProgress);
    } else {
      completeExercise();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const newProgress = ((currentStep - 1) / selectedTool.steps.length) * 100;
      setProgress(newProgress);
    }
  };

  const completeExercise = () => {
    if (isRoutineActive) {
      // For routines, handle next tool navigation
      if (currentRoutineToolIndex < currentRoutineTools.length - 1) {
        nextRoutineTool();
      } else {
        // Routine is complete
        completeRoutine();
      }
    } else {
      // For single exercises, show completion modal
      setShowCompletionModal(true);
      pauseTimer();
      
      // Add to exercise history
      const today = new Date().toISOString().split('T')[0];
      setExerciseHistory(prev => [
        ...prev,
        {
          date: today,
          name: selectedTool.title,
          category: selectedTool.category,
          duration: selectedTool.duration
        }
      ]);
      
      // Save to localStorage
      const existingHistory = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
      localStorage.setItem('exerciseHistory', JSON.stringify([
        ...existingHistory,
        {
          date: today,
          name: selectedTool.title,
          category: selectedTool.category,
          duration: selectedTool.duration
        }
      ]));
    }
  };

  const exitExercise = () => {
    setIsExerciseActive(false);
    pauseTimer();
    setNotes('');
  };

  const saveFeedback = () => {
    // Save the feedback data (mood, effectiveness, notes)
    const feedbackData = {
      mood,
      effectiveness,
      notes,
      date: new Date().toISOString(),
      toolId: selectedTool.id
    };
    
    // Save to localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('exerciseFeedback') || '{}');
    existingFeedback[selectedTool.id] = [
      ...(existingFeedback[selectedTool.id] || []),
      feedbackData
    ];
    localStorage.setItem('exerciseFeedback', JSON.stringify(existingFeedback));
    
    // Reset feedback state
    setMood(null);
    setEffectiveness(null);
    setNotes('');
    
    // Close the appropriate modal
    if (showCompletionModal) {
      setShowCompletionModal(false);
      setIsExerciseActive(false);
    } else if (showRoutineCompletionModal) {
      setShowRoutineCompletionModal(false);
      setIsRoutineActive(false);
      setCurrentRoutine(null);
    }
  };

  // Format timer to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Load exercise history and saved routines from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('exerciseHistory');
    if (savedHistory) {
      setExerciseHistory(JSON.parse(savedHistory));
    }
    
    const routines = localStorage.getItem('savedRoutines');
    if (routines) {
      setSavedRoutines(JSON.parse(routines));
    }
  }, []);

  // Show routine creation modal
  const openRoutineModal = () => {
    setShowRoutineModal(true);
    setRoutineName('');
    setRoutineDescription('');
    setSelectedRoutineTools([]);
  };

  // Close routine creation modal
  const closeRoutineModal = () => {
    setShowRoutineModal(false);
  };

  // Handle adding/removing tools from routine
  const toggleToolInRoutine = (tool) => {
    if (selectedRoutineTools.some(t => t.id === tool.id)) {
      setSelectedRoutineTools(selectedRoutineTools.filter(t => t.id !== tool.id));
    } else {
      setSelectedRoutineTools([...selectedRoutineTools, tool]);
    }
  };

  // Save the created routine
  const saveRoutine = () => {
    if (!routineName.trim()) {
      alert('Please enter a name for your routine');
      return;
    }

    if (selectedRoutineTools.length === 0) {
      alert('Please select at least one tool for your routine');
      return;
    }

    const newRoutine = {
      id: Date.now(),
      name: routineName,
      description: routineDescription,
      tools: selectedRoutineTools,
      createdAt: new Date().toISOString(),
      totalDuration: calculateTotalDuration(selectedRoutineTools)
    };

    const updatedRoutines = [...savedRoutines, newRoutine];
    setSavedRoutines(updatedRoutines);
    localStorage.setItem('savedRoutines', JSON.stringify(updatedRoutines));
    
    closeRoutineModal();
    alert('Your routine has been saved!');
  };

  // Delete a saved routine
  const deleteRoutine = (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      const updatedRoutines = savedRoutines.filter(routine => routine.id !== routineId);
      setSavedRoutines(updatedRoutines);
      localStorage.setItem('savedRoutines', JSON.stringify(updatedRoutines));
    }
  };

  // Calculate total duration of routine
  const calculateTotalDuration = (tools) => {
    let totalMinutes = 0;
    
    tools.forEach(tool => {
      const durationString = tool.duration;
      if (durationString.includes('min')) {
        const minutes = parseInt(durationString.split(' ')[0]);
        if (!isNaN(minutes)) {
          totalMinutes += minutes;
        }
      }
    });
    
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}h ${mins > 0 ? mins + 'min' : ''}`;
    }
    
    return `${totalMinutes} min`;
  };

  // Start a routine session
  const startRoutine = (routine) => {
    setCurrentRoutine(routine);
    setCurrentRoutineTools(routine.tools);
    setCurrentRoutineToolIndex(0);
    setIsRoutineActive(true);
    setSelectedTool(routine.tools[0]);
    setCurrentStep(0);
    setProgress(0);
  };

  // Move to the next tool in the routine
  const nextRoutineTool = () => {
    // Save current exercise as completed
    completeExercise();
    
    if (currentRoutineToolIndex < currentRoutineTools.length - 1) {
      const nextIndex = currentRoutineToolIndex + 1;
      setCurrentRoutineToolIndex(nextIndex);
      setSelectedTool(currentRoutineTools[nextIndex]);
      setCurrentStep(0);
      setProgress(0);
    } else {
      // Routine is complete
      completeRoutine();
    }
  };

  // Move to the previous tool in the routine
  const prevRoutineTool = () => {
    if (currentRoutineToolIndex > 0) {
      const prevIndex = currentRoutineToolIndex - 1;
      setCurrentRoutineToolIndex(prevIndex);
      setSelectedTool(currentRoutineTools[prevIndex]);
      setCurrentStep(0);
      setProgress(0);
    }
  };

  // Complete the entire routine
  const completeRoutine = () => {
    setShowRoutineCompletionModal(true);
    pauseTimer();
    
    // Add the entire routine to history
    const today = new Date().toISOString().split('T')[0];
    const historyEntry = {
      date: today,
      type: 'routine',
      name: currentRoutine.name,
      toolCount: currentRoutine.tools.length,
      duration: currentRoutine.totalDuration
    };
    
    // Save to localStorage
    const existingHistory = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
    localStorage.setItem('exerciseHistory', JSON.stringify([
      ...existingHistory,
      historyEntry
    ]));
    
    setExerciseHistory(prev => [...prev, historyEntry]);
  };

  // Exit the routine player
  const exitRoutine = () => {
    setIsRoutineActive(false);
    setCurrentRoutine(null);
    setSelectedTool(null);
    setIsExerciseActive(false);
    pauseTimer();
  };

  return (
      <div className="coping-tools-container">
      <div className="coping-tools-header">
        <h1><TranslatedText text="Coping Tools" as="span" /></h1>
        <p><TranslatedText text="Discover evidence-based techniques to help manage stress, anxiety, and improve your well-being." /></p>
      </div>

      <div className="tools-controls">
        <div className="categories-filter">
          <span className="filter-label"><TranslatedText text="Filter by:" /></span>
          <button 
            className={selectedCategory === 'All' ? 'active-category' : ''} 
            onClick={() => handleCategoryChange('All')}
          >
            <TranslatedText text="All" />
          </button>
          <button 
            className={selectedCategory === 'Stress Relief' ? 'active-category' : ''} 
            onClick={() => handleCategoryChange('Stress Relief')}
          >
            <TranslatedText text="Stress Relief" />
          </button>
          <button 
            className={selectedCategory === 'Mindfulness' ? 'active-category' : ''} 
            onClick={() => handleCategoryChange('Mindfulness')}
          >
            <TranslatedText text="Mindfulness" />
          </button>
          <button 
            className={selectedCategory === 'Anxiety Management' ? 'active-category' : ''} 
            onClick={() => handleCategoryChange('Anxiety Management')}
          >
            <TranslatedText text="Anxiety Management" />
          </button>
          <button 
            className={selectedCategory === 'Positive Psychology' ? 'active-category' : ''} 
            onClick={() => handleCategoryChange('Positive Psychology')}
          >
            <TranslatedText text="Positive Psychology" />
          </button>
          <button 
            className={selectedCategory === 'Games' ? 'active-category' : ''} 
            onClick={() => handleCategoryChange('Games')}
          >
            <TranslatedText text="Games" />
          </button>
        </div>

        <div className="tools-tabs">
          <button 
            className={activeTab === 'tools' ? 'active-tab' : ''} 
            onClick={() => handleTabChange('tools')}
          >
            <i className="fas fa-tools"></i>
            <TranslatedText text="Coping Tools" />
          </button>
          <button 
            className={activeTab === 'routines' ? 'active-tab' : ''} 
            onClick={() => handleTabChange('routines')}
          >
            <i className="fas fa-calendar-alt"></i>
            <TranslatedText text="My Routines" />
          </button>
        </div>

        {activeTab === 'tools' && (
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search tools..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        )}
        </div>

      {activeTab === 'tools' ? (
        <div className="tools-grid">
          {filteredTools.length > 0 ? (
            filteredTools.map(tool => (
              <div key={tool.id} className="tool-card" onClick={() => openToolDetails(tool)}>
                <div className="tool-image">
                  <img src={tool.image} alt={tool.title} />
                  <span className="tool-duration">{tool.duration}</span>
                </div>
                <div className="tool-info">
                  <h3><TranslatedText text={tool.title} /></h3>
                  <div className="tool-meta">
                    <span className="tool-category"><TranslatedText text={tool.category} /></span>
                    <span className="tool-difficulty"><TranslatedText text={tool.difficulty} /></span>
                  </div>
                  <p><TranslatedText text={tool.description} /></p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tools-message">
              <i className="fas fa-search"></i>
              <p><TranslatedText text="No tools found matching your search." /></p>
            </div>
          )}
        </div>
      ) : (
        <div className="routines-section">
          <div className="routines-header">
            <h2><TranslatedText text="My Wellness Routines" as="span" /></h2>
            <button className="create-routine-btn" onClick={openRoutineModal}>
              <i className="fas fa-plus"></i>
              <TranslatedText text="Create New Routine" />
              </button>
          </div>

          {savedRoutines.length > 0 ? (
            <div className="routines-grid">
              {savedRoutines.map(routine => (
                <div key={routine.id} className="routine-card">
                  <div className="routine-header">
                    <h3><TranslatedText text={routine.name} /></h3>
                    <div className="routine-actions">
                      <button 
                        className="start-routine-btn" 
                        onClick={() => startRoutine(routine)}
                      >
                        <i className="fas fa-play"></i>
                        <TranslatedText text="Start" />
                      </button>
                      <button 
                        className="delete-routine-btn" 
                        onClick={() => deleteRoutine(routine.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="routine-meta">
                    <span className="routine-tools-count">
                      <i className="fas fa-clipboard-list"></i>
                      <TranslatedText text={`${routine.tools.length} tools`} />
                    </span>
                    <span className="routine-duration">
                      <i className="fas fa-clock"></i>
                      <TranslatedText text={calculateTotalDuration(routine.tools)} />
                    </span>
                  </div>
                  <div className="routine-tools-preview">
                    {routine.tools.slice(0, 3).map((tool, index) => (
                      <div key={index} className="routine-tool-item">
                        <span className="tool-number">{index + 1}</span>
                        <span className="tool-name"><TranslatedText text={tool.title} /></span>
                        <span className="tool-time">{tool.duration}</span>
                      </div>
                    ))}
                    {routine.tools.length > 3 && (
                      <div className="more-tools">
                        <TranslatedText text={`+${routine.tools.length - 3} more`} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-routines-message">
              <i className="fas fa-calendar-plus"></i>
              <p><TranslatedText text="You haven't created any routines yet. Create a routine by combining multiple coping tools to practice regularly." /></p>
            </div>
          )}
        </div>
      )}

      {/* Tool Details Modal */}
      {selectedTool && (
        <div className="tool-details-modal">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={closeToolDetails}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="tool-details-header">
              <h2><TranslatedText text={selectedTool.title} /></h2>
              <div className="tool-details-meta">
                <span className="tool-category"><TranslatedText text={selectedTool.category} /></span>
                <span className="tool-duration">{selectedTool.duration}</span>
                <span className="tool-difficulty"><TranslatedText text={selectedTool.difficulty} /></span>
              </div>
            </div>
            
            <div className="tool-details-image">
              <img src={selectedTool.image} alt={selectedTool.title} />
            </div>
            
            <div className="tool-details-description">
              <p><TranslatedText text={selectedTool.description} /></p>
                </div>
                
                <div className="tool-steps">
              <h3><TranslatedText text="How to Practice" as="span" /></h3>
                  <ol>
                    {selectedTool.steps.map((step, index) => (
                  <li key={index}><TranslatedText text={step} /></li>
                    ))}
                  </ol>
                </div>
                
                <div className="tool-actions">
              <button className="start-tool-btn" onClick={startExercise}>
                <i className="fas fa-play"></i>
                <TranslatedText text="Start Now" />
              </button>
              <button className="add-to-routine-btn" onClick={openRoutineModal}>
                <i className="fas fa-plus"></i>
                <TranslatedText text="Add to Routine" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Practice Modal */}
      {isExerciseActive && (
        <div className="exercise-modal">
          <div className="modal-content">
            <div className="exercise-header">
              <h2><TranslatedText text={selectedTool.title} /></h2>
              {isTimerActive ? (
                <button className="pause-timer-btn" onClick={pauseTimer}>
                  <i className="fas fa-pause"></i>
                </button>
              ) : (
                <button className="resume-timer-btn" onClick={resumeTimer}>
                  <i className="fas fa-play"></i>
                </button>
              )}
            </div>
            
            <div className="exercise-timer">
              <div className="timer-circle">
                <div className="timer-display">{formatTime(timer)}</div>
              </div>
            </div>
            
            <div className="exercise-step">
              <h3><TranslatedText text={`Step ${currentStep + 1} of ${selectedTool.steps.length}`} /></h3>
              <p className="current-instruction"><TranslatedText text={selectedTool.steps[currentStep]} /></p>
              
              <div className="step-navigation">
                <button 
                  className="prev-step-btn" 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                  <TranslatedText text="Previous" />
                </button>
                
                {currentStep < selectedTool.steps.length - 1 ? (
                  <button className="next-step-btn" onClick={nextStep}>
                    <TranslatedText text="Next" />
                    <i className="fas fa-chevron-right"></i>
                  </button>
                ) : (
                  <button className="complete-btn" onClick={completeExercise}>
                    <TranslatedText text="Complete" />
                    <i className="fas fa-check"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <button className="exit-exercise-btn" onClick={exitExercise}>
            <i className="fas fa-times"></i>
            <TranslatedText text="Exit" />
          </button>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="completion-modal">
          <div className="modal-content">
            <div className="completion-header">
              <h2><TranslatedText text="Exercise Complete!" as="span" /></h2>
              <div className="completion-icon">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            
            <div className="completion-message">
              <p><TranslatedText text="Great job completing this exercise! How do you feel now?" /></p>
            </div>
            
            <div className="feedback-section">
              <div className="mood-feedback">
                <h3><TranslatedText text="How are you feeling?" as="span" /></h3>
                <div className="mood-options">
                  <button 
                    className={`mood-btn ${mood === 'better' ? 'selected' : ''}`}
                    onClick={() => setMood('better')}
                  >
                    <i className="fas fa-smile"></i>
                    <TranslatedText text="Better" />
                  </button>
                  <button 
                    className={`mood-btn ${mood === 'same' ? 'selected' : ''}`}
                    onClick={() => setMood('same')}
                  >
                    <i className="fas fa-meh"></i>
                    <TranslatedText text="The Same" />
                  </button>
                  <button 
                    className={`mood-btn ${mood === 'worse' ? 'selected' : ''}`}
                    onClick={() => setMood('worse')}
                  >
                    <i className="fas fa-frown"></i>
                    <TranslatedText text="Worse" />
                  </button>
                </div>
              </div>
              
              <div className="effectiveness-feedback">
                <h3><TranslatedText text="Was this helpful?" as="span" /></h3>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button 
                      key={value}
                      className={`rating-btn ${effectiveness === value ? 'selected' : ''}`}
                      onClick={() => setEffectiveness(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="notes-feedback">
                <label htmlFor="feedback-notes">
                  <TranslatedText text="Any notes for next time? (optional)" />
                </label>
                <textarea 
                  id="feedback-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What worked well? What could be improved?"
                ></textarea>
              </div>
            </div>
            
            <div className="feedback-actions">
              <button className="save-feedback-btn" onClick={saveFeedback}>
                <TranslatedText text="Save & Continue" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Routine Modal */}
      {showRoutineModal && (
        <div className="routine-modal">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={closeRoutineModal}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="routine-modal-header">
              <h2><TranslatedText text="Create Wellness Routine" as="span" /></h2>
            </div>
            
            <div className="routine-form">
              <div className="routine-name-input">
                <label htmlFor="routine-name">
                  <TranslatedText text="Routine Name:" />
                </label>
                <input 
                  type="text" 
                  id="routine-name" 
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="My Morning Routine"
                />
              </div>
              
              <div className="routine-tools-selection">
                <h3><TranslatedText text="Select Tools for Your Routine:" as="span" /></h3>
                <div className="tools-selection-list">
                  {copingTools.map(tool => (
                    <div 
                      key={tool.id} 
                      className={`tool-selection-item ${selectedRoutineTools.some(t => t.id === tool.id) ? 'selected' : ''}`}
                      onClick={() => toggleToolInRoutine(tool)}
                    >
                      <div className="tool-selection-info">
                        <h4><TranslatedText text={tool.title} /></h4>
                        <div className="tool-meta">
                          <span className="tool-duration">{tool.duration}</span>
                          <span className="tool-category"><TranslatedText text={tool.category} /></span>
                        </div>
                      </div>
                      <div className="tool-selection-checkbox">
                        {selectedRoutineTools.some(t => t.id === tool.id) && (
                          <i className="fas fa-check"></i>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="routine-summary">
                <h3><TranslatedText text="Routine Summary:" as="span" /></h3>
                <div className="routine-selected-tools">
                  {selectedRoutineTools.length > 0 ? (
                    <>
                      <div className="selected-tools-list">
                        {selectedRoutineTools.map((tool, index) => (
                          <div key={index} className="selected-tool-item">
                            <span className="tool-number">{index + 1}</span>
                            <span className="tool-name"><TranslatedText text={tool.title} /></span>
                            <span className="tool-duration">{tool.duration}</span>
                            <button 
                              className="remove-tool-btn"
                              onClick={() => toggleToolInRoutine(tool)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="routine-total-duration">
                        <TranslatedText text="Total Duration:" /> 
                        <span>{calculateTotalDuration(selectedRoutineTools)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="no-tools-selected">
                      <p><TranslatedText text="No tools selected yet. Choose at least one tool from the list above." /></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="routine-actions">
              <button 
                className="save-routine-btn" 
                onClick={saveRoutine}
                disabled={routineName.trim() === '' || selectedRoutineTools.length === 0}
              >
                <i className="fas fa-save"></i>
                <TranslatedText text="Save Routine" />
              </button>
              </div>
            </div>
          </div>
        )}

      {/* Routine Exercise Modal */}
      {isRoutineActive && (
        <div className="routine-exercise-modal">
          <div className="modal-content">
            <div className="routine-exercise-header">
              <h2><TranslatedText text={`${currentRoutine.name}: ${currentRoutineTools[currentRoutineToolIndex].title}`} /></h2>
              {isTimerActive ? (
                <button className="pause-timer-btn" onClick={pauseTimer}>
                  <i className="fas fa-pause"></i>
                </button>
              ) : (
                <button className="resume-timer-btn" onClick={resumeTimer}>
                  <i className="fas fa-play"></i>
                </button>
              )}
            </div>
            
            <div className="routine-progress">
              <div className="progress-indicator">
                <TranslatedText text={`Tool ${currentRoutineToolIndex + 1} of ${currentRoutineTools.length}`} />
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{width: `${((currentRoutineToolIndex) / currentRoutineTools.length) * 100}%`}}
                ></div>
              </div>
            </div>
            
            <div className="exercise-timer">
              <div className="timer-circle">
                <div className="timer-display">{formatTime(timer)}</div>
              </div>
            </div>
            
            <div className="exercise-step">
              <h3><TranslatedText text={`Step ${currentStep + 1} of ${currentRoutineTools[currentRoutineToolIndex].steps.length}`} /></h3>
              <p className="current-instruction">
                <TranslatedText text={currentRoutineTools[currentRoutineToolIndex].steps[currentStep]} />
              </p>
              
              <div className="step-navigation">
                <button 
                  className="prev-step-btn" 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                  <TranslatedText text="Previous" />
                </button>
                
                {currentStep < currentRoutineTools[currentRoutineToolIndex].steps.length - 1 ? (
                  <button className="next-step-btn" onClick={nextStep}>
                    <TranslatedText text="Next" />
                    <i className="fas fa-chevron-right"></i>
                  </button>
                ) : (
                  <>
                    {currentRoutineToolIndex < currentRoutineTools.length - 1 ? (
                      <button className="next-tool-btn" onClick={nextRoutineTool}>
                        <TranslatedText text="Next Tool" />
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    ) : (
                      <button className="complete-btn" onClick={completeRoutine}>
                        <TranslatedText text="Complete Routine" />
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button className="exit-routine-btn" onClick={exitRoutine}>
            <i className="fas fa-times"></i>
            <TranslatedText text="Exit Routine" />
          </button>
        </div>
      )}

      {/* Routine Completion Modal */}
      {showRoutineCompletionModal && (
        <div className="completion-modal">
          <div className="modal-content">
            <div className="completion-header">
              <h2><TranslatedText text="Routine Complete!" as="span" /></h2>
              <div className="completion-icon">
                <i className="fas fa-trophy"></i>
              </div>
            </div>
            
            <div className="completion-message">
              <p>
                <TranslatedText text={`Great job completing your "${currentRoutine.name}" routine!`} />
              </p>
              <p>
                <TranslatedText text="You've completed all the tools in this routine. How do you feel now?" />
              </p>
            </div>
            
            <div className="feedback-section">
              <div className="mood-feedback">
                <h3><TranslatedText text="How are you feeling?" as="span" /></h3>
                <div className="mood-options">
                  <button 
                    className={`mood-btn ${mood === 'better' ? 'selected' : ''}`}
                    onClick={() => setMood('better')}
                  >
                    <i className="fas fa-smile"></i>
                    <TranslatedText text="Better" />
                  </button>
                  <button 
                    className={`mood-btn ${mood === 'same' ? 'selected' : ''}`}
                    onClick={() => setMood('same')}
                  >
                    <i className="fas fa-meh"></i>
                    <TranslatedText text="The Same" />
                  </button>
                  <button 
                    className={`mood-btn ${mood === 'worse' ? 'selected' : ''}`}
                    onClick={() => setMood('worse')}
                  >
                    <i className="fas fa-frown"></i>
                    <TranslatedText text="Worse" />
                  </button>
                </div>
              </div>
              
              <div className="effectiveness-feedback">
                <h3><TranslatedText text="Was this routine helpful?" as="span" /></h3>
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button 
                      key={value}
                      className={`rating-btn ${effectiveness === value ? 'selected' : ''}`}
                      onClick={() => setEffectiveness(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="notes-feedback">
                <label htmlFor="routine-feedback-notes">
                  <TranslatedText text="Any notes for next time? (optional)" />
                </label>
                <textarea 
                  id="routine-feedback-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What worked well? What could be improved?"
                ></textarea>
              </div>
            </div>
            
            <div className="feedback-actions">
              <button className="save-feedback-btn" onClick={saveFeedback}>
                <TranslatedText text="Save & Continue" />
              </button>
            </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default CopingTools; 