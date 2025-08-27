import './friends.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';

function Friends({ user }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFriends = async () => {
    if (!user?.username) return;
    try {
      const res = await fetch(`http://localhost:3001/friends-list/${encodeURIComponent(user.username)}`);
      const data = await res.json();
      setFriends(Array.isArray(data.friends) ? data.friends : []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setFriends([]);
    }
  };

  useEffect(() => {
    loadFriends();
  }, [user?.username]);

  const handleFriendClick = (friend) => {
    navigate(`/profile/${friend}`);
  };

  const addFriend = async () => {
    if (!user?.username) return setMsg('Please sign in first.');
    if (!newFriend.trim()) return setMsg('Enter a username to add.');
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('http://localhost:3001/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, friend: newFriend.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || 'Failed to add friend');
      } else {
        setMsg('Friend added!');
        setNewFriend('');
        await loadFriends();
      }
    } catch (e) {
      console.error(e);
      setMsg('Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friend, e) => {
    // prevent the row click from navigating to the profile
    e.stopPropagation();

    if (!window.confirm(`Remove ${friend}?`)) return;
    try {
      const res = await fetch(
        `http://localhost:3001/friends/${encodeURIComponent(user.username)}/${encodeURIComponent(friend)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || 'Failed to remove friend');
      } else {
        setMsg('Friend removed');
        setFriends(prev => prev.filter(f => f !== friend));
      }
    } catch (e2) {
      console.error(e2);
      setMsg('Failed to remove friend');
    }
  };

  if (!user?.username) {
    return (
      <div className="friend-list container py-4">
        <p>Please sign in to manage friends.</p>
      </div>
    );
  }

  return (
    <div className="friend-list container py-4">
      <h1 className="heading mb-3">{user.username}'s Friends</h1>

      {msg && <div className="alert alert-info py-2">{msg}</div>}

      <div className="card mb-4">
        <div className="card-body d-flex gap-2 align-items-center">
          <input
            className="form-control"
            placeholder="Enter username…"
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            disabled={loading}
            style={{ maxWidth: 320 }}
          />
          <button className="btn btn-primary" onClick={addFriend} disabled={loading}>
            Add Friend
          </button>
        </div>
      </div>

      {friends.length > 0 ? (
        <div className="list-group">
          {friends.map((friend, idx) => (
            <div
              key={idx}
              className="list-group-item d-flex justify-content-between align-items-center"
              onClick={() => handleFriendClick(friend)}
              style={{ cursor: 'pointer' }}
            >
              <span>{friend}</span>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={(e) => removeFriend(friend, e)}
                title={`Remove ${friend}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No friends were found.</p>
      )}
    </div>
  );
}

export default Friends;
