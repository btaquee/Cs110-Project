// import Navbar from '../navbar/navbar.js';
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

// const user = { username: "CoolGuy123" };    

return (
    <div className="land-page">
    
    {/* <Navbar/> */}

        <div className="Search">
          <h1>Search Restaurants/Users (MongoDB)</h1>
          <input
            type="text"
            placeholder="Enter restaurant/user name..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          {searchResults.restaurants?.length > 0 && (
            <ul className="search-results">
              <h2> Restaurants</h2>
              {searchResults.restaurants.map(restaurant => (
                <li key={restaurant._id}>
                  {restaurant.name} , Cuisine: {restaurant.cuisine} , Rating: {restaurant.rating}
                </li>
              ))}
            </ul>
          )}

          {searchResults.users?.length > 0 && (
            <ul className="search-results">
              <h2> Users </h2>
              {searchResults.users.map(user => (
                <li key={user._id}>
                  {user.username} , Favorite Restaurant: {user.favRestaurant} , Favorite Cuisine: {user.favCuisine}
                </li>
              ))}
            </ul>
          )}
        </div>

          {/* General listing of the restaurants: */}
          <div className="restaurant-list">
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