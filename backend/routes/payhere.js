const express = require('express');
const router = express.Router();
const payhereController = require('../controllers/payhereController');

// No auth required for generate-hash - supports guest checkout
router.post('/generate-hash', payhereController.generateHash);

router.post('/notify', payhereController.handleNotification);

module.exports = router;