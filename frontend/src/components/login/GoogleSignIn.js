import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import './login.css';

function GoogleSignIn({ setUser }) {
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch('http://localhost:3001/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Google login successful:', data);
                setUser(data.user);
                navigate('/');
            } else {
                alert('Google login failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error during Google login:', error);
            alert('Error during Google login. Please try again.');
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
        alert('Google login failed. Please try again.');
    };

    return (
        <div className="google-signin-container">
            <div className="divider">
                <span>or</span>
            </div>
            <div className="google-button-wrapper">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                />
            </div>
        </div>
    );
}

export default GoogleSignIn;
