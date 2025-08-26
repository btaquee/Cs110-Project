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
        favRestaurant: user.favRestaurant || "",
        favCuisine: user.favCuisine || ""
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
      favRestaurant: "",
      favCuisine: "", 
    };

    //insert a new user into the database
    await db.collection("users").insertOne(newAccount);

    res.status(201).json({
      message: "Registration successful!",
      newUser: {
        username: newAccount.username,
        favRestaurant: newAccount.favRestaurant,
        favCuisine: newAccount.favCuisine
      }

    })

  } catch (err) {
        console.error("Error registering new user: ", err);
        res.status(500).json({error: "Error registering new user"}); 
      }
    });

// --- REVIEWS ENDPOINTS ---

// Get all reviews for a specific restaurant
app.get('/reviews/restaurant/:restaurantId', async (req, res) => {
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
app.get('/reviews/user/:username/restaurant/:restaurantId', async (req, res) => {
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
app.post('/reviews', async (req, res) => {
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
app.put('/reviews/:reviewId', async (req, res) => {
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
app.delete('/reviews/:reviewId', async (req, res) => {
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
app.get('/restaurants/recommendations/:restaurantId', async (req, res) => {
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
app.put('/user/update-restaurant', async (req, res) => {
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
app.put('/user/update-cuisine', async (req, res) => {
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
app.get('/friends-list/:username', async (req, res) => {
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
app.get('/user/:friend', async (req, res) => {
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