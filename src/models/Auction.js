const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidderName: {
    type: String,
    required: [true, 'Bidder name is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [1, 'Bid amount must be positive'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Starting price cannot be negative'],
    },
    currentHighestBid: {
      type: Number,
      default: function () {
        return this.startingPrice || 0;
      },
    },
    currentWinner: {
      bidderName: { type: String, default: null },
      bidAmount: { type: Number, default: 0 },
    },
    bids: [bidSchema],
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, 'Auction end time is required'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ENDED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;
