import React, { useState } from 'react';
import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import LandingPage from './components/landingPage/landingPage.js'
import Login from './components/login/login.js';
import Navbar from './components/navbar/navbar.js';
import About from './components/about/about.js';
import Friends from './components/friends/friends.js';
import Profile from './components/profile/profile.js';
import Register from './components/login/register.js';
import RestaurantDetail from './components/restaurant/restaurantDetail.js';
import OtherProfile from './components/profile/otherProfile.js';
import Coupons from './components/coupons/Coupons.js';

function App() {

  const [user, setUser] = useState(null);

  return (
  <GoogleOAuthProvider clientId="832872323848-p4r34av1nbuosspa624t8um34d43hiud.apps.googleusercontent.com">
    <div>
    <Router>
      <Navbar user={user} setUser={setUser}/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/about" element={<About />} />
        <Route path="/friends" element={<Friends  user={user} />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser}/>} />
        <Route path="/coupons" element={<Coupons user={user} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurant/:restaurantId" element={<RestaurantDetail user={user} />} />
        <Route path="/profile/:friend" element={<OtherProfile />} />
      </Routes>
    </Router>

    </div>
  </GoogleOAuthProvider>

  
  );
}

export default App;
