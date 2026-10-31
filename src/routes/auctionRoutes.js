const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// List all auctions
router.get('/', (req, res) => auctionController.getAllAuctions(req, res));

// Get single / latest auction
router.get('/latest', (req, res) => auctionController.getAuction(req, res));
router.get('/:id', (req, res) => auctionController.getAuction(req, res));

// Create a new auction
router.post('/', (req, res) => auctionController.createAuction(req, res));

// Place bids (supports both /bid with body auctionId or /:id/bid)
router.post('/bid', (req, res) => auctionController.placeBid(req, res));
router.post('/:id/bid', (req, res) => auctionController.placeBid(req, res));

// Reset auction timer
router.post('/reset', (req, res) => auctionController.resetAuction(req, res));
router.post('/:id/reset', (req, res) => auctionController.resetAuction(req, res));

module.exports = router;
