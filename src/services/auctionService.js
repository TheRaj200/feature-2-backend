const auctionRepository = require('../repositories/auctionRepository');

class AuctionService {
  async ensureInitialAuction() {
    const count = await auctionRepository.count();
    if (count === 0) {
      const now = new Date();
      // Default 10 minutes duration for new auction
      const endTime = new Date(now.getTime() + 10 * 60 * 1000);

      const defaultItem = {
        title: 'Signed Vintage 1965 Fender Stratocaster Guitar',
        description:
          'Rare vintage sunburst finish electric guitar signed by legendary rock artists during the 2024 Charity World Tour. Includes verified certificate of authenticity and custom flight case.',
        imageUrl:
          'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80',
        startingPrice: 500,
        currentHighestBid: 500,
        currentWinner: null,
        bids: [],
        startTime: now,
        endTime: endTime,
        status: 'ACTIVE',
      };

      return await auctionRepository.create(defaultItem);
    }
  }

  async getLatestAuction() {
    await this.ensureInitialAuction();
    let auction = await auctionRepository.findLatest();

    if (!auction) {
      throw new Error('No auction item found');
    }

    // Check if auction has expired in real-time
    const now = new Date();
    if (auction.status === 'ACTIVE' && new Date(auction.endTime) <= now) {
      auction = await auctionRepository.updateStatus(auction._id, 'ENDED');
    }

    return auction;
  }

  async placeBid({ auctionId, bidderName, amount }) {
    if (!bidderName || typeof bidderName !== 'string' || bidderName.trim() === '') {
      const error = new Error('Participant / Bidder name is required');
      error.statusCode = 400;
      throw error;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const error = new Error('Valid bid amount is required');
      error.statusCode = 400;
      throw error;
    }

    const auction = await auctionRepository.findById(auctionId);
    if (!auction) {
      const error = new Error('Auction item not found');
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();
    const hasEnded = auction.status === 'ENDED' || new Date(auction.endTime) <= now;

    if (hasEnded) {
      if (auction.status === 'ACTIVE') {
        await auctionRepository.updateStatus(auction._id, 'ENDED');
      }
      const error = new Error('Auction has ended. No more bids are being accepted.');
      error.statusCode = 400;
      throw error;
    }

    // Determine minimum threshold
    const hasExistingBids = auction.bids && auction.bids.length > 0;
    const currentHighest = hasExistingBids ? auction.currentHighestBid : auction.startingPrice;

    if (hasExistingBids) {
      if (numericAmount <= currentHighest) {
        const error = new Error(
          `Bid rejected: Your bid of $${numericAmount} must strictly exceed the current highest bid of $${currentHighest}.`
        );
        error.statusCode = 400;
        throw error;
      }
    } else {
      if (numericAmount < auction.startingPrice) {
        const error = new Error(
          `Bid rejected: Your bid of $${numericAmount} cannot be lower than the starting price of $${auction.startingPrice}.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const trimmedName = bidderName.trim();
    const updatedAuction = await auctionRepository.addBid(
      auction._id,
      {
        bidderName: trimmedName,
        amount: numericAmount,
      },
      numericAmount,
      trimmedName
    );

    return updatedAuction;
  }

  async resetAuction({ durationMinutes = 5, startingPrice = 500, title, description, imageUrl } = {}) {
    let auction = await auctionRepository.findLatest();
    const now = new Date();
    const duration = Math.max(1, Number(durationMinutes) || 5);
    const endTime = new Date(now.getTime() + duration * 60 * 1000);
    const price = Number(startingPrice) > 0 ? Number(startingPrice) : 500;

    const updatePayload = {
      title: title || (auction ? auction.title : 'Signed Vintage 1965 Fender Stratocaster Guitar'),
      description:
        description ||
        (auction
          ? auction.description
          : 'Rare vintage sunburst finish electric guitar signed by legendary rock artists during the 2024 Charity World Tour.'),
      imageUrl:
        imageUrl ||
        (auction && auction.imageUrl
          ? auction.imageUrl
          : 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80'),
      startingPrice: price,
      currentHighestBid: price,
      currentWinner: null,
      bids: [],
      startTime: now,
      endTime: endTime,
      status: 'ACTIVE',
    };

    if (auction) {
      return await auctionRepository.update(auction._id, updatePayload);
    } else {
      return await auctionRepository.create(updatePayload);
    }
  }
}

module.exports = new AuctionService();
