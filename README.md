Setup Guide

Prerequisites
- Node.js (v16 or newer)  
- npm  
- MongoDB Atlas account  

Installation
1. Clone the repository
   bash
   git clone <repository-url>
   cd Cs110-Project
2. Install backend dependencies
cd backend
npm install
3.	Install frontend dependencies
cd ../frontend
npm install

Configuration
1. MongoDB connection
Open backend/index.js
Replacee the current MongoDB connection string with your own:

mongodb+srv://clope265:Passwordiscrazyngl%23092@dineperks-project.vepzatg.mongodb.net/

2.	Seed the database
cd backend
node seed.js

Running the Application
1.	Start the backend

cd backend
node index.js


2.	Start the frontend

cd frontend
npm start

default accountss
Admin: admin123 / password123
Admin: cruzl123 / password321
User: lopez123 / hello
User: guy123 / 12345

Dependencies

Backend packages
express
cors
helmet
mongodb
google-auth-library
jsonwebtoken
bcryptjs
express-validator
cookie-parser

Frontend packages
react
react-router-dom
bootstrap
react-scripts

Troubleshooting
If you see “module not found”, run npm install in the frontend and bcakend directories