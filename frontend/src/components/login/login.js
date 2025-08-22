import React, { useState, useEffect } from 'react';
import './login.css'
import Navbar from '../navbar/navbar.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Login() {
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");

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
};
    
    
    return (
        <div className="layout">
            <Navbar />
           <form onSubmit={handleLogin}>
            <div className="form-group">
                <label htmlFor="exampleInputUsername"> Username </label>
                <input 
                type="text" 
                className="form-control" 
                id="exampleInputUsername" 
                aria-describedby="UsernameHelp"
                value={username}
                onChange={(event) => setusername(event.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input 
                type="password" 
                className="form-control" 
                id="exampleInputPassword1" 
                value={password}
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
        </div>
    );

}

export default Login;