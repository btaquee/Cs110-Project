import React, { useState } from 'react';
import './ReviewForm.css';

function ReviewForm({ restaurantId, restaurantName, username, onSubmit, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3001/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: parseInt(restaurantId),
          restaurantName: restaurantName,
          username: username,
          rating: rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onSubmit(data.review);
        setRating(0);
        setComment('');
      } else {
        alert('Error submitting review: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating, hoverRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starClass = i <= (hoverRating || currentRating) ? 'filled' : 'empty';
      stars.push(
        <span
          key={i}
          className={`star ${starClass}`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form-modal">
        <div className="review-form-header">
          <h3>Review {restaurantName}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-section">
            <label>Your Rating:</label>
            <div className="stars-container">
              {renderStars(rating, hoveredRating)}
              <span className="rating-text">
                {rating > 0 ? `${rating} out of 5` : 'Click to rate'}
              </span>
            </div>
          </div>
          
          <div className="comment-section">
            <label htmlFor="comment">Your Review:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this restaurant..."
              rows="4"
              maxLength="500"
              required
            />
            <span className="character-count">
              {comment.length}/500 characters
            </span>
          </div>
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewForm;
