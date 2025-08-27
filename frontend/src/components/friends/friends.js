import './friends.css'; 
import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';

function Friends({ user }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // dropdown state
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

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

  const addFriend = async (usernameToAdd) => {
    const friendToAdd = (usernameToAdd ?? newFriend).trim();
    if (!user?.username) return setMsg('Please sign in first.');
    if (!friendToAdd) return setMsg('Enter a username to add.');
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('http://localhost:3001/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, friend: friendToAdd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || 'Failed to add friend');
      } else {
        setMsg('Friend added!');
        setNewFriend('');
        setSuggestions([]);
        setOpen(false);
        await loadFriends();
      }
    } catch (e) {
      console.error(e);
      setMsg('Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  // fetch suggestions (debounced)
  useEffect(() => {
    const q = newFriend.trim();
    if (q.length < 2) { setSuggestions([]); setOpen(false); setActiveIndex(-1); return; }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(
        `http://localhost:3001/users/search?q=${encodeURIComponent(q)}&me=${encodeURIComponent(user?.username || '')}`,
        { signal: controller.signal }
      )
        .then(r => r.json())
        .then(d => {
          const users = Array.isArray(d.users) ? d.users : [];
          setSuggestions(users);
          setOpen(users.length > 0);      // open only if we have results
          setActiveIndex(users.length ? 0 : -1);
        })
        .catch(() => {});
    }, 250);

    return () => { clearTimeout(timeout); controller.abort(); };
  }, [newFriend, user?.username]);

  // click outside to close
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = suggestions[activeIndex];
      if (chosen) addFriend(typeof chosen === 'string' ? chosen : chosen.username);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const selectSuggestion = (val) => {
    // onMouseDown so it fires before blur
    addFriend(typeof val === 'string' ? val : val.username);
  };

  const removeFriend = async (friend, e) => {
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

  const initial = (name) => (name?.[0]?.toUpperCase() || 'U');

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
        <div className="card-body">
          {/* Search + Dropdown */}
          <div className="friend-search">
            <div className="friend-search__inputwrap" ref={inputRef}>
              <svg className="friend-search__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                className="friend-search__input"
                placeholder="Search usernames…"
                value={newFriend}
                onChange={(e) => { setNewFriend(e.target.value); setOpen(true); }}
                onKeyDown={onKeyDown}
                disabled={loading}
                autoComplete="off"
                aria-expanded={open}
                aria-controls="friend-suggestions"
              />
            </div>

            <div
              id="friend-suggestions"
              className={`friend-search__dropdown ${open ? 'friend-search__dropdown--open' : ''}`}
              ref={dropdownRef}
              role="listbox"
            >
              {newFriend.trim().length >= 2 && suggestions.length === 0 && (
                <div className="friend-search__state">No matches found</div>
              )}

              {suggestions.length > 0 && (
                <div className="friend-search__list">
                  {suggestions.map((u, i) => {
                    const username = typeof u === 'string' ? u : u.username;
                    return (
                      <div
                        key={username}
                        role="option"
                        aria-selected={i === activeIndex}
                        className={`friend-search__item ${i === activeIndex ? 'friend-search__item--active' : ''}`}
                        onMouseDown={() => selectSuggestion(username)}
                      >
                        <div className="friend-search__avatar">{initial(username)}</div>
                        <div>
                          <div className="friend-search__name">{username}</div>
                          <div className="friend-search__meta">Press Enter to add</div>
                        </div>
                        <div className="friend-search__action">Add</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

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
