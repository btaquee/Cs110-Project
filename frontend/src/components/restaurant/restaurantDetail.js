import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './restaurantDetail.css';
import ReviewForm from './ReviewForm.js';
import EditReviewForm from './EditReviewForm.js';

function RestaurantDetail({ user }) {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  useEffect(() => {
  if (restaurant?.name) {
    fetch(`http://localhost:3001/coupons?restaurant=${encodeURIComponent(restaurant.name)}`)
      .then(res => res.json())
      .then(data => setCoupons(data.coupons || []))
      .catch(() => setCoupons([]));
  }
}, [restaurant?.name]);

  // Separate useEffect for recommendations to ensure they load after main data
  useEffect(() => {
    if (restaurant && restaurantId) {
      fetchRecommendations();
    }
  }, [restaurant, restaurantId, user]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant details
      const restaurantResponse = await fetch(`http://localhost:3001/restaurants`);
      const restaurants = await restaurantResponse.json();
      const currentRestaurant = restaurants.find(r => r.id === parseInt(restaurantId));
      setRestaurant(currentRestaurant);

      // Fetch reviews
      const reviewsResponse = await fetch(`http://localhost:3001/reviews/restaurant/${restaurantId}`);
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.reviews);
      setAverageRating(reviewsData.averageRating);
      setTotalReviews(reviewsData.totalReviews);

      // Fetch user's review if logged in
      if (user) {
        const userReviewResponse = await fetch(`http://localhost:3001/reviews/user/${user.username}/restaurant/${restaurantId}`);
        const userReviewData = await userReviewResponse.json();
        setUserReview(userReviewData.userReview);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      console.log('Fetching recommendations for restaurant:', restaurantId);
      
      const userCuisine = user?.favCuisine || "";
      console.log('User cuisine preference:', userCuisine);
      
      const response = await fetch(`http://localhost:3001/restaurants/recommendations/${restaurantId}?userCuisine=${encodeURIComponent(userCuisine)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Recommendations received:', data);
      
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddReview = () => {
    setShowReviewForm(true);
  };

  const handleReviewSubmit = (newReview) => {
    // Add the new review to the reviews list
    setReviews(prevReviews => [newReview, ...prevReviews]);
    
    // Update user review
    setUserReview(newReview);
    
    // Update average rating and total reviews
    const newTotalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating;
    const newAverageRating = ((newTotalRating) / (reviews.length + 1)).toFixed(1);
    setAverageRating(parseFloat(newAverageRating));
    setTotalReviews(prev => prev + 1);
    
    // Close the form
    setShowReviewForm(false);
  };

  const handleReviewCancel = () => {
    setShowReviewForm(false);
  };

  const handleEditReview = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = (updatedReview) => {
    // Update the review in the reviews list
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.reviewId === updatedReview.reviewId ? updatedReview : review
      )
    );
    
    // Update user review
    setUserReview(updatedReview);
    
    // Recalculate average rating
    const updatedReviews = reviews.map(review => 
      review.reviewId === updatedReview.reviewId ? updatedReview : review
    );
    const newTotalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
    const newAverageRating = (newTotalRating / updatedReviews.length).toFixed(1);
    setAverageRating(parseFloat(newAverageRating));
    
    // Close the form
    setShowEditForm(false);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/reviews/${userReview.reviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove the review from the reviews list
        setReviews(prevReviews => 
          prevReviews.filter(review => review.reviewId !== userReview.reviewId)
        );
        
        // Clear user review
        setUserReview(null);
        
        // Recalculate average rating
        const remainingReviews = reviews.filter(review => review.reviewId !== userReview.reviewId);
        const newTotalRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0);
        const newAverageRating = remainingReviews.length > 0 ? (newTotalRating / remainingReviews.length).toFixed(1) : 0;
        setAverageRating(parseFloat(newAverageRating));
        setTotalReviews(prev => prev - 1);
      } else {
        alert('Error deleting review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  const sortReviews = (reviewsToSort) => {
    switch (sortBy) {
      case 'newest':
        return [...reviewsToSort].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      case 'oldest':
        return [...reviewsToSort].sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
      case 'highest':
        return [...reviewsToSort].sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return [...reviewsToSort].sort((a, b) => a.rating - b.rating);
      default:
        return reviewsToSort;
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const handleRecommendationClick = (recommendedRestaurant) => {
    navigate(`/restaurant/\${recommendedRestaurant.id}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="error">Restaurant not found</div>;
  }

  return (
    <div className="restaurant-detail">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Restaurants
      </button>

      <div className="restaurant-header">
        <h1>{restaurant.name}</h1>
        <p className="cuisine">Cuisine: {restaurant.cuisine}</p>
        <p className="description">{restaurant.description}</p>
        
        <div className="rating-summary">
          {totalReviews > 0 ? (
            <>
              <div className="stars">
                {renderStars(averageRating)}
              </div>
              <span className="average-rating">{averageRating} out of 5</span>
              <span className="total-reviews">({totalReviews} reviews)</span>
            </>
          ) : (
            <div className="no-ratings">
              <span>No ratings yet</span>
              <span className="be-first">Be the first to review!</span>
            </div>
          )}
        </div>
      </div>

      <div className="restaurant-info">
        <div className="info-section">
          <h3>📍 Location</h3>
          <p>{restaurant.address}</p>
          <p>📞 {restaurant.phone}</p>
        </div>
        
        <div className="info-section">
          <h3>🕒 Hours</h3>
          <div className="hours-grid">
            {Object.entries(restaurant.hours).map(([day, hours]) => (
              <div key={day} className={`hour-row \${day === getCurrentDay() ? 'current-day' : ''}`}>
                <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                <span className="hours">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      {coupons.length > 0 && (
        <div className="info-section">
          <h3>Available Coupons</h3>
          <ul>
            {coupons.map(c => (
              <li key={c.code}>
                <strong>{c.code}</strong> – {c.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Reviews</h2>
          {reviews.length > 0 && (
            <div className="sort-controls">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          )}
        </div>
        
        {user && !userReview && (
          <div className="add-review-prompt">
            <p>You haven't reviewed this restaurant yet. Add your review!</p>
            <button className="add-review-btn" onClick={handleAddReview}>Add Review</button>
          </div>
        )}

        {user && userReview && (
          <div className="user-review">
            <div className="user-review-header">
              <h3>Your Review</h3>
              <div className="user-review-actions">
                <button className="edit-btn" onClick={handleEditReview}>Edit</button>
                <button className="delete-btn" onClick={handleDeleteReview}>Delete</button>
              </div>
            </div>
            <div className="review-card user-review-card">
              <div className="review-header">
                <span className="username">{user.username}</span>
                <div className="stars">{renderStars(userReview.rating)}</div>
                <span className="date">{formatDate(userReview.dateCreated)}</span>
              </div>
              <p className="comment">{userReview.comment}</p>
            </div>
          </div>
        )}

        <div className="all-reviews">
          <h3>All Reviews</h3>
          {reviews.length > 0 ? (
            sortReviews(reviews).map((review) => (
              <div key={review.reviewId} className="review-card">
                <div className="review-header">
                  <span className="username">{review.username}</span>
                  <div className="stars">{renderStars(review.rating)}</div>
                  <span className="date">{formatDate(review.dateCreated)}</span>
                </div>
                <p className="comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="recommendations-section">
        <h2>You Might Also Like</h2>
        {recommendationsLoading ? (
          <div className="recommendations-loading">
            <p>Loading recommendations...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="recommendations-grid">
            {recommendations.map((recommendedRestaurant) => (
              <div 
                key={recommendedRestaurant.id} 
                className="recommendation-card"
                onClick={() => handleRecommendationClick(recommendedRestaurant)}
              >
                <div className="recommendation-header">
                  <h3>{recommendedRestaurant.name}</h3>
                  <span className="cuisine-badge">{recommendedRestaurant.cuisine}</span>
                </div>
                <div className="recommendation-rating">
                  <div className="stars">{renderStars(recommendedRestaurant.rating)}</div>
                  <span className="rating-text">{recommendedRestaurant.rating} ⭐</span>
                </div>
                <p className="recommendation-description">{recommendedRestaurant.description}</p>
                <div className="recommendation-address">
                  <span>📍 {recommendedRestaurant.address}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-recommendations">
            <p>No recommendations available at the moment.</p>
          </div>
        )}
      </div>
      
      {showReviewForm && (
        <ReviewForm
          restaurantId={restaurantId}
          restaurantName={restaurant.name}
          username={user.username}
          onSubmit={handleReviewSubmit}
          onCancel={handleReviewCancel}
        />
      )}
      
      {showEditForm && userReview && (
        <EditReviewForm
          review={userReview}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
}

export default RestaurantDetail;