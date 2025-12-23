import React, { useState } from 'react';

const TweetForm = ({ onSubmit, onClose }) => {
  const [tweetText, setTweetText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tweetText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the parent function to add tweet
      await onSubmit(tweetText);
      setTweetText(''); // Clear input on success
    } catch (error) {
      console.error('Failed to post tweet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tweet-form">
      <div className="tweet-form-header">
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="tweet-input-area">
          <div className="avatar-placeholder">
            <div className="avatar-small"></div>
          </div>
          <div className="textarea-wrapper">
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="What's happening?!"
              rows="3"
              maxLength="280"
              autoFocus
            />
            <div className="char-count">
              {tweetText.length}/280
            </div>
          </div>
        </div>
        
        <div className="tweet-form-footer">
          <div className="form-actions">
            {/* You can add icons here later: media, poll, emoji, etc. */}
          </div>
          <button 
            type="submit" 
            className="tweet-submit-btn"
            disabled={!tweetText.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Tweet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TweetForm;