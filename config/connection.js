const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_PORT || 'mongodb://localhost:27017';
const dbName = 'Payment-tickets';

let client = null;
let db = null;
async function connectToDatabase() {

  try {
    client = await MongoClient.connect(uri, { useNewUrlParser: true });
    console.log('Connected successfully to the database');
  } catch (err) {
    console.log(err);
    throw new Error('Unable to connect to the database');
  }
  if (!db) {
    db = client.db(dbName);
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database connection is not established');
  }

  return db;
}

module.exports = {
  connectToDatabase,
  getDatabase,
};
