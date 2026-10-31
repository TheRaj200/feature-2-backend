require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const auctionRoutes = require('./routes/auctionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auction', auctionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Event Auction API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Event Auction Backend running on port ${PORT}`);
});
