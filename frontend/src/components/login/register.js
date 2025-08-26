import React, { useState, useEffect } from 'react';
import './login.css';
// import Navbar from '../navbar/navbar.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";

function Register() {
    const [Newusername, setNewusername] = useState("");
    const [Newpassword, setNewpassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();
    
    const handleRegister = async (event) => {

        event.preventDefault();
        setErrorMessage("");
        setValidationErrors({});
        
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
                console.log("Registration successful", data);
                alert("Registration successful! Please log in.");
                navigate("/login")
            }
            else {
                const errorData = await response.json();
                
                // Handle validation errors specifically
                if (errorData.error === "Validation failed" && errorData.details) {
                    const errors = {};
                    errorData.details.forEach(detail => {
                        errors[detail.path] = detail.msg;
                    });
                    setValidationErrors(errors);
                    setErrorMessage("Please fix the validation errors below:");
                } else {
                    setErrorMessage(errorData.error || "Registration failed");
                }
            }
        } catch (err) {
            console.error("Error during registration:", err);
            setErrorMessage("An error occurred during registration. Please try again later.");
        }

    }
    
    return (
        <div className="layout">
           <form onSubmit={handleRegister}>
            <div className="form-group">
                <h1 className="header"> Registration </h1>
                
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}
                
                <label htmlFor="exampleInputUsername"> 
                    Username </label>
                <input 
                type="text" 
                className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`}
                id="exampleInputUsername" 
                aria-describedby="UsernameHelp"
                placeholder='Enter a new username (letters, numbers, underscores only)'
                value={Newusername}
                onChange={(event) => setNewusername(event.target.value)}
                />
                {validationErrors.username && (
                    <div className="invalid-feedback">
                        {validationErrors.username}
                    </div>
                )}
                <small className="form-text text-muted">
                    Username must be 3-30 characters, letters, numbers, and underscores only
                </small>
            </div>
            <div className="form-group">
                <label htmlFor="exampleInputPassword1">
                    Password</label>
                <input 
                type="password" 
                className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                id="exampleInputPassword1" 
                value={Newpassword}
                placeholder='Enter a new password (minimum 6 characters)'
                onChange={(event) => setNewpassword(event.target.value)}
                />
                {validationErrors.password && (
                    <div className="invalid-feedback">
                        {validationErrors.password}
                    </div>
                )}
                <small className="form-text text-muted">
                    Password must be at least 6 characters long
                </small>
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