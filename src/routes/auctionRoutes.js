const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.get('/', (req, res) => auctionController.getAuction(req, res));
router.post('/bid', (req, res) => auctionController.placeBid(req, res));
router.post('/reset', (req, res) => auctionController.resetAuction(req, res));

module.exports = router;
