import React, { useState, useEffect, useRef } from 'react';
import './CopingTools.css';

const copingTools = [
  {
    id: 1,
    title: "Breathing Exercises",
    category: "Stress Relief",
    duration: "5 min",
    difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1490131784822-b4626a8ec96a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1493957988430-a5f2e15f39a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1597685204565-1a07e8f0a8e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1495121864268-11244629c6b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
    image: "https://images.unsplash.com/photo-1617503752587-97d2103a96ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
  const [activeTab, setActiveTab] = useState('all');
  
  // New state variables for routine creation
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [selectedRoutineTools, setSelectedRoutineTools] = useState([]);
  const [savedRoutines, setSavedRoutines] = useState([]);
  
  // New state variables for routine player
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [currentRoutineToolIndex, setCurrentRoutineToolIndex] = useState(0);
  const [routineProgress, setRoutineProgress] = useState(0);
  const [isRoutineActive, setIsRoutineActive] = useState(false);
  const [routineComplete, setRoutineComplete] = useState(false);
  
  // New state variables for exercise functionality
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [feedback, setFeedback] = useState('');

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
    setExerciseComplete(false);
    
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
    setExerciseComplete(true);
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
  };

  const exitExercise = () => {
    setIsExerciseActive(false);
    pauseTimer();
    setFeedback('');
  };

  const saveFeedback = () => {
    if (feedback.trim() !== '') {
      // Save feedback to localStorage
      const existingFeedback = JSON.parse(localStorage.getItem('exerciseFeedback') || '{}');
      existingFeedback[selectedTool.id] = [
        ...(existingFeedback[selectedTool.id] || []),
        {
          date: new Date().toISOString(),
          text: feedback
        }
      ];
      localStorage.setItem('exerciseFeedback', JSON.stringify(existingFeedback));
      
      // Reset feedback field
      setFeedback('');
      // Show confirmation message
      alert('Your feedback has been saved. This will help personalize your experience in the future.');
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
    setActiveRoutine(routine);
    setCurrentRoutineToolIndex(0);
    setRoutineProgress(0);
    setIsRoutineActive(true);
    setRoutineComplete(false);
    setSelectedTool(routine.tools[0]);
    setCurrentStep(0);
    setProgress(0);
  };

  // Move to the next tool in the routine
  const nextRoutineTool = () => {
    // Save current exercise as completed
    completeExercise();
    
    if (currentRoutineToolIndex < activeRoutine.tools.length - 1) {
      const nextIndex = currentRoutineToolIndex + 1;
      setCurrentRoutineToolIndex(nextIndex);
      setSelectedTool(activeRoutine.tools[nextIndex]);
      setCurrentStep(0);
      setProgress(0);
      setExerciseComplete(false);
      setRoutineProgress((nextIndex / activeRoutine.tools.length) * 100);
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
      setSelectedTool(activeRoutine.tools[prevIndex]);
      setCurrentStep(0);
      setProgress(0);
      setExerciseComplete(false);
      setRoutineProgress((prevIndex / activeRoutine.tools.length) * 100);
    }
  };

  // Complete the entire routine
  const completeRoutine = () => {
    setRoutineComplete(true);
    pauseTimer();
    
    // Add the entire routine to history
    const today = new Date().toISOString().split('T')[0];
    const historyEntry = {
      date: today,
      type: 'routine',
      name: activeRoutine.name,
      toolCount: activeRoutine.tools.length,
      duration: activeRoutine.totalDuration
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
    setActiveRoutine(null);
    setSelectedTool(null);
    setIsExerciseActive(false);
    pauseTimer();
  };

  return (
    <div className="coping-tools">
      <div className="coping-tools-container">
        <h1>Coping Tools & Wellness Routines</h1>
        <p className="coping-tools-description">
          Explore evidence-based techniques, exercises, and interactive games to manage stress, anxiety, 
          and improve your overall mental well-being.
        </p>

        <div className="tools-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            All Tools
          </button>
          <button 
            className={`tab-button ${activeTab === 'traditional' ? 'active' : ''}`}
            onClick={() => handleTabChange('traditional')}
          >
            Traditional Techniques
          </button>
          <button 
            className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => handleTabChange('games')}
          >
            Interactive Games
          </button>
        </div>

        <div className="tools-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for tools..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="categories">
            {categories
              .filter(category => 
                activeTab === 'all' || 
                (activeTab === 'games' && (category === 'All' || category === 'Games')) ||
                (activeTab === 'traditional' && category !== 'Games')
              )
              .map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))
            }
          </div>
        </div>

        <div className="tools-grid">
          {filteredTools.length > 0 ? (
            filteredTools.map(tool => (
              <div className="tool-card" key={tool.id} onClick={() => openToolDetails(tool)}>
                <div className="tool-image">
                  <img src={tool.image} alt={tool.title} />
                  <div className="tool-category">{tool.category}</div>
                  {tool.gameType && <div className="game-type">{tool.gameType}</div>}
                </div>
                <div className="tool-info">
                  <h3>{tool.title}</h3>
                  <p className="tool-description">{tool.description}</p>
                  <div className="tool-meta">
                    <span><i className="fas fa-clock"></i> {tool.duration}</span>
                    <span><i className="fas fa-star"></i> {tool.difficulty}</span>
                  </div>
                  <button className="start-btn">
                    {tool.category === 'Games' ? 'Play Now' : 'Start Exercise'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tools">
              <i className="fas fa-search fa-3x"></i>
              <p>No tools match your current search. Try a different search term or category.</p>
            </div>
          )}
        </div>

        {selectedTool && !isExerciseActive && (
          <div className="tool-modal-overlay" onClick={closeToolDetails}>
            <div className="tool-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={closeToolDetails}>
                <i className="fas fa-times"></i>
              </button>
              
              <div className="tool-modal-content">
                <div className="tool-modal-header">
                  <img src={selectedTool.image} alt={selectedTool.title} />
                  <div className="tool-header-info">
                    <div className="tool-category-badge">{selectedTool.category}</div>
                    {selectedTool.gameType && <div className="game-type-badge">{selectedTool.gameType}</div>}
                    <h2>{selectedTool.title}</h2>
                    <p>{selectedTool.description}</p>
                    <div className="tool-meta">
                      <span><i className="fas fa-clock"></i> {selectedTool.duration}</span>
                      <span><i className="fas fa-star"></i> {selectedTool.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                <div className="tool-steps">
                  <h3>{selectedTool.category === 'Games' ? 'How to Play' : 'How to Practice'}</h3>
                  <ol>
                    {selectedTool.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div className="tool-actions">
                  <button 
                    className="begin-practice-btn"
                    onClick={startExercise}
                  >
                    <i className={selectedTool.category === 'Games' ? "fas fa-gamepad" : "fas fa-play-circle"}></i> 
                    {selectedTool.category === 'Games' ? 'Start Game' : 'Begin Practice'}
                  </button>
                  <button className="save-favorites-btn">
                    <i className="fas fa-heart"></i> Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Exercise Player Modal */}
        {selectedTool && isExerciseActive && (
          <div className="exercise-overlay">
            <div className="exercise-modal">
              <div className="exercise-header">
                <h2>{selectedTool.title}</h2>
                <button className="exit-exercise" onClick={exitExercise}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {!exerciseComplete ? (
                <>
                  <div className="exercise-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="step-indicator">
                      Step {currentStep + 1} of {selectedTool.steps.length}
                    </div>
                  </div>

                  <div className="exercise-content">
                    {selectedTool.category === "Stress Relief" && selectedTool.title === "Breathing Exercises" ? (
                      <div className="breathing-exercise">
                        <div className="breathing-animation" style={{ 
                          animation: isTimerActive ? 'breathe 10s infinite' : 'none'
                        }}>
                          <div className="circle"></div>
                          <div className="instruction">
                            {currentStep === 0 && "Get comfortable"}
                            {currentStep === 1 && "Inhale..."}
                            {currentStep === 2 && "Hold..."}
                            {currentStep === 3 && "Exhale..."}
                            {currentStep === 4 && "Continue breathing"}
                          </div>
                        </div>
                      </div>
                    ) : selectedTool.category === "Stress Relief" && selectedTool.title === "Progressive Muscle Relaxation" ? (
                      <div className="pmr-exercise">
                        <div className="body-diagram">
                          <img 
                            src="https://images.unsplash.com/photo-1559038465-ec9253ec89aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                            alt="Body diagram" 
                          />
                          <div className={`highlight ${
                            currentStep === 0 ? "none" :
                            currentStep === 1 ? "breathing" :
                            currentStep === 2 ? "feet" :
                            currentStep === 3 ? "body" :
                            currentStep === 4 ? "full-body" : ""
                          }`}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="standard-exercise">
                        <p className="step-instruction">{selectedTool.steps[currentStep]}</p>
                      </div>
                    )}

                    {isTimerActive && (
                      <div className="exercise-timer">
                        <div className="timer-display">{formatTime(timer)}</div>
                        <button 
                          className="timer-control"
                          onClick={isTimerActive ? pauseTimer : resumeTimer}
                        >
                          <i className={`fas ${isTimerActive ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="exercise-navigation">
                    <button 
                      className="prev-step"
                      disabled={currentStep === 0}
                      onClick={prevStep}
                    >
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <button 
                      className="next-step"
                      onClick={nextStep}
                    >
                      {currentStep < selectedTool.steps.length - 1 ? 'Next' : 'Complete'} <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </>
              ) : (
                <div className="exercise-complete">
                  <div className="complete-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Practice Complete!</h3>
                  <p>Great job completing your {selectedTool.title} practice. How do you feel now?</p>
                  
                  <div className="mood-rating">
                    <button className="mood-btn"><i className="far fa-frown"></i></button>
                    <button className="mood-btn"><i className="far fa-meh"></i></button>
                    <button className="mood-btn"><i className="far fa-smile"></i></button>
                    <button className="mood-btn"><i className="far fa-grin-stars"></i></button>
                  </div>
                  
                  <div className="feedback-section">
                    <textarea
                      placeholder="Share any thoughts or reflections about your practice (optional)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                    <button className="save-feedback" onClick={saveFeedback}>
                      Save Reflection
                    </button>
                  </div>
                  
                  <div className="complete-actions">
                    <button className="restart-btn" onClick={startExercise}>
                      <i className="fas fa-redo"></i> Practice Again
                    </button>
                    <button className="finish-btn" onClick={exitExercise}>
                      <i className="fas fa-check"></i> Finish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personal Routine Section */}
        <div className="personal-routine">
          <h2>Create Your Personal Wellness Routine</h2>
          <p>Combine different tools and games into a daily or weekly routine tailored to your needs.</p>
          <button className="create-routine-btn" onClick={openRoutineModal}>
            <i className="fas fa-plus-circle"></i> Create Routine
          </button>
        </div>

        {/* Saved Routines Section */}
        {savedRoutines.length > 0 && (
          <div className="saved-routines">
            <h2>Your Saved Routines</h2>
            <div className="routines-grid">
              {savedRoutines.map(routine => (
                <div className="routine-card" key={routine.id}>
                  <div className="routine-header">
                    <h3>{routine.name}</h3>
                    <button 
                      className="delete-routine" 
                      onClick={() => deleteRoutine(routine.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p className="routine-description">{routine.description}</p>
                  <div className="routine-meta">
                    <span><i className="fas fa-clock"></i> {routine.totalDuration}</span>
                    <span><i className="fas fa-list"></i> {routine.tools.length} activities</span>
                  </div>
                  <div className="routine-tools">
                    {routine.tools.slice(0, 3).map(tool => (
                      <div className="routine-tool-item" key={tool.id}>
                        <div className="tool-icon"><i className="fas fa-check-circle"></i></div>
                        <span>{tool.title}</span>
                      </div>
                    ))}
                    {routine.tools.length > 3 && (
                      <div className="more-tools">+{routine.tools.length - 3} more</div>
                    )}
                  </div>
                  <button className="start-routine-btn" onClick={() => startRoutine(routine)}>
                    <i className="fas fa-play"></i> Start Routine
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Section */}
        {exerciseHistory.length > 0 && (
          <div className="recent-activity">
            <h2>Your Recent Activity</h2>
            <div className="activity-list">
              {exerciseHistory.slice(Math.max(exerciseHistory.length - 5, 0)).reverse().map((activity, index) => (
                <div className="activity-item" key={index}>
                  <div className="activity-icon">
                    <i className={`fas ${
                      activity.category === 'Stress Relief' ? 'fa-wind' :
                      activity.category === 'Mindfulness' ? 'fa-brain' :
                      activity.category === 'Relaxation' ? 'fa-couch' :
                      activity.category === 'Positive Psychology' ? 'fa-smile' :
                      activity.category === 'Anxiety Management' ? 'fa-shield-alt' :
                      'fa-gamepad'
                    }`}></i>
                  </div>
                  <div className="activity-details">
                    <h4>{activity.name}</h4>
                    <div className="activity-meta">
                      <span>{activity.date}</span>
                      <span>{activity.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Routine Player Modal */}
        {isRoutineActive && activeRoutine && (
          <div className="exercise-overlay">
            <div className="exercise-modal routine-player">
              <div className="exercise-header">
                <h2>
                  {activeRoutine.name} - {currentRoutineToolIndex + 1}/{activeRoutine.tools.length}: {selectedTool?.title}
                </h2>
                <button className="exit-exercise" onClick={exitRoutine}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="routine-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${routineProgress}%` }}
                  ></div>
                </div>
                <div className="step-indicator">
                  Tool {currentRoutineToolIndex + 1} of {activeRoutine.tools.length}
                </div>
              </div>

              {routineComplete ? (
                <div className="exercise-complete">
                  <div className="complete-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <h3>Routine Complete!</h3>
                  <p>Congratulations on completing your {activeRoutine.name} routine!</p>
                  
                  <div className="mood-rating">
                    <button className="mood-btn"><i className="far fa-frown"></i></button>
                    <button className="mood-btn"><i className="far fa-meh"></i></button>
                    <button className="mood-btn"><i className="far fa-smile"></i></button>
                    <button className="mood-btn"><i className="far fa-grin-stars"></i></button>
                  </div>
                  
                  <div className="feedback-section">
                    <textarea
                      placeholder="Share any thoughts or reflections about your routine (optional)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                    <button className="save-feedback" onClick={saveFeedback}>
                      Save Reflection
                    </button>
                  </div>
                  
                  <div className="complete-actions">
                    <button className="restart-btn" onClick={() => startRoutine(activeRoutine)}>
                      <i className="fas fa-redo"></i> Restart Routine
                    </button>
                    <button className="finish-btn" onClick={exitRoutine}>
                      <i className="fas fa-check"></i> Finish
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Tool information */}
                  <div className="routine-tool-info">
                    <div className="tool-card-preview">
                      <img src={selectedTool?.image} alt={selectedTool?.title} />
                      <div className="tool-description">{selectedTool?.description}</div>
                    </div>
                  </div>

                  {/* Exercise player components */}
                  {!exerciseComplete ? (
                    <>
                      <div className="exercise-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="step-indicator">
                          Step {currentStep + 1} of {selectedTool?.steps.length}
                        </div>
                      </div>

                      <div className="exercise-content">
                        {/* Existing exercise content components */}
                        <div className="standard-exercise">
                          <p className="step-instruction">{selectedTool?.steps[currentStep]}</p>
                        </div>

                        {isTimerActive && (
                          <div className="exercise-timer">
                            <div className="timer-display">{formatTime(timer)}</div>
                            <button 
                              className="timer-control"
                              onClick={isTimerActive ? pauseTimer : resumeTimer}
                            >
                              <i className={`fas ${isTimerActive ? 'fa-pause' : 'fa-play'}`}></i>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="exercise-navigation">
                        <button 
                          className="prev-step"
                          disabled={currentStep === 0}
                          onClick={prevStep}
                        >
                          <i className="fas fa-chevron-left"></i> Previous
                        </button>
                        <button 
                          className="next-step"
                          onClick={nextStep}
                        >
                          {currentStep < selectedTool?.steps.length - 1 ? 'Next' : 'Complete'} <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Tool complete screen */}
                      <div className="tool-complete">
                        <div className="complete-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <h3>{selectedTool?.title} Completed!</h3>
                        <p>Great job! Ready to move to the next activity?</p>
                        
                        <div className="routine-navigation">
                          <button 
                            className="prev-routine-btn"
                            disabled={currentRoutineToolIndex === 0}
                            onClick={prevRoutineTool}
                          >
                            <i className="fas fa-arrow-left"></i> Previous Tool
                          </button>
                          <button 
                            className="next-routine-btn"
                            onClick={nextRoutineTool}
                          >
                            {currentRoutineToolIndex < activeRoutine.tools.length - 1 ? 'Next Tool' : 'Complete Routine'} <i className="fas fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Routine Creation Modal */}
        {showRoutineModal && (
          <div className="modal-overlay" onClick={closeRoutineModal}>
            <div className="routine-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Your Wellness Routine</h2>
                <button className="close-modal" onClick={closeRoutineModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="routine-form">
                <div className="form-group">
                  <label>Routine Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Morning Calm, Anxiety Relief..."
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea 
                    placeholder="What's the purpose of this routine? When will you use it?"
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Select Activities</label>
                  <p className="selection-hint">Choose tools and exercises to include in your routine:</p>
                  
                  <div className="tools-selection">
                    {copingTools.map(tool => (
                      <div 
                        key={tool.id} 
                        className={`tool-selection-item ${selectedRoutineTools.some(t => t.id === tool.id) ? 'selected' : ''}`}
                        onClick={() => toggleToolInRoutine(tool)}
                      >
                        <div className="selection-checkbox">
                          {selectedRoutineTools.some(t => t.id === tool.id) && <i className="fas fa-check"></i>}
                        </div>
                        <div className="selection-details">
                          <h4>{tool.title}</h4>
                          <div className="selection-meta">
                            <span>{tool.category}</span>
                            <span>{tool.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedRoutineTools.length > 0 && (
                  <div className="selected-summary">
                    <p>
                      <strong>Total activities:</strong> {selectedRoutineTools.length} | 
                      <strong> Estimated time:</strong> {calculateTotalDuration(selectedRoutineTools)}
                    </p>
                  </div>
                )}
                
                <div className="form-actions">
                  <button className="cancel-btn" onClick={closeRoutineModal}>Cancel</button>
                  <button 
                    className="save-routine-btn" 
                    onClick={saveRoutine}
                    disabled={!routineName.trim() || selectedRoutineTools.length === 0}
                  >
                    <i className="fas fa-save"></i> Save Routine
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CopingTools; 