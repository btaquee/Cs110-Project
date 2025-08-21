const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://clope265:Passwordiscrazyngl%23092@dineperks-project.vepzatg.mongodb.net/?retryWrites=true&w=majority&appName=DinePerks-Project';
const client = new MongoClient(url);
const dbName = 'DinePerksDB';

// Expanded data for better search examples
const restaurantsToSeed = [
    { id: 1, name: 'Sushi Place', cuisine: 'Japanese', rating: 5 },
    { id: 2, name: 'Pizza Planet', cuisine: 'Italian', rating: 4 },
    { id: 3, name: 'Taco Town', cuisine: 'Mexican', rating: 2.5 },
    { id: 4, name: 'Johns Pizza', cuisine: 'Italian', rating: 3 },
    { id: 5, name: 'Juans Mexican Food', cuisine: 'Mexican', rating: 4 },
    { id: 6, name: 'Joes Sushi', cuisine: 'Japanese', rating: 2 },
    { id: 7, name: 'Good Thai', cuisine: 'Thai', rating: 3 },
    { id: 8, name: 'Ricks Texas BBQ', cuisine: 'American', rating: 3.5 },
    { id: 9, name: 'China Town', cuisine: 'Chinese', rating: 4 },
    { id: 10, name: 'Johns Pizza', cuisine: 'American', rating: 3 }
];

const usersToSeed = [
  {uid: 100, username: 'admin123', password: 'password123', admin: true, favRestaurant: 'Pizza Planet', favCuisine: 'Italian'},
  {uid: 101, username: 'cruzl123', password: 'password321', admin: true, favRestaurant: 'Pizza Planet', favCuisine: 'Italian'},
  {uid: 102, username: 'lopez123', password: 'hello', admin: false, favRestaurant: 'Taco Town', favCuisine: 'Mexican'},
  {uid: 103, username: 'guy123', password: '12345', admin: false, favRestaurant: 'Sushi Place', favCuisine: 'Japanese'},

]

async function runSeed() {
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const restaurants = db.collection('restaurants');
    const users = db.collection('users')

    await restaurants.deleteMany({});
    await restaurants.insertMany(restaurantsToSeed);
   
    await users.deleteMany({});
    await users.insertMany(usersToSeed);

    console.log("Successfully seeded the restaurants collection.");
    console.log("Successfully seeded the users collection.");

  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

runSeed().catch(console.dir);