import React, { useState, useEffect } from 'react';
import './profile.css';
import GiftHistory from '../coupons/GiftHistory';


function Profile({ user, setUser }) {
    const [showRestaurantForm, setShowRestaurantForm] = useState(false);
    const [showCuisineForm, setShowCuisineForm] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState('');
    const [newCuisine, setNewCuisine] = useState('');
    const [message, setMessage] = useState('');
    const [availableRestaurants, setAvailableRestaurants] = useState([]);
    const [availableCuisines, setAvailableCuisines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [myCoupons, setMyCoupons] = useState([]);

    // Fetch available restaurants and cuisines when component loads
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [restaurantsResponse, cuisinesResponse] = await Promise.all([
                    fetch('http://localhost:3001/restaurants/names'),
                    fetch('http://localhost:3001/cuisines')
                ]);

                const restaurantsData = await restaurantsResponse.json();
                const cuisinesData = await cuisinesResponse.json();

                setAvailableRestaurants(restaurantsData.restaurants);
                setAvailableCuisines(cuisinesData.cuisines);
            } catch (error) {
                console.error('Error fetching options:', error);
            }
        };

        fetchOptions();
    }, []);

    // Fetch user's claimed coupons
    useEffect(() => {
        if (!user?.username) { setMyCoupons([]); return; }
        fetch(`http://localhost:3001/users/${encodeURIComponent(user.username)}/coupons`)
            .then(res => res.json())
            .then(data => setMyCoupons(Array.isArray(data.coupons) ? data.coupons : []))
            .catch(err => console.error('Error fetching user coupons:', err));
        }, [user?.username]);

    const updateRestaurant = async () => {
        if (!newRestaurant.trim()) {
            setMessage('Please enter a restaurant name');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/user/update-restaurant', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    favRestaurant: newRestaurant
                })
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                fetch(`http://localhost:3001/users/${encodeURIComponent(user.username)}/coupons`)
                    .then(res => res.json())
                    .then(data => setMyCoupons(Array.isArray(data.coupons) ? data.coupons : []))
                    .catch(err => console.error('Error fetching user coupons:', err));
                setMessage('Restaurant updated successfully!');
                setShowRestaurantForm(false);
                setNewRestaurant('');
            } else {
                setMessage(data.error || 'Failed to update restaurant');
            }
        } catch (error) {
            console.error('Error updating restaurant:', error);
            setMessage('Error updating restaurant');
        }
    };

    const updateCuisine = async () => {
        if (!newCuisine.trim()) {
            setMessage('Please enter a cuisine name');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/user/update-cuisine', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    favCuisine: newCuisine
                })
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setMessage('Cuisine updated successfully!');
                setShowCuisineForm(false);
                setNewCuisine('');
            } else {
                setMessage(data.error || 'Failed to update cuisine');
            }
        } catch (error) {
            console.error('Error updating cuisine:', error);
            setMessage('Error updating cuisine');
        }
    };

    return (
        <div className="profile-layout">
            {user ? (
                <div className="profile">
                    <h1 className="underline">{user.username}'s Profile</h1>
                    {message && <p className="message">{message}</p>}
                    <br />
                    <div className="sameline">
                        <h2>Favorite Restaurant: {user.favRestaurant || 'Not set'}</h2>
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => setShowRestaurantForm(!showRestaurantForm)}
                        >
                            {showRestaurantForm ? 'Cancel' : 'Update Restaurant'}
                        </button>
                    </div>
                    {showRestaurantForm && (
                        <div className="update-form">
                            <select
                                value={newRestaurant}
                                onChange={(e) => setNewRestaurant(e.target.value)}
                            >
                                <option value="">Select a restaurant...</option>
                                {availableRestaurants.map(restaurant => (
                                    <option key={restaurant} value={restaurant}>
                                        {restaurant}
                                    </option>
                                ))}
                            </select>
                            <button onClick={updateRestaurant}>Save</button>
                        </div>
                    )}
                    <br />
                    <div className="sameline">
                        <h2>Favorite Cuisine: {user.favCuisine || 'Not set'}</h2>
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => setShowCuisineForm(!showCuisineForm)}
                        >
                            {showCuisineForm ? 'Cancel' : 'Update Cuisine'}
                        </button>
                    </div>
                    {showCuisineForm && (
                        <div className="update-form">
                            <select
                                value={newCuisine}
                                onChange={(e) => setNewCuisine(e.target.value)}
                            >
                                <option value="">Select a cuisine...</option>
                                {availableCuisines.map(cuisine => (
                                    <option key={cuisine} value={cuisine}>
                                        {cuisine}
                                    </option>
                                ))}
                            </select>
                            <button onClick={updateCuisine}>Save</button>
                        </div>
                    )}

                    {/* My Coupons Section */}
                    {myCoupons.length > 0 && (
                        <>
                            <hr />
                            <h2>My Coupons</h2>
                            <ul>
                                {myCoupons.map(c => (
                                    <li key={c.code}>
                                        <strong>{c.code}</strong> – {c.title || c.description || 'Coupon'}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {user?.username && <GiftHistory username={user.username} />}


                </div>
            ) : (
                <p>What are you doing here. Please sign in to display your profile. </p>
            )}
        </div>
    );
}

export default Profile;
