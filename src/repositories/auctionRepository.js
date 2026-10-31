const mongoose = require('mongoose');
const Auction = require('../models/Auction');

class AuctionRepository {
  constructor() {
    this.memoryItems = [];
  }

  isMongoConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  async findLatest() {
    if (this.isMongoConnected()) {
      return await Auction.findOne().sort({ createdAt: -1 });
    }
    return this.memoryItems.length > 0
      ? this.memoryItems[this.memoryItems.length - 1]
      : null;
  }

  async findById(id) {
    if (this.isMongoConnected()) {
      return await Auction.findById(id);
    }
    return this.memoryItems.find((item) => String(item._id) === String(id)) || null;
  }

  async create(data) {
    if (this.isMongoConnected()) {
      return await Auction.create(data);
    }
    const newItem = {
      _id: 'mock_' + Date.now(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memoryItems.push(newItem);
    return newItem;
  }

  async count() {
    if (this.isMongoConnected()) {
      return await Auction.countDocuments();
    }
    return this.memoryItems.length;
  }

  async addBid(id, bid, highestAmount, bidderName) {
    if (this.isMongoConnected()) {
      return await Auction.findByIdAndUpdate(
        id,
        {
          $push: { bids: { ...bid, timestamp: new Date() } },
          $set: {
            currentHighestBid: highestAmount,
            currentWinner: {
              bidderName,
              bidAmount: highestAmount,
            },
          },
        },
        { new: true, runValidators: true }
      );
    }

    const item = this.memoryItems.find((i) => String(i._id) === String(id));
    if (!item) return null;

    item.bids.push({
      _id: 'bid_' + Date.now(),
      ...bid,
      timestamp: new Date().toISOString(),
    });
    item.currentHighestBid = highestAmount;
    item.currentWinner = {
      bidderName,
      bidAmount: highestAmount,
    };
    item.updatedAt = new Date();
    return item;
  }

  async updateStatus(id, status) {
    if (this.isMongoConnected()) {
      return await Auction.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      );
    }
    const item = this.memoryItems.find((i) => String(i._id) === String(id));
    if (item) {
      item.status = status;
      item.updatedAt = new Date();
    }
    return item;
  }

  async update(id, updateData) {
    if (this.isMongoConnected()) {
      return await Auction.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }
    const index = this.memoryItems.findIndex((i) => String(i._id) === String(id));
    if (index !== -1) {
      this.memoryItems[index] = {
        ...this.memoryItems[index],
        ...updateData,
        updatedAt: new Date(),
      };
      return this.memoryItems[index];
    }
    return null;
  }
}

module.exports = new AuctionRepository();
