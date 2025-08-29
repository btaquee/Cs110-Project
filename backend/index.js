const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MongoClient } = require('mongodb'); // Import the MongoClient
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const {
  validateRegistration,
  validateLogin,
  validateSearch,
  validateUserRetrieve,
  validateReviewCreation,
  validateReviewUpdate,
  validateReviewDeletion,
  validateRestaurantId,
  validateUsername,
  validateFriendUsername,
  validateProfileUpdate
} = require('./validation');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Limit request body size
const port = 3001;

app.get('/', (req, res) => {
    let visitCount = parseInt(req.cookies.visitCount) || 0;
    visitCount++;

    // Set the cookie in the user's browser
    res.cookie('visitCount', visitCount.toString(), { maxAge: 900000, httpOnly: true });

    res.send(`Welcome! You have visited this page ${visitCount} times.`);
});


// JWT Secret - should be stored in environment variables in production
const JWT_SECRET = 'dineperks-jwt-secret-key-2024';

const GOOGLE_CLIENT_ID = '832872323848-p4r34av1nbuosspa624t8um34d43hiud.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- MongoDB Connection ---

const url = 'mongodb+srv://clope265:Passwordiscrazyngl%23092@dineperks-project.vepzatg.mongodb.net/?retryWrites=true&w=majority&appName=DinePerks-Project';
const client = new MongoClient(url);
const dbName = 'DinePerksDB';

let db; // Variable to hold the database connection

async function connectToDb() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName); // Assign the database connection to our variable
    await db.collection('users').createIndex({ username: 1 });
    await db.collection('coupons').createIndex({ code: 1 }, { unique: true });
    await db.collection('coupons').createIndex({ private: 1, owner: 1 });
    await db.collection('coupons').createIndex({ restaurant: 1, active: 1, sendable: 1 });
    await db.collection('gifts').createIndex({ from: 1, to: 1, code: 1, sentAt: -1 });
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

// Server endpoints



app.get('/search', validateSearch, async (req, res) => {
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

function slugifyRestaurant(name) {
  return String(name).replace(/\W+/g, '').toUpperCase();
}



app.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await db.collection('restaurants').find({}).toArray();
        
        // Calculate average ratings for each restaurant
        const restaurantsWithRatings = await Promise.all(restaurants.map(async (restaurant) => {
            const reviews = await db.collection('reviews')
                .find({ restaurantId: restaurant.id })
                .toArray();
            
            if (reviews.length === 0) {
                return {
                    ...restaurant,
                    averageRating: 0,
                    totalReviews: 0,
                    hasReviews: false
                };
            }
            
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = (totalRating / reviews.length).toFixed(1);
            
            return {
                ...restaurant,
                averageRating: parseFloat(averageRating),
                totalReviews: reviews.length,
                hasReviews: true
            };
        }));
        
        res.json(restaurantsWithRatings);
    } catch (err) {
        console.error("Error fetching restaurants: ", err);
        res.status(500).json({error: "Error fetching restaurants"});
    }
});

app.get('/user/retrieve', validateUserRetrieve, async (req, res) => {
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

app.post('/user/login', validateLogin, async (req, res) =>{
  try {
    const { username, password } = req.body;
    

    const user = await db.collection("users").findOne({username: username});

    if (!user) {
      return res.status(404).json({ error: "User not found"});
    }

    // Check if user has a hashed password (new users) or plain text (existing users)
    let passwordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      // Hashed password
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (legacy)
      passwordValid = (user.password === password);
    }

    if (!passwordValid) {
      return res.status(401).json({error: "Password does not match "});
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    //Will return user info for profiling
    res.json({
      user: {
        username: user.username,
        email: user.email,
        picture: user.picture,
        favRestaurant: user.favRestaurant || "",
        favCuisine: user.favCuisine || ""
      },
      token: token
    });

  } catch (err) {
        console.error("Error checking username/password: ", err);
        res.status(500).json({error: "Error checking usernames/password"}); 
    }
});

// Google OAuth Authentication Endpoint
app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'No credential provided' });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user already exists
    let user = await db.collection("users").findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (!user) {
      // Create new user with Google info
      const newUser = {
        username: name || email.split('@')[0], // Use name or email prefix as username
        email: email,
        googleId: googleId,
        picture: picture,
        admin: false,
        favRestaurant: "",
        favCuisine: "",
        authMethod: 'google',
        dateCreated: new Date()
      };

      const result = await db.collection("users").insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        username: user.username,
        email: user.email,
        picture: user.picture,
        favRestaurant: user.favRestaurant || "",
        favCuisine: user.favCuisine || ""
      },
      token: token
    });

  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

app.post('/user/register', validateRegistration, async (req, res) => {
  try {

    const { username, password } = req.body;

    const existingUser = await db.collection("users").findOne({username: username});

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists"});
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAccount ={
      username: username,
      password: hashedPassword, 
      admin: false, 
      favRestaurant: "",
      favCuisine: "",
      authMethod: 'local',
      dateCreated: new Date()
    };

    //insert a new user into the database
    await db.collection("users").insertOne(newAccount);

    // Generate JWT token for new user
    const token = jwt.sign(
      { 
        userId: newAccount._id, 
        username: newAccount.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "Registration successful!",
      newUser: {
        username: newAccount.username,
        favRestaurant: newAccount.favRestaurant,
        favCuisine: newAccount.favCuisine
      },
      token: token
    })

  } catch (err) {
        console.error("Error registering new user: ", err);
        res.status(500).json({error: "Error registering new user"}); 
      }
    });

// --- REVIEWS ENDPOINTS ---

// Get all reviews for a specific restaurant
app.get('/reviews/restaurant/:restaurantId', validateRestaurantId, async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    const reviews = await db.collection('reviews')
      .find({ restaurantId: restaurantId })
      .sort({ dateCreated: -1 }) // Sort by newest first
      .toArray();

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      reviews: reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

// Get a specific user's review for a restaurant (if they have one)
app.get('/reviews/user/:username/restaurant/:restaurantId', validateUsername, validateRestaurantId, async (req, res) => {
  try {
    const { username, restaurantId } = req.params;
    const restaurantIdNum = parseInt(restaurantId);
    
    const userReview = await db.collection('reviews')
      .findOne({ 
        username: username, 
        restaurantId: restaurantIdNum 
      });

    res.json({ userReview: userReview });
  } catch (err) {
    console.error("Error fetching user review:", err);
    res.status(500).json({ error: "Error fetching user review" });
  }
});

// Create a new review
app.post('/reviews', validateReviewCreation, async (req, res) => {
  try {
    const { restaurantId, restaurantName, username, rating, comment } = req.body;

    // Validate required fields
    if (!restaurantId || !restaurantName || !username || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this restaurant
    const existingReview = await db.collection('reviews')
      .findOne({ 
        username: username, 
        restaurantId: parseInt(restaurantId) 
      });

    if (existingReview) {
      return res.status(409).json({ error: "You have already reviewed this restaurant" });
    }

    // Get the next review ID
    const lastReview = await db.collection('reviews')
      .find({})
      .sort({ reviewId: -1 })
      .limit(1)
      .toArray();
    
    const nextReviewId = lastReview.length > 0 ? lastReview[0].reviewId + 1 : 1;

    // Create new review
    const newReview = {
      reviewId: nextReviewId,
      restaurantId: parseInt(restaurantId),
      restaurantName: restaurantName,
      username: username,
      rating: parseInt(rating),
      comment: comment,
      dateCreated: new Date()
    };

    const result = await db.collection('reviews').insertOne(newReview);

    if (result.acknowledged) {
      res.status(201).json({ 
        message: "Review submitted successfully",
        review: newReview
      });
    } else {
      res.status(500).json({ error: "Failed to submit review" });
    }

  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Error creating review" });
  }
});

// Update an existing review
app.put('/reviews/:reviewId', validateReviewUpdate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Validate required fields
    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Find the review and check if it exists
    const existingReview = await db.collection('reviews')
      .findOne({ reviewId: parseInt(reviewId) });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Update the review
    const result = await db.collection('reviews')
      .updateOne(
        { reviewId: parseInt(reviewId) },
        { 
          $set: { 
            rating: parseInt(rating), 
            comment: comment,
            dateUpdated: new Date()
          } 
        }
      );

    if (result.modifiedCount > 0) {
      // Get the updated review
      const updatedReview = await db.collection('reviews')
        .findOne({ reviewId: parseInt(reviewId) });

      res.json({ 
        message: "Review updated successfully",
        review: updatedReview
      });
    } else {
      res.status(500).json({ error: "Failed to update review" });
    }

  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ error: "Error updating review" });
  }
});

// Delete a review
app.delete('/reviews/:reviewId', validateReviewDeletion, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find the review and check if it exists
    const existingReview = await db.collection('reviews')
      .findOne({ reviewId: parseInt(reviewId) });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Delete the review
    const result = await db.collection('reviews')
      .deleteOne({ reviewId: parseInt(reviewId) });

    if (result.deletedCount > 0) {
      res.json({ 
        message: "Review deleted successfully",
        deletedReview: existingReview
      });
    } else {
      res.status(500).json({ error: "Failed to delete review" });
    }

  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Error deleting review" });
  }
});

// Get available restaurants for profile selection
app.get('/restaurants/names', async (req, res) => {
  try {
    const restaurants = await db.collection('restaurants')
      .find({}, { projection: { name: 1, _id: 0 } })
      .toArray();
    
    const restaurantNames = restaurants.map(r => r.name).sort();
    res.json({ restaurants: restaurantNames });
  } catch (err) {
    console.error("Error fetching restaurant names:", err);
    res.status(500).json({ error: "Error fetching restaurant names" });
  }
});

// Get available cuisines for profile selection
app.get('/cuisines', async (req, res) => {
  try {
    const cuisines = await db.collection('restaurants')
      .distinct('cuisine');
    
    const sortedCuisines = cuisines.sort();
    res.json({ cuisines: sortedCuisines });
  } catch (err) {
    console.error("Error fetching cuisines:", err);
    res.status(500).json({ error: "Error fetching cuisines" });
  }
});

// Fix existing users with typo in favRestaurant field (migration endpoint)
app.put('/user/fix-typo', async (req, res) => {
  try {
    // Find users with the typo field and fix them
    const result = await db.collection('users').updateMany(
      { favRestuarant: { $exists: true } },
      [
        {
          $set: {
            favRestaurant: "$favRestuarant"
          }
        },
        {
          $unset: "favRestuarant"
        }
      ]
    );

    res.json({
      message: "Database migration completed",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error during migration:", err);
    res.status(500).json({ error: "Error during migration" });
  }
});

// Get restaurant recommendations based on current restaurant and user preferences
app.get('/restaurants/recommendations/:restaurantId', validateRestaurantId, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { userCuisine } = req.query; // User's favorite cuisine from frontend

    // Get the current restaurant to find its cuisine
    const currentRestaurant = await db.collection('restaurants')
      .findOne({ id: parseInt(restaurantId) });

    if (!currentRestaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const currentCuisine = currentRestaurant.cuisine;
    
    // Build recommendation query
    let recommendationQuery = {
      id: { $ne: parseInt(restaurantId) } // Exclude current restaurant
    };

    // If user has a favorite cuisine, prioritize restaurants matching both cuisines
    if (userCuisine && userCuisine !== "") {
      // Get all restaurants matching either cuisine
      const allMatches = await db.collection('restaurants')
        .find({
          ...recommendationQuery,
          cuisine: { $in: [currentCuisine, userCuisine] }
        })
        .sort({ rating: -1, name: 1 })
        .toArray();

      // Sort them manually: user's favorite cuisine first, then current cuisine
      const sortedRecommendations = allMatches.sort((a, b) => {
        const aIsUserFavorite = a.cuisine === userCuisine;
        const bIsUserFavorite = b.cuisine === userCuisine;
        const aIsCurrentCuisine = a.cuisine === currentCuisine;
        const bIsCurrentCuisine = b.cuisine === currentCuisine;

        // If both match user's favorite cuisine, sort by rating
        if (aIsUserFavorite && bIsUserFavorite) {
          return b.rating - a.rating;
        }
        // If only one matches user's favorite cuisine, prioritize it
        if (aIsUserFavorite && !bIsUserFavorite) return -1;
        if (!aIsUserFavorite && bIsUserFavorite) return 1;
        // If both match current cuisine, sort by rating
        if (aIsCurrentCuisine && bIsCurrentCuisine) {
          return b.rating - a.rating;
        }
        // If only one matches current cuisine, prioritize it
        if (aIsCurrentCuisine && !bIsCurrentCuisine) return -1;
        if (!aIsCurrentCuisine && bIsCurrentCuisine) return 1;
        // Default sort by rating
        return b.rating - a.rating;
      });

      // Take only the first 10
      const recommendations = sortedRecommendations.slice(0, 10);

      res.json({ recommendations });
    } else {
      // If user has no favorite cuisine, recommend based on current restaurant's cuisine
      const recommendations = await db.collection('restaurants')
        .find({
          ...recommendationQuery,
          cuisine: currentCuisine
        })
        .sort({ rating: -1, name: 1 })
        .limit(10)
        .toArray();

      res.json({ recommendations });
    }

  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: "Error fetching recommendations" });
  }
});

// --- USER PROFILE UPDATE ENDPOINTS ---

// Update user's favorite restaurant
app.put('/user/update-restaurant', validateProfileUpdate, async (req, res) => {
  try {
    const { username, favRestaurant } = req.body;

    if (!username || !favRestaurant) {
      return res.status(400).json({ error: "Username and favorite restaurant are required" });
    }

    // Validate that the restaurant exists in our database
    const existingRestaurant = await db.collection('restaurants')
      .findOne({ name: { $regex: new RegExp(`^${favRestaurant}$`, 'i') } });

    if (!existingRestaurant) {
      return res.status(400).json({ 
        error: "Restaurant not found. Please select from our available restaurants." 
      });
    }

    const result = await db.collection('users')
      .updateOne(
        { username: username },
        { $set: { favRestaurant: existingRestaurant.name } }
      );

    if (result.modifiedCount > 0) {
      await ensureFavoriteSendableCoupon(username, existingRestaurant.name);
      // Get the updated user
      const updatedUser = await db.collection('users')
        .findOne({ username: username });

      res.json({
        message: "Favorite restaurant updated successfully",
        user: {
          username: updatedUser.username,
          favRestaurant: updatedUser.favRestaurant || "",
          favCuisine: updatedUser.favCuisine || ""
        }
      });
    } else {
      res.status(404).json({ error: "User not found or no changes made" });
    }

  } catch (err) {
    console.error("Error updating favorite restaurant:", err);
    res.status(500).json({ error: "Error updating favorite restaurant" });
  }
});

// Update user's favorite cuisine
app.put('/user/update-cuisine', validateProfileUpdate, async (req, res) => {
  try {
    const { username, favCuisine } = req.body;

    if (!username || !favCuisine) {
      return res.status(400).json({ error: "Username and favorite cuisine are required" });
    }

    // Validate that the cuisine exists in our database
    const existingCuisine = await db.collection('restaurants')
      .findOne({ cuisine: { $regex: new RegExp(`^${favCuisine}$`, 'i') } });

    if (!existingCuisine) {
      return res.status(400).json({ 
        error: "Cuisine not found. Please select from our available cuisines." 
      });
    }

    const result = await db.collection('users')
      .updateOne(
        { username: username },
        { $set: { favCuisine: existingCuisine.cuisine } }
      );

    if (result.modifiedCount > 0) {
      // Get the updated user
      const updatedUser = await db.collection('users')
        .findOne({ username: username });

      res.json({
        message: "Favorite cuisine updated successfully",
        user: {
          username: updatedUser.username,
          favRestaurant: updatedUser.favRestaurant || "",
          favCuisine: updatedUser.favCuisine || ""
        }
      });
    } else {
      res.status(404).json({ error: "User not found or no changes made" });
    }

  } catch (err) {
    console.error("Error updating favorite cuisine:", err);
    res.status(500).json({ error: "Error updating favorite cuisine" });
  }
});

//Gets friend list 
app.get('/friends-list/:username', validateUsername, async (req, res) => {
  try {
    const username = req.params.username;

    const friendsList = await db.collection("friends")
      .find({ username }).toArray();

    //Gets all spots where username is the username
    const friends = friendsList.map(friend => friend.friendUserName);

    res.json({
      username,
      friends
    });
  } catch (err) {
    console.error("Error fetching friends list:", err);
    res.status(500).json({ error: "Error fetching friends list" });
  }
});

//Gets the profile info for a user
app.get('/user/:friend', validateFriendUsername, async (req, res) => {
  try {
    const friend = req.params.friend;

    const userProfile = await db.collection("users").findOne({username: friend });

    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userProfile);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

// === FRIENDS: list my friends ===
// GET /users/:username/friends  -> { friends: ["lopez123","guy123", ...] }
app.get('/users/:username/friends', async (req, res) => {
  try {
    const { username } = req.params;
    // Seed data structure: { userId, username, friendUserName }
    const rows = await db.collection('friends')
      .find({ username }, { projection: { _id: 0, friendUserName: 1 } })
      .toArray();
    const friends = rows.map(r => r.friendUserName);
    res.json({ friends });
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});


// --- COUPONS ENDPOINTS ---
const couponsCol = () => db.collection('coupons');

// List coupons 
app.get('/coupons', async (req, res) => {
  try {
    const me = (req.query.me || req.header('x-username') || '').trim();
    if (!me) return res.status(400).json({ error: 'Provide me=<username> or x-username header' });

    const now = new Date();
    const q = {
      active: true,
      sendable: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }, { startsAt: { $exists: false } }] },
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }, { expiresAt: { $exists: false } }] }
      ],
      $or: [
        
        { private: true, owner: me },

        
        { private: { $ne: true }, usedBy: me }
      ]
    };

    const list = await db.collection('coupons')
      .find(q, { projection: { _id: 0 } })
      .toArray();

    res.json({ coupons: list });
  } catch (err) {
    console.error('Error listing coupons', err);
    res.status(500).json({ error: 'Failed to list coupons' });
  }
});



// Claim a coupon for a user

app.post('/coupons/claim', async (req, res) => {
  try {
    const { username, code } = req.body || {};
    if (!username || !code) return res.status(400).json({ error: 'username and code required' });

    const c = await db.collection('coupons').findOne({ code });
    if (!c || c.active === false) return res.status(404).json({ error: 'Coupon not found or inactive' });

    if (c.private) {
      if (c.owner !== username) return res.status(403).json({ error: 'This coupon is private to another user' });
      return res.json({ ok: true, coupon: { code: c.code, title: c.title } });
    }

    // Sendable/global path: no self-claim
    return res.status(400).json({ error: 'Self-claim is disabled. Send this coupon to a friend instead.' });
  } catch (err) {
    console.error('Error claiming coupon', err);
    res.status(500).json({ error: 'Failed to claim coupon' });
  }
});


app.get('/users/:username/coupons', async (req, res) => {
  try {
    const { username } = req.params;

    // Ensure private clones of the template coupons for this user
    await ensurePrivateGlobalCoupons(username);

    const list = await db.collection('coupons').find(
      {
        $or: [
          { private: true, owner: username },                  // my private coupons (WELCOME10-<ME>, etc.)
          { private: false, sendable: true, usedBy: username } // favorites I actually own
        ]
      },
      { projection: { _id: 0 } }
    ).toArray();

    res.json({ coupons: list });
  } catch (err) {
    console.error('Error fetching user coupons', err);
    res.status(500).json({ error: 'Failed to fetch user coupons' });
  }
});

// === COUPONS: send (gift) to a friend ===
app.post('/coupons/send', async (req, res) => {
  try {
    const { fromUsername, toUsername, code, message } = req.body || {};
    if (!fromUsername || !toUsername || !code)
      return res.status(400).json({ error: 'fromUsername, toUsername, and code are required' });
    if (fromUsername === toUsername)
      return res.status(400).json({ error: 'Cannot send a coupon to yourself' });


    // must be friends

    const isFriend = await db.collection('friends').findOne({
      username: fromUsername, friendUserName: toUsername
    });
    if (!isFriend) return res.status(403).json({ error: 'Recipient is not in your friends list' });

    const now = new Date();
    const coupon = await db.collection('coupons').findOne({ code, active: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found or inactive' });

    //allow only owner to send; recipient gets a private copy
    if (coupon.private === true) {
      if (coupon.owner !== fromUsername)
        return res.status(403).json({ error: 'Only the owner can send this coupon' });

      // Grant recipient a private, non-sendable copy
      const recipCode = `${coupon.code.replace(/-[A-Z0-9_]+$/, '')}-${toUsername.toUpperCase()}`;
      await db.collection('coupons').updateOne(
        { code: recipCode },
        {
          $setOnInsert: {
            code: recipCode,
            type: 'private',
            private: true,
            owner: toUsername,
            sendable: true, // recipient can use, not send
            title: coupon.title,
            description: coupon.description,
            discountType: coupon.discountType,
            value: coupon.value,
            restaurant: coupon.restaurant,
            active: true,
            startsAt: now,
            expiresAt: coupon.expiresAt || null
          }
        },
        { upsert: true }
      );

      await db.collection('gifts').insertOne({
        from: fromUsername, to: toUsername, code: coupon.code,
        message: (message || '').slice(0, 240), sentAt: now
      });

      return res.json({ ok: true, sentTo: toUsername, code });
    }

    //allow send only if sender actually holds it
    if (!Array.isArray(coupon.usedBy) || !coupon.usedBy.includes(fromUsername)) {
      return res.status(403).json({ error: 'You do not own this coupon' });
    }

    // deliver by adding recipient into usedBy (legacy path)
    if (coupon.usedBy.includes(toUsername))
      return res.status(400).json({ error: 'Friend already has this coupon' });

    await db.collection('coupons').updateOne(
      { code },
      { $addToSet: { usedBy: toUsername } }
    );

    await db.collection('gifts').insertOne({
      from: fromUsername, to: toUsername, code, message: (message || '').slice(0, 240), sentAt: now
    });

    res.json({ ok: true, sentTo: toUsername, code });
  } catch (err) {
    console.error('Error sending coupon:', err);
    res.status(500).json({ error: 'Failed to send coupon' });
  }
});


async function ensureFavoriteSendableCoupon(username, restaurantName) {
  const code = `FAV-${slugifyRestaurant(restaurantName)}-${String(username).toUpperCase()}`;

  await db.collection('coupons').updateOne(
    { code },
    {
      $setOnInsert: {
        code,
        type: 'favorite',
        private: true,          // <— ONLY owner can see it
        owner: username,        // <— owner
        sendable: true,         // <— BUT owner can send it
        title: `Favorite Perk: ${restaurantName}`,
        description: `Thanks for choosing ${restaurantName}! Share this perk with friends.`,
        discountType: 'percent',
        value: 15,
        restaurant: restaurantName,
        active: true,
        startsAt: new Date(),
        expiresAt: null
      }
    },
    { upsert: true }
  );
}

app.get('/users/:username/gifts/sent', async (req, res) => {
  try {
    const rows = await db.collection('gifts')
      .find({ from: req.params.username }, { projection: { _id: 0 } })
      .sort({ sentAt: -1 })
      .toArray();
    res.json({ sent: rows });
  } catch (e) {
    console.error('gifts/sent error', e);
    res.status(500).json({ error: 'Failed to fetch sent gifts' });
  }
});

app.get('/users/:username/gifts/received', async (req, res) => {
  try {
    const rows = await db.collection('gifts')
      .find({ to: req.params.username }, { projection: { _id: 0 } })
      .sort({ sentAt: -1 })
      .toArray();
    res.json({ received: rows });
  } catch (e) {
    console.error('gifts/received error', e);
    res.status(500).json({ error: 'Failed to fetch received gifts' });
  }
});


// Add friend
app.post('/friends/add', async (req, res) => {
  try {
    const { username, friend } = req.body || {};
    if (!username || !friend) return res.status(400).json({ error: 'username and friend are required' });
    if (username === friend) return res.status(400).json({ error: 'You cannot add yourself' });

    const usersCol = db.collection('users');
    const [u1, u2] = await Promise.all([
      usersCol.findOne({ username }),
      usersCol.findOne({ username: friend }),
    ]);
    if (!u1 || !u2) return res.status(404).json({ error: 'User not found' });

    const friendsCol = db.collection('friends');
    await friendsCol.createIndex({ username: 1, friendUserName: 1 }, { unique: true });

    await friendsCol.updateOne(
      { username, friendUserName: friend },
      { $setOnInsert: { username, friendUserName: friend, userId: u1.uid } },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Already friends' });
    console.error('Add friend error:', e);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Remove friend
app.delete('/friends/:username/:friend', async (req, res) => {
  try {
    const { username, friend } = req.params;
    const r = await db.collection('friends').deleteOne({ username, friendUserName: friend });
    res.json({ ok: true, removed: r.deletedCount });
  } catch (e) {
    console.error('Remove friend error:', e);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

app.get('/users/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const me = (req.query.me || '').trim(); // optional: current user
    if (q.length < 2) return res.json({ users: [] });

    // build filters
    const filters = [{ username: { $regex: `^${q}`, $options: 'i' } }];
    if (me) filters.push({ username: { $ne: me } });

    // exclude existing friends
    if (me) {
      const existing = await db.collection('friends').find({ username: me }).project({ friendUserName: 1, _id: 0 }).toArray();
      const exclude = new Set(existing.map(r => r.friendUserName));
    }

    const users = await db.collection('users')
      .find({ $and: filters })
      .project({ _id: 0, username: 1 })
      .limit(10)
      .toArray();

    res.json({ users: users.map(u => u.username) });
  } catch (e) {
    console.error('User search error:', e);
    res.status(500).json({ error: 'Search failed' });
  }
});

async function ensurePrivateGlobalCoupons(username) {
  const templates = await db.collection('coupons')
    .find({ type: 'global_template', active: true })
    .toArray();

  for (const t of templates) {
    const privateCode = `${t.code}-${String(username).toUpperCase()}`;
    await db.collection('coupons').updateOne(
      { code: privateCode },
      {
        $setOnInsert: {
          code: privateCode,
          type: 'private',
          private: true,
          owner: username,
          title: t.title,
          description: t.description,
          discountType: t.discountType,   // 'percent' | 'amount'
          value: t.value,
          restaurant: t.restaurant ?? 'Any',
          active: true,
          startsAt: new Date(),
          expiresAt: t.expiresAt || null
        }
      },
      { upsert: true }
    );
  }
}


