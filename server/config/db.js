const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log('connected to mongodb');
  } catch (err) {
    console.error('mongodb connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
