const auctionRepository = require('../repositories/auctionRepository');

class AuctionService {
  async ensureInitialAuction() {
    const count = await auctionRepository.count();
    if (count === 0) {
      const now = new Date();
      const endTime = new Date(now.getTime() + 15 * 60 * 1000);

      const defaultItem = {
        title: 'Signed Vintage 1965 Fender Stratocaster Guitar',
        description:
          'Rare vintage sunburst finish electric guitar signed by legendary rock artists during the 2024 Charity World Tour. Includes verified certificate of authenticity and custom flight case.',
        imageUrl:
          'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80',
        startingPrice: 50000,
        currentHighestBid: 50000,
        currentWinner: null,
        bids: [],
        startTime: now,
        endTime: endTime,
        status: 'ACTIVE',
      };

      return await auctionRepository.create(defaultItem);
    }
  }

  async getAllAuctions() {
    await this.ensureInitialAuction();
    const auctions = await auctionRepository.findAll();
    const now = new Date();

    const updatedList = await Promise.all(
      auctions.map(async (item) => {
        if (item.status === 'ACTIVE' && new Date(item.endTime) <= now) {
          return await auctionRepository.updateStatus(item._id, 'ENDED');
        }
        return item;
      })
    );

    return updatedList;
  }

  async getAuctionById(id) {
    let auction = await auctionRepository.findById(id);
    if (!auction) {
      const error = new Error('Auction not found');
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();
    if (auction.status === 'ACTIVE' && new Date(auction.endTime) <= now) {
      auction = await auctionRepository.updateStatus(auction._id, 'ENDED');
    }

    return auction;
  }

  async getLatestAuction() {
    await this.ensureInitialAuction();
    let auction = await auctionRepository.findLatest();

    if (!auction) {
      throw new Error('No auction item found');
    }

    const now = new Date();
    if (auction.status === 'ACTIVE' && new Date(auction.endTime) <= now) {
      auction = await auctionRepository.updateStatus(auction._id, 'ENDED');
    }

    return auction;
  }

  async createAuction({ title, description, imageUrl, startingPrice, durationMinutes, creatorName }) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      const error = new Error('Auction item title is required');
      error.statusCode = 400;
      throw error;
    }

    const numericPrice = Number(startingPrice);
    if (isNaN(numericPrice) || numericPrice < 1) {
      const error = new Error('Valid starting price (in ₹) is required');
      error.statusCode = 400;
      throw error;
    }

    const duration = Math.max(1, Number(durationMinutes) || 10);
    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60 * 1000);

    const defaultImages = [
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
    ];

    const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const newAuction = {
      title: title.trim(),
      description:
        description && description.trim()
          ? description.trim()
          : 'Exclusive event auction lot. Transparent verified bidding.',
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : randomImage,
      startingPrice: numericPrice,
      currentHighestBid: numericPrice,
      currentWinner: null,
      bids: [],
      startTime: now,
      endTime: endTime,
      status: 'ACTIVE',
      creatorName: creatorName ? creatorName.trim() : 'Organizer',
    };

    return await auctionRepository.create(newAuction);
  }

  async placeBid({ auctionId, bidderName, amount }) {
    if (!bidderName || typeof bidderName !== 'string' || bidderName.trim() === '') {
      const error = new Error('Participant name is required');
      error.statusCode = 400;
      throw error;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const error = new Error('Valid bid amount (in ₹) is required');
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
      const error = new Error('Auction has ended. No more bids are accepted.');
      error.statusCode = 400;
      throw error;
    }

    const hasExistingBids = auction.bids && auction.bids.length > 0;
    const currentHighest = hasExistingBids ? auction.currentHighestBid : auction.startingPrice;

    if (hasExistingBids) {
      if (numericAmount <= currentHighest) {
        const error = new Error(
          `Bid rejected: Your bid of ₹${numericAmount.toLocaleString('en-IN')} must strictly exceed current highest bid of ₹${currentHighest.toLocaleString('en-IN')}.`
        );
        error.statusCode = 400;
        throw error;
      }
    } else {
      if (numericAmount < auction.startingPrice) {
        const error = new Error(
          `Bid rejected: Your bid of ₹${numericAmount.toLocaleString('en-IN')} cannot be lower than the starting price of ₹${auction.startingPrice.toLocaleString('en-IN')}.`
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

  async resetAuction({ auctionId, durationMinutes = 5, startingPrice = 50000, title, description, imageUrl } = {}) {
    let auction = auctionId
      ? await auctionRepository.findById(auctionId)
      : await auctionRepository.findLatest();

    const now = new Date();
    const duration = Math.max(1, Number(durationMinutes) || 5);
    const endTime = new Date(now.getTime() + duration * 60 * 1000);
    const price = Number(startingPrice) > 0 ? Number(startingPrice) : 50000;

    const updatePayload = {
      title: title || (auction ? auction.title : 'Signed Vintage 1965 Fender Stratocaster Guitar'),
      description:
        description ||
        (auction
          ? auction.description
          : 'Rare vintage sunburst finish electric guitar signed by legendary rock artists.'),
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
