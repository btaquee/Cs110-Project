const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); // Import the MongoClient

const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;

// --- MongoDB Connection ---
// Replace with your MongoDB Atlas connection string
const url = 'mongodb+srv://clope265:Passwordiscrazyngl%23092@dineperks-project.vepzatg.mongodb.net/?retryWrites=true&w=majority&appName=DinePerks-Project';
const client = new MongoClient(url);
const dbName = 'DinePerksDB'; // You can name your database anything

let db; // Variable to hold the database connection

async function connectToDb() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName); // Assign the database connection to our variable
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit if we can't connect
  }
}

connectToDb().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});

// ... (rest of your server code will go here)

app.get('/search', async (req, res) => {
  try {
    const term = req.query.query;
    
    //Restaurant Search
    const restaurantResults = await db.collection('restaurants')
      .find({ 
        $or: [
             { name: { $regex: term, $options: 'i' } }, 
             { cuisine: {$regex: term, $options: 'i'} }
        ] })
      .toArray();

    //User Search
    const userResults = await db.collection("users")
        .find({ 
        $or: [
             { username: { $regex: term, $options: 'i' } }, 
             { favRestaurant: {$regex: term, $options: 'i'} },
             { favCuisine: {$regex: term, $options: 'i'} }
        ] })
      .toArray();

    res.json({
      restaurants: restaurantResults,
      users: userResults
    });
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).json({ error: "Error during search" }); // ✅ return JSON
  }
});

app.get('/restaurants', async (req, res) => {
    try {
        const results = await db.collection('restaurants').find({}).toArray();
        res.json(results);
    } catch (err) {
        console.error("Error fetchin restaurants: ", err);
        res.status(500).json({error: "Error fetching restuarants"});
    }
});

app.get('/user/retrieve', async (req, res) => {
    try {
      const username = req.query.username;

      const loginUserResults = await  db.collection("users")
        .find({username: { $regex: username, $options: 'i'} } ).toArray();
        res.json(loginUserResults) 
    } catch (err) {
        console.error("Error fetchin usernames: ", err);
        res.status(500).json({error: "Error fetching usernames"}); 
    }
      });

app.post('/user/login', async (req, res) =>{
  try {
    const { username, password } = req.body;
    

    const user = await db.collection("users").findOne({username: username});

    if (!user) {
      return res.status(404).json({ error: "User not found"});
    }

    if (user.password !== password) {
      return res.status(401).json({error: "Password does not match "});
    }
    //Will return user info for profiling
    res.json({
      user: {
        username: user.username,
        favRestaurant: user.favRestaurant,
        favCuisine: user.favCuisine
      }
    });

  } catch (err) {
        console.error("Error checking username/password: ", err);
        res.status(500).json({error: "Error checking usernames/password"}); 
    }
});

app.post('/user/register', async (req, res) => {
  try {

    const { username, password } = req.body;

    const existingUser = await db.collection("users").findOne({username: username});

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists"});
    }

    const newAccount ={
      username: username,
      password: password, 
      admin: false, 
      favRestuarant: "",
      favCuisine: "", 
    };

    //insert a new user into the database
    await db.collection("users").insertOne(newAccount);

    res.status(201).json({
      message: "Registration successful!",
      newUser: {
        username: newAccount.username,
      }

    })

  } catch (err) {
        console.error("Error registering new user: ", err);
        res.status(500).json({error: "Error registering new user"}); 
      }
    });