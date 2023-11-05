const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_PORT || 'mongodb://localhost:27017';
const dbName = 'Payment-tickets';

let client = null;

async function connectToDatabase() {
  if (client && client.isConnected()) {
    return; // Database connection is already established
  }

  try {
    client = await MongoClient.connect(uri, { useNewUrlParser: true });
    console.log('Connected successfully to the database');
  } catch (err) {
    console.log(err);
    throw new Error('Unable to connect to the database');
  }
}

function getDatabase() {
  if (!client || !client.isConnected()) {
    throw new Error('Database connection is not established');
  }

  return client.db(dbName);
}

module.exports = {
  connectToDatabase,
  getDatabase,
};
