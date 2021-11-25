require('dotenv').config();
const { MongoClient } = require('mongodb');
const database =  "pincodez";
const client = new MongoClient(process.env.MONGO_URL);

async function dbConnect() {
    const result = await client.connect();
    const db = result.db(database);
    return db.collection('pin_list');
}

module.exports = dbConnect;
