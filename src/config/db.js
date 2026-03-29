const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`[DB] Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', err => {
      console.error(`[DB ERROR] Runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB WARNING] Mongoose disconnected');
    });

  } catch (err) {
    console.error("[DB ERROR] Initial connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
