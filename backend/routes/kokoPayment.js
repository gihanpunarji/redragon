const express = require('express');
const router = express.Router();
const kokoPaymentController = require('../controllers/kokoPaymentController');
const { auth } = require('../middleware/auth');

// @route   POST /api/payment/koko/create
// @desc    Create Koko payment order
// @access  Private (Authenticated users only)
router.post('/create', auth, kokoPaymentController.createOrder);

// @route   POST /api/payment/koko/response
// @desc    Handle Koko payment response callback (webhook)
// @access  Public (Koko servers call this)
router.post('/response', kokoPaymentController.handleResponse);

// @route   GET /api/payment/koko/return
// @desc    Handle Koko payment return URL
// @access  Public
router.get('/return', kokoPaymentController.handleReturn);

// @route   GET /api/payment/koko/cancel
// @desc    Handle Koko payment cancel URL
// @access  Public
router.get('/cancel', kokoPaymentController.handleCancel);

// @route   POST /api/payment/koko/check-status
// @desc    Check Koko payment status
// @access  Private (Authenticated users only)
router.post('/check-status', auth, kokoPaymentController.checkStatus);

module.exports = router;
