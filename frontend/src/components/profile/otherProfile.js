import React, { useState, useEffect } from 'react';
import './profile.css';
import { useParams } from 'react-router-dom';
import './profile.css';

function OtherProfile( ) {
    const { friend } = useParams();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        console.log("Fetching profile for:", friend);
        fetch(`http://localhost:3001/user/${friend}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error("Error fetching user profile:", err));
    },   [friend]);
 
    return (
        <div className="profile-layout">
            {profile ? (
                <div>
                    <h1 className="underline">{profile.username}'s Profile</h1>
                    <h2 className="sameline">Favorite Restaurant: {profile.favRestaurant || 'Not set'}</h2>
                    <h2 className="sameline">Favorite Cuisine: {profile.favCuisine || 'Not set'}</h2>
                </div>
            ) : (
                <p>Profile not availalbe</p>
            )}



        </div>

    );
}

export default OtherProfile;