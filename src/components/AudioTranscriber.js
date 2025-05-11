import React, { useState } from 'react';
import axios from 'axios';
import './AudioTranscriber.css';

const AudioTranscriber = ({ onTranscriptionComplete, apiKey }) => {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setTranscript('');
    setError(null);
    setMetadata(null);
  };

  const startTranscription = async () => {
    if (!file) {
      setError('Please select an audio file first');
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('language_behaviour', 'automatic single language');
    formData.append('toggle_diarization', true);
    
    // Add optional parameters
    formData.append('toggle_direct_translate', false);
    formData.append('translation_target_languages', '');
    formData.append('detect_language', true);
    formData.append('toggle_noise_reduction', true);

    try {
      const response = await axios.post(
        'https://api.gladia.io/audio/text/audio-transcription/',
        formData,
        {
          headers: {
            'x-gladia-key': apiKey || 'f377096a-0765-4e02-bb60-238c38c8b4db',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('Gladia API response:', response.data);
      
      if (response.data.prediction) {
        setTranscript(response.data.prediction);
        
        // Extract metadata
        const meta = {
          language: response.data.language || 'Unknown',
          durationSeconds: response.data.audio_duration || 0,
          confidence: response.data.confidence || 0
        };
        
        setMetadata(meta);
        
        // Notify parent component if callback provided
        if (onTranscriptionComplete) {
          onTranscriptionComplete(response.data.prediction, meta);
        }
      } else {
        setError('No transcription returned from the API');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      let errorMessage = 'Failed to transcribe audio';
      
      if (error.response) {
        errorMessage += `: API error ${error.response.status}`;
        console.error('API error details:', error.response.data);
      } else if (error.request) {
        errorMessage += ': No response received from server';
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audio-transcriber">
      <h3>Upload an Audio File for Transcription</h3>
      
      <div className="upload-container">
        <input 
          type="file" 
          id="audio-file" 
          accept="audio/*" 
          onChange={handleFileUpload} 
          className="file-input"
          disabled={loading}
        />
        <label htmlFor="audio-file" className="file-label">
          <i className="fas fa-upload"></i>
          {file ? file.name : 'Choose audio file'}
        </label>
        
        <button 
          onClick={startTranscription} 
          disabled={!file || loading}
          className="transcribe-button"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Transcribing...
            </>
          ) : (
            <>
              <i className="fas fa-language"></i> Transcribe
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      {transcript && (
        <div className="transcript-result">
          <h4>Transcript:</h4>
          <div className="transcript-metadata">
            {metadata && (
              <>
                <span><i className="fas fa-globe"></i> Language: {metadata.language}</span>
                <span><i className="fas fa-clock"></i> Duration: {Math.round(metadata.durationSeconds)}s</span>
                {metadata.confidence > 0 && (
                  <span><i className="fas fa-check-circle"></i> Confidence: {(metadata.confidence * 100).toFixed(1)}%</span>
                )}
              </>
            )}
          </div>
          <p className="transcript-text">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default AudioTranscriber; 