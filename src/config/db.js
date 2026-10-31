const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_auction';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Notice] MongoDB connection failed (${error.message}).`);
    console.warn(`[Database Notice] Operating in fallback memory mode. To connect to MongoDB Atlas, add your connection string in backend/.env`);
  }
};

module.exports = connectDB;
