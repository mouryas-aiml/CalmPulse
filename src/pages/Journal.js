import React, { useState } from 'react';
import './Journal.css';

// Sample journal entries for demonstration
const sampleEntries = [
  {
    id: 1,
    date: "2023-11-10",
    title: "Finding Balance",
    content: "Today was challenging but I managed to practice mindfulness during my lunch break. I'm starting to notice how much it helps with my afternoon stress levels.",
    mood: "Reflective",
    tags: ["mindfulness", "work", "stress"]
  },
  {
    id: 2,
    date: "2023-11-08",
    title: "Difficult Conversation",
    content: "Had to have a tough conversation with a friend today. It was uncomfortable but ultimately helped clear the air. I'm proud of myself for being assertive while still being kind.",
    mood: "Accomplished",
    tags: ["relationships", "communication"]
  },
  {
    id: 3,
    date: "2023-11-05",
    title: "Morning Anxiety",
    content: "Woke up with racing thoughts about the upcoming presentation. Used the breathing technique from the app and it helped bring my anxiety down from an 8 to a 4.",
    mood: "Anxious",
    tags: ["anxiety", "work", "techniques"]
  }
];

function Journal() {
  const [entries, setEntries] = useState(sampleEntries);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: ''
  });
  const [isWriting, setIsWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Toggle the new entry form
  const toggleWritingMode = () => {
    setIsWriting(!isWriting);
    if (selectedEntry) setSelectedEntry(null);
  };

  // Handle input changes for new entry
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: value
    });
  };

  // Save new journal entry
  const saveEntry = (e) => {
    e.preventDefault();
    const newId = entries.length > 0 ? Math.max(...entries.map(entry => entry.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    const tagsArray = newEntry.tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    const entryToSave = {
      id: newId,
      date: today,
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      tags: tagsArray
    };
    
    setEntries([entryToSave, ...entries]);
    setNewEntry({
      title: '',
      content: '',
      mood: '',
      tags: ''
    });
    setIsWriting(false);
  };

  // View a specific entry
  const viewEntry = (entry) => {
    setSelectedEntry(entry);
    setIsWriting(false);
  };

  // Generate AI-assisted writing prompts
  const generatePrompts = () => {
    // Simulate AI response with predefined prompts
    const prompts = [
      "Reflect on a moment today when you felt most at peace. What contributed to that feeling?",
      "Write about something that challenged you today and how you responded to it.",
      "Describe a small win or accomplishment from today that you're proud of.",
      "What's something you're grateful for today, and why does it matter to you?",
      "If you could change one thing about how today went, what would it be and why?"
    ];
    
    setAiSuggestions(prompts);
  };

  return (
    <div className="journal">
      <div className="journal-container">
        <h1>Awareness Journal</h1>
        <p className="journal-description">
          Track your thoughts, emotions, and reflections to build self-awareness and identify patterns.
        </p>

        <div className="journal-controls">
          <button 
            className={`new-entry-btn ${isWriting ? 'active' : ''}`}
            onClick={toggleWritingMode}
          >
            {isWriting ? 'Cancel' : 'New Entry'} 
            <i className={`fas ${isWriting ? 'fa-times' : 'fa-plus'}`}></i>
          </button>
          
          <div className="ai-prompt-section">
            <input
              type="text"
              placeholder="Ask for writing suggestions..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button className="generate-btn" onClick={generatePrompts}>
              <i className="fas fa-magic"></i> Generate
            </button>
          </div>
        </div>

        {aiSuggestions.length > 0 && (
          <div className="ai-suggestions">
            <h3>Writing Prompts</h3>
            <ul>
              {aiSuggestions.map((prompt, index) => (
                <li key={index} onClick={() => {
                  setNewEntry({...newEntry, content: prompt});
                  setIsWriting(true);
                  setAiSuggestions([]);
                }}>
                  {prompt}
                </li>
              ))}
            </ul>
            <button className="close-suggestions" onClick={() => setAiSuggestions([])}>
              <i className="fas fa-times"></i> Close
            </button>
          </div>
        )}

        {isWriting && (
          <div className="writing-section">
            <form onSubmit={saveEntry}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEntry.title}
                  onChange={handleInputChange}
                  placeholder="Give your entry a title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Today's Reflection</label>
                <textarea
                  name="content"
                  value={newEntry.content}
                  onChange={handleInputChange}
                  placeholder="What's on your mind today?"
                  rows={8}
                  required
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Current Mood</label>
                  <input
                    type="text"
                    name="mood"
                    value={newEntry.mood}
                    onChange={handleInputChange}
                    placeholder="How are you feeling?"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={newEntry.tags}
                    onChange={handleInputChange}
                    placeholder="e.g. anxiety, work, family"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  <i className="fas fa-save"></i> Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {!isWriting && !selectedEntry && (
          <div className="entries-list">
            <h2>Your Journal Entries</h2>
            {entries.length > 0 ? (
              entries.map(entry => (
                <div className="entry-card" key={entry.id} onClick={() => viewEntry(entry)}>
                  <div className="entry-header">
                    <span className="entry-date">{entry.date}</span>
                    <span className="entry-mood">{entry.mood}</span>
                  </div>
                  <h3 className="entry-title">{entry.title}</h3>
                  <p className="entry-preview">
                    {entry.content.length > 150 
                      ? `${entry.content.substring(0, 150)}...` 
                      : entry.content}
                  </p>
                  <div className="entry-tags">
                    {entry.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-entries">
                <i className="fas fa-book-open fa-3x"></i>
                <p>You haven't created any journal entries yet. Start writing to track your mental health journey.</p>
              </div>
            )}
          </div>
        )}

        {selectedEntry && (
          <div className="entry-detail">
            <button className="back-btn" onClick={() => setSelectedEntry(null)}>
              <i className="fas fa-arrow-left"></i> Back to Journal
            </button>
            
            <div className="entry-detail-header">
              <h2>{selectedEntry.title}</h2>
              <div className="entry-meta">
                <span className="entry-date">
                  <i className="fas fa-calendar-alt"></i> {selectedEntry.date}
                </span>
                <span className="entry-mood">
                  <i className="fas fa-heartbeat"></i> {selectedEntry.mood}
                </span>
              </div>
            </div>
            
            <div className="entry-content">
              {selectedEntry.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            <div className="entry-tags">
              {selectedEntry.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            
            <div className="entry-actions">
              <button className="action-btn">
                <i className="fas fa-chart-line"></i> Analyze Mood
              </button>
              <button className="action-btn">
                <i className="fas fa-edit"></i> Edit
              </button>
              <button className="action-btn">
                <i className="fas fa-share-alt"></i> Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Journal; 