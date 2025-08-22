import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import './App.css';
import LandingPage from './components/landingPage/landingPage.js'
import Login from './components/login/login.js';
import Navbar from './components/navbar/navbar.js';
import About from './components/about/about.js';
import Friends from './components/friends/friends.js';
import Profile from './components/profile/profile.js';

function App() {

  return (
  <div>
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/navbar" element={<Navbar />} />

    </Routes>
  </Router>
  
   {/* <LandingPage/> */}

  </div>

  
  );
}

export default App;
