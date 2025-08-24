import React, { useState, useEffect } from 'react';
import './login.css';
// import Navbar from '../navbar/navbar.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";

function Register() {
    const [Newusername, setNewusername] = useState("");
    const [Newpassword, setNewpassword] = useState("");
    const navigate = useNavigate();
    
    const handleRegister = async (event) => {

        event.preventDefault();
        
        if (!Newusername.trim() || !Newpassword.trim()) return;

        try {
            const response = await fetch("http://localhost:3001/user/register", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    username: Newusername, 
                    password: Newpassword 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Registration sucessful", data);
                alert("Registration successful! Please log in.");
                navigate("/login")
            }
            else {
                const errorData = await response.json();
                alert("Registration failed: " + errorData.error);
            }
        } catch (err) {
            console.error("Error during registration:", err);
            alert("An error occurred during registration. Please try again later.");
        }

    }
    
    return (
        <div className="layout">
           <form onSubmit={handleRegister}>
            <div className="form-group">
                <h1 className="header"> Registration </h1>
                <label htmlFor="exampleInputUsername"> 
                    Username </label>
                <input 
                type="text" 
                className="form-control" 
                id="exampleInputUsername" 
                aria-describedby="UsernameHelp"
                placeholder='Enter a new username'
                value={Newusername}
                onChange={(event) => setNewusername(event.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="exampleInputPassword1">
                    Password</label>
                <input 
                type="password" 
                className="form-control" 
                id="exampleInputPassword1" 
                value={Newpassword}
                placeholder='Enter a new password'
                onChange={(event) => setNewpassword(event.target.value)}
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

export default Register;