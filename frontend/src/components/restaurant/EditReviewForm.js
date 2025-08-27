import React, { useState } from 'react';
import './EditReviewForm.css';

function EditReviewForm({ review, onSubmit, onCancel }) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
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
      const response = await fetch(`http://localhost:3001/reviews/${review.reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onSubmit(data.review);
      } else {
        alert('Error updating review: ' + data.error);
      }
    } catch (error) {
      alert('Error updating review. Please try again.');
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
    <div className="edit-review-form-overlay">
      <div className="edit-review-form-modal">
        <div className="edit-review-form-header">
          <h3>Edit Your Review</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-review-form">
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
              {isSubmitting ? 'Updating...' : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReviewForm;
