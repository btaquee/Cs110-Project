import './friends.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';


function Friends( { user } ) {
    
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    
    useEffect(() => { 
        if (!user?.username) return; // ignore if no user

        fetch(`http://localhost:3001/friends-list/${user.username}`)
        .then(response => response.json())
        .then(data => {
        console.log("Collected Friends:", data);
        setFriends(data.friends);
        })
        .catch(err => console.error("Error fetching friends:", err));
    }, [user]
);

const handleFriendClick = (friend) => {
    navigate(`/profile/${friend}`);
}

    
    return (
        <div className="friend-list">
            <h1 className="heading"> {user.username}'s Friends:</h1>
            {friends.length > 0 ? (
                <div className="list-group">
                    {friends.map((friend, index) => (
                        <div key={index} className="list-group-item"
                            onClick={() => handleFriendClick(friend)}>
                            
                            {friend}
                            </div>
                    ))}     
                        </div>
            ) : (
                <p> No friends were found. </p>
            )}
        </div>
        

    )
};

export default Friends;