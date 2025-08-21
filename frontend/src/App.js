import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/landingPage/landingPage.js'
import Login from './components/login/login.js';

function App() {

  
  return (
  <div>
  <LandingPage/>

  <Login/>
  </div>

  
  );
}

export default App;
