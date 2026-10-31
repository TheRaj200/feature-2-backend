const auctionService = require('../services/auctionService');

class AuctionController {
  async getAuction(req, res) {
    try {
      const auction = await auctionService.getLatestAuction();
      return res.status(200).json({
        success: true,
        data: auction,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal server error while fetching auction',
      });
    }
  }

  async placeBid(req, res) {
    try {
      const { auctionId, bidderName, amount } = req.body;

      if (!auctionId) {
        return res.status(400).json({
          success: false,
          message: 'Auction ID is required',
        });
      }

      if (!bidderName || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Bidder name and bid amount are both required',
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
      const { durationMinutes, startingPrice, title, description, imageUrl } = req.body;
      const resetItem = await auctionService.resetAuction({
        durationMinutes,
        startingPrice,
        title,
        description,
        imageUrl,
      });

      return res.status(200).json({
        success: true,
        message: 'Auction timer and state reset successfully',
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
