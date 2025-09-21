import React from 'react';
import TranslatedText from './TranslatedText';
import './SearchResults.css';

const SearchResults = ({ results, isLoading, error, query, onClose }) => {
  if (isLoading) {
    return (
      <div className="search-results-container">
        <div className="search-results-header">
          <h3><TranslatedText text="Searching..." /></h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="search-loading">
          <div className="spinner"></div>
          <p><TranslatedText text="Looking for relevant information..." /></p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h3>
          <TranslatedText text="Health Resources for:" /> 
          <span className="search-query">"{query}"</span>
        </h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {error && (
        <div className="search-error">
          <p className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </p>
        </div>
      )}

      {results?.textResults?.length > 0 && (
        <div className="text-results-section">
          <h4><TranslatedText text="Information Resources" /></h4>
          <div className="text-results">
            {results.textResults.map((result, index) => (
              <div key={`text-${index}`} className={`result-item ${result.isFallbackNotice ? 'fallback-notice' : ''}`}>
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="result-title"
                >
                  {result.title}
                </a>
                <p className="result-snippet">{result.snippet}</p>
                <span className="result-url">{result.link}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {results?.videoResults?.length > 0 && (
        <div className="video-results-section">
          <h4><TranslatedText text="Video Resources" /></h4>
          <div className="video-results">
            {results.videoResults.map((video, index) => (
              <div key={`video-${index}`} className="video-result-item">
                <a 
                  href={video.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="video-result"
                >
                  {video.thumbnail && (
                    <div className="video-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="play-icon">
                        <i className="fas fa-play-circle"></i>
                      </div>
                    </div>
                  )}
                  <div className="video-info">
                    <h5 className="video-title">{video.title}</h5>
                    {video.source && <span className="video-source">{video.source}</span>}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!results?.textResults?.length && !results?.videoResults?.length) && (
        <div className="no-results">
          <p><TranslatedText text="No results found for your search query. Try different keywords." /></p>
          <div className="fallback-search">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="fallback-link"
            >
              <i className="fas fa-external-link-alt"></i>
              <TranslatedText text="Search on Google" />
            </a>
          </div>
        </div>
      )}

      <div className="search-footer">
        <p className="disclaimer">
          <small>
            <TranslatedText text="These results are provided for information purposes only and should not be considered medical advice." />
          </small>
        </p>
      </div>
    </div>
  );
};

export default SearchResults; 