const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://clope265:Passwordiscrazyngl%23092@dineperks-project.vepzatg.mongodb.net/?retryWrites=true&w=majority&appName=DinePerks-Project';
const client = new MongoClient(url);
const dbName = 'DinePerksDB';

// Expanded data for better search examples
const restaurantsToSeed = [
    { 
        id: 1, 
        name: 'Sushi Place', 
        cuisine: 'Japanese', 
        rating: 5,
        address: '123 Ocean Drive, San Francisco, CA 94102',
        phone: '(415) 555-0123',
        hours: {
            monday: '11:00 AM - 10:00 PM',
            tuesday: '11:00 AM - 10:00 PM',
            wednesday: '11:00 AM - 10:00 PM',
            thursday: '11:00 AM - 10:00 PM',
            friday: '11:00 AM - 11:00 PM',
            saturday: '12:00 PM - 11:00 PM',
            sunday: '12:00 PM - 9:00 PM'
        },
        description: 'Authentic Japanese sushi and sashimi. Fresh fish daily from local markets.'
    },
    { 
        id: 2, 
        name: 'Pizza Planet', 
        cuisine: 'Italian', 
        rating: 4,
        address: '456 Main Street, San Francisco, CA 94105',
        phone: '(415) 555-0456',
        hours: {
            monday: '11:00 AM - 11:00 PM',
            tuesday: '11:00 AM - 11:00 PM',
            wednesday: '11:00 AM - 11:00 PM',
            thursday: '11:00 AM - 11:00 PM',
            friday: '11:00 AM - 12:00 AM',
            saturday: '12:00 PM - 12:00 AM',
            sunday: '12:00 PM - 10:00 PM'
        },
        description: 'Classic Italian pizzeria with wood-fired ovens and traditional recipes.'
    },
    { 
        id: 3, 
        name: 'Taco Town', 
        cuisine: 'Mexican', 
        rating: 2.5,
        address: '789 Mission Street, San Francisco, CA 94103',
        phone: '(415) 555-0789',
        hours: {
            monday: '10:00 AM - 9:00 PM',
            tuesday: '10:00 AM - 9:00 PM',
            wednesday: '10:00 AM - 9:00 PM',
            thursday: '10:00 AM - 9:00 PM',
            friday: '10:00 AM - 10:00 PM',
            saturday: '11:00 AM - 10:00 PM',
            sunday: '11:00 AM - 8:00 PM'
        },
        description: 'Authentic Mexican street tacos and traditional dishes.'
    },
    { 
        id: 4, 
        name: 'Johns Pizza', 
        cuisine: 'Italian', 
        rating: 3,
        address: '321 Market Street, San Francisco, CA 94104',
        phone: '(415) 555-0321',
        hours: {
            monday: '11:00 AM - 10:00 PM',
            tuesday: '11:00 AM - 10:00 PM',
            wednesday: '11:00 AM - 10:00 PM',
            thursday: '11:00 AM - 10:00 PM',
            friday: '11:00 AM - 11:00 PM',
            saturday: '12:00 PM - 11:00 PM',
            sunday: '12:00 PM - 9:00 PM'
        },
        description: 'Family-owned pizzeria serving New York style pizza since 1985.'
    },
    { 
        id: 5, 
        name: 'Juans Mexican Food', 
        cuisine: 'Mexican', 
        rating: 4,
        address: '654 Castro Street, San Francisco, CA 94114',
        phone: '(415) 555-0654',
        hours: {
            monday: '11:00 AM - 10:00 PM',
            tuesday: '11:00 AM - 10:00 PM',
            wednesday: '11:00 AM - 10:00 PM',
            thursday: '11:00 AM - 10:00 PM',
            friday: '11:00 AM - 11:00 PM',
            saturday: '12:00 PM - 11:00 PM',
            sunday: '12:00 PM - 9:00 PM'
        },
        description: 'Traditional Mexican cuisine with a modern twist. Famous for our mole sauce.'
    },
    { 
        id: 6, 
        name: 'Joes Sushi', 
        cuisine: 'Japanese', 
        rating: 2,
        address: '987 Geary Boulevard, San Francisco, CA 94109',
        phone: '(415) 555-0987',
        hours: {
            monday: '11:30 AM - 9:30 PM',
            tuesday: '11:30 AM - 9:30 PM',
            wednesday: '11:30 AM - 9:30 PM',
            thursday: '11:30 AM - 9:30 PM',
            friday: '11:30 AM - 10:30 PM',
            saturday: '12:00 PM - 10:30 PM',
            sunday: '12:00 PM - 8:30 PM'
        },
        description: 'Casual sushi bar with affordable prices and friendly service.'
    },
    { 
        id: 7, 
        name: 'Good Thai', 
        cuisine: 'Thai', 
        rating: 3,
        address: '147 Irving Street, San Francisco, CA 94122',
        phone: '(415) 555-0147',
        hours: {
            monday: '11:00 AM - 10:00 PM',
            tuesday: '11:00 AM - 10:00 PM',
            wednesday: '11:00 AM - 10:00 PM',
            thursday: '11:00 AM - 10:00 PM',
            friday: '11:00 AM - 11:00 PM',
            saturday: '12:00 PM - 11:00 PM',
            sunday: '12:00 PM - 9:00 PM'
        },
        description: 'Authentic Thai cuisine with spicy curries and fresh herbs.'
    },
    { 
        id: 8, 
        name: 'Ricks Texas BBQ', 
        cuisine: 'American', 
        rating: 3.5,
        address: '258 Fillmore Street, San Francisco, CA 94117',
        phone: '(415) 555-0258',
        hours: {
            monday: 'Closed',
            tuesday: '11:00 AM - 9:00 PM',
            wednesday: '11:00 AM - 9:00 PM',
            thursday: '11:00 AM - 9:00 PM',
            friday: '11:00 AM - 10:00 PM',
            saturday: '12:00 PM - 10:00 PM',
            sunday: '12:00 PM - 8:00 PM'
        },
        description: 'Texas-style barbecue with slow-smoked meats and homemade sides.'
    },
    { 
        id: 9, 
        name: 'China Town', 
        cuisine: 'Chinese', 
        rating: 4,
        address: '369 Grant Avenue, San Francisco, CA 94108',
        phone: '(415) 555-0369',
        hours: {
            monday: '10:00 AM - 10:00 PM',
            tuesday: '10:00 AM - 10:00 PM',
            wednesday: '10:00 AM - 10:00 PM',
            thursday: '10:00 AM - 10:00 PM',
            friday: '10:00 AM - 11:00 PM',
            saturday: '10:00 AM - 11:00 PM',
            sunday: '10:00 AM - 9:00 PM'
        },
        description: 'Traditional Chinese cuisine in the heart of Chinatown.'
    },
    { 
        id: 10, 
        name: 'Johns Pizza', 
        cuisine: 'American', 
        rating: 3,
        address: '741 Polk Street, San Francisco, CA 94109',
        phone: '(415) 555-0741',
        hours: {
            monday: '11:00 AM - 10:00 PM',
            tuesday: '11:00 AM - 10:00 PM',
            wednesday: '11:00 AM - 10:00 PM',
            thursday: '11:00 AM - 10:00 PM',
            friday: '11:00 AM - 11:00 PM',
            saturday: '12:00 PM - 11:00 PM',
            sunday: '12:00 PM - 9:00 PM'
        },
        description: 'American-style pizza with creative toppings and craft beer selection.'
    }
];

const usersToSeed = [
  {uid: 100, username: 'admin123', password: 'password123', admin: true, favRestaurant: 'Pizza Planet', favCuisine: 'Italian'},
  {uid: 101, username: 'cruzl123', password: 'password321', admin: true, favRestaurant: 'Pizza Planet', favCuisine: 'Italian'},
  {uid: 102, username: 'lopez123', password: 'hello', admin: false, favRestaurant: 'Taco Town', favCuisine: 'Mexican'},
  {uid: 103, username: 'guy123', password: '12345', admin: false, favRestaurant: 'Sushi Place', favCuisine: 'Japanese'},

]

// Sample reviews data
const reviewsToSeed = [
  {
    reviewId: 1,
    restaurantId: 1, // Sushi Place
    restaurantName: 'Sushi Place',
    username: 'admin123',
    rating: 5,
    comment: 'Amazing sushi! Fresh and delicious.',
    dateCreated: new Date('2024-01-15')
  },
  {
    reviewId: 2,
    restaurantId: 1, // Sushi Place
    restaurantName: 'Sushi Place',
    username: 'lopez123',
    rating: 4,
    comment: 'Great quality, but a bit expensive.',
    dateCreated: new Date('2024-01-20')
  },
  {
    reviewId: 3,
    restaurantId: 2, // Pizza Planet
    restaurantName: 'Pizza Planet',
    username: 'cruzl123',
    rating: 5,
    comment: 'Best pizza in town!',
    dateCreated: new Date('2024-01-10')
  },
  {
    reviewId: 4,
    restaurantId: 2, // Pizza Planet
    restaurantName: 'Pizza Planet',
    username: 'guy123',
    rating: 3,
    comment: 'Good pizza, but service was slow.',
    dateCreated: new Date('2024-01-25')
  }
];

const friendsToSeed = [
    {
    userId: 101, 
    username: 'cruzl123',
    friendUserName:'lopez123'
    },

    {
    userId: 101, 
    username: 'cruzl123',
    friendUserName:'guy123'
    },

    {
    userId: 101, 
    username: 'cruzl123',
    friendUserName:'admin123'
    },

    {
    userId: 100, 
    username: 'admin123',
    friendUserName:'cruzl123'
    },

    {
    userId: 102, 
    username: 'lopez123',
    friendUserName:'guy123'
    }

];


async function runSeed() {
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const restaurants = db.collection('restaurants');
    const users = db.collection('users');
    const reviews = db.collection('reviews');
    const friends = db.collection('friends');

    await db.collection('coupons').deleteMany({});
    await db.collection('gifts').deleteMany({});


    await restaurants.deleteMany({});
    await restaurants.insertMany(restaurantsToSeed);
   
    await users.deleteMany({});
    await users.insertMany(usersToSeed);

    await reviews.deleteMany({});
    await reviews.insertMany(reviewsToSeed);

    await friends.deleteMany({});
    await friends.insertMany(friendsToSeed);

    await db.collection('coupons').deleteMany({});
    await db.collection('coupons').insertMany([
  {
    code: 'WELCOME10',
    type: 'global_template', 
    title: 'Welcome 10% Off',
    description: 'New users get 10% off any restaurant.',
    discountType: 'percent',
    value: 10,
    restaurant: 'Any',     // global
    active: true,
    expiresAt: null,
    usageLimit: 100,
    usedBy: []
  },
  {
    code: 'PIZZA5',
    type: 'global_template',
    title: 'Pizza Planet $5 Off',
    description: 'Save $5 at Pizza Planet.',
    discountType: 'amount',
    value: 5,
    restaurant: 'Pizza Planet',
    active: true,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    usageLimit: 100,
    usedBy: []
  }
]);

    console.log("Successfully seeded the restaurants collection.");
    console.log("Successfully seeded the users collection.");
    console.log("Successfully seeded the reviews collection.");
    console.log("Successfully seeded the friends collection.");

  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

runSeed().catch(console.dir);