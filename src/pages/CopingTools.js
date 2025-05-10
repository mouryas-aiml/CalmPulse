import React, { useState } from 'react';
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
  }
];

function CopingTools() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);

  const categories = ['All', 'Stress Relief', 'Mindfulness', 'Relaxation', 'Positive Psychology', 'Anxiety Management'];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTools = copingTools.filter(tool => {
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

  return (
    <div className="coping-tools">
      <div className="coping-tools-container">
        <h1>Coping Tools & Wellness Routines</h1>
        <p className="coping-tools-description">
          Explore evidence-based techniques and exercises to manage stress, anxiety, 
          and improve your overall mental well-being.
        </p>

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
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="tools-grid">
          {filteredTools.length > 0 ? (
            filteredTools.map(tool => (
              <div className="tool-card" key={tool.id} onClick={() => openToolDetails(tool)}>
                <div className="tool-image">
                  <img src={tool.image} alt={tool.title} />
                  <div className="tool-category">{tool.category}</div>
                </div>
                <div className="tool-info">
                  <h3>{tool.title}</h3>
                  <p className="tool-description">{tool.description}</p>
                  <div className="tool-meta">
                    <span><i className="fas fa-clock"></i> {tool.duration}</span>
                    <span><i className="fas fa-star"></i> {tool.difficulty}</span>
                  </div>
                  <button className="start-btn">Start Exercise</button>
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

        {selectedTool && (
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
                    <h2>{selectedTool.title}</h2>
                    <p>{selectedTool.description}</p>
                    <div className="tool-meta">
                      <span><i className="fas fa-clock"></i> {selectedTool.duration}</span>
                      <span><i className="fas fa-star"></i> {selectedTool.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                <div className="tool-steps">
                  <h3>How to Practice</h3>
                  <ol>
                    {selectedTool.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div className="tool-actions">
                  <button className="begin-practice-btn">
                    <i className="fas fa-play-circle"></i> Begin Practice
                  </button>
                  <button className="save-favorites-btn">
                    <i className="fas fa-heart"></i> Add to Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="personal-routine">
          <h2>Create Your Personal Wellness Routine</h2>
          <p>Combine different tools into a daily or weekly routine tailored to your needs.</p>
          <button className="create-routine-btn">
            <i className="fas fa-plus-circle"></i> Create Routine
          </button>
        </div>
      </div>
    </div>
  );
}

export default CopingTools; 