import React, { useState, useEffect } from 'react';
import './login.css';
// import Navbar from '../navbar/navbar.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"
import GoogleSignIn from './GoogleSignIn.js';

function Login( {setUser} ) {
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        
        if (!username.trim() || !password.trim()) return;
    

    const response = await fetch("http://localhost:3001/user/login", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (response.ok) {
        console.log("Login successful", data);
        setUser(data.user);
        navigate("/")
    }
    else {
        alert("Login failed: " + data.error);
    }
};
    
    
    return (
        <div className="layout">
            {/* <Navbar /> */}
           <form onSubmit={handleLogin}>
            <div className="form-group">
                <h1 className="header"> Login </h1>
                <label htmlFor="exampleInputUsername"> 
                    Username </label>
                <input 
                type="text" 
                className="form-control" 
                id="exampleInputUsername" 
                aria-describedby="UsernameHelp"
                value={username}
                placeholder='guy123'
                onChange={(event) => setusername(event.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="exampleInputPassword1">
                    Password</label>
                <input 
                type="password" 
                className="form-control" 
                id="exampleInputPassword1" 
                value={password}
                placeholder='password123'
                onChange={(event) => setpassword(event.target.value)}
                />
            </div>
            <div className="form-group form-check">
                <input 
                type="checkbox" 
                className="form-check-input" 
                id="exampleCheck1"/>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
            </form>

            <GoogleSignIn setUser={setUser} />

            <div className="register"> 
                <p> Don't have an account? <Link to="/register"> Sign up here </Link> </p>
            </div>

        </div>
    );

}

export default Login;