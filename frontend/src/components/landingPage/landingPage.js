import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing-home.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [restaurants, setRestaurants] = useState([]);

  const handleSearch = () => {
  if (!searchQuery.trim()) return; // ignore empty

  fetch(`http://localhost:3001/search?query=${searchQuery}`)
    .then(response => response.json())
    .then(data => {
        console.log('Query Results fetched from API:', data);
        setSearchResults(data);
      });
  
};

useEffect(() => {
  fetch("http://localhost:3001/restaurants")
  .then(response => response.json())
  .then(data => {
    console.log("Restaurants:", data);
    setRestaurants(data);
  })
  .catch(err => console.error("Error fetching restaurants:", err));
}, []);

const handleRestaurantClick = (restaurantId) => {
  navigate(`/restaurant/${restaurantId}`);
};
   

return (
    <div className="land-page">
        <div className="Search">
          <h2 className="search-heading" >Search Restaurants/Users</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Enter restaurant/user name..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button  className="search-button" onClick={handleSearch}>Search</button>
          {searchResults.restaurants?.length > 0 && (
            <ul className="search-results">
              <h3 className="heading"> Restaurant Search: </h3>
              {searchResults.restaurants.map(restaurant => (
                <div 
                  className="restaurant-list-item" 
                  key={restaurant._id}
                  onClick={() => handleRestaurantClick(restaurant.id)}
                >
                  {restaurant.name} , Cuisine: {restaurant.cuisine}
                </div>
              ))}
            </ul>
          )}

          {searchResults.users?.length > 0 && (
            <ul className="search-results">
              <h3 className="heading"> User Search: </h3>
              {searchResults.users.map(user => (
                <div className="user-list-item"key={user._id}
                onClick={() => navigate(`/profile/${user.username}`)}>                  
                  {user.username} , Favorite Restaurant: {user.favRestaurant} , Favorite Cuisine: {user.favCuisine}
                </div>
              ))}
            </ul>
          )} 
        </div>

          {/* General listing of the restaurants: */}
          <div className="restaurant-list">
            <h1>Restaurant List: </h1>
            {restaurants.length > 0 ? (
              <div className="restaurants-grid">
                {restaurants.map(restaurant => (
                  <div 
                    className="restaurant-card" 
                    key={restaurant._id}
                    onClick={() => handleRestaurantClick(restaurant.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3>{restaurant.name}</h3>
                    <p>Cuisine: {restaurant.cuisine}</p>
                    {restaurant.hasReviews ? (
                      <p>Rating: {restaurant.averageRating} ⭐ ({restaurant.totalReviews} reviews)</p>
                    ) : (
                      <p>No ratings yet</p>
                    )}
                    <small>Click to see reviews</small>
                  </div>
                ))}
              </div>
            ) : (
              <p> No restaurants found.</p>
            )}
          </div>
          </div>
          
  );
    
}

export default LandingPage;