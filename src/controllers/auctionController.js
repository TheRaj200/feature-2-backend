const auctionService = require('../services/auctionService');

class AuctionController {
  async getAllAuctions(req, res) {
    try {
      const auctions = await auctionService.getAllAuctions();
      return res.status(200).json({
        success: true,
        data: auctions,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching auctions',
      });
    }
  }

  async getAuction(req, res) {
    try {
      const { id } = req.params;
      const auction = id
        ? await auctionService.getAuctionById(id)
        : await auctionService.getLatestAuction();

      return res.status(200).json({
        success: true,
        data: auction,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error fetching auction',
      });
    }
  }

  async createAuction(req, res) {
    try {
      const { title, description, imageUrl, startingPrice, durationMinutes, creatorName } =
        req.body;

      if (!title || !startingPrice) {
        return res.status(400).json({
          success: false,
          message: 'Title and starting price in ₹ are required',
        });
      }

      const newAuction = await auctionService.createAuction({
        title,
        description,
        imageUrl,
        startingPrice,
        durationMinutes,
        creatorName,
      });

      return res.status(201).json({
        success: true,
        message: 'New auction created successfully!',
        data: newAuction,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error creating auction',
      });
    }
  }

  async placeBid(req, res) {
    try {
      const auctionId = req.params.id || req.body.auctionId;
      const { bidderName, amount } = req.body;

      if (!auctionId) {
        return res.status(400).json({
          success: false,
          message: 'Auction ID is required',
        });
      }

      if (!bidderName || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Bidder name and bid amount in ₹ are required',
        });
      }

      const updatedAuction = await auctionService.placeBid({
        auctionId,
        bidderName,
        amount,
      });

      return res.status(200).json({
        success: true,
        message: 'Bid successfully placed!',
        data: updatedAuction,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error occurred while placing bid',
      });
    }
  }

  async resetAuction(req, res) {
    try {
      const auctionId = req.params.id || req.body.auctionId;
      const { durationMinutes, startingPrice, title, description, imageUrl } = req.body;

      const resetItem = await auctionService.resetAuction({
        auctionId,
        durationMinutes,
        startingPrice,
        title,
        description,
        imageUrl,
      });

      return res.status(200).json({
        success: true,
        message: 'Auction timer reset successfully',
        data: resetItem,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error occurred while resetting auction',
      });
    }
  }
}

module.exports = new AuctionController();
