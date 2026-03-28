const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[DB] Connected to MongoDB Atlas");
  } catch (err) {
    console.error("[DB ERROR] Connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
