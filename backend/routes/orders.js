const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrderById);
router.get('/public/status/:orderId', orderController.checkOrderStatus);
router.get('/admin/all', adminAuth, orderController.getAllOrdersForAdmin);
router.get('/admin/:id', adminAuth, orderController.getOrderByIdForAdmin);
router.put('/admin/:id/status', adminAuth, orderController.updateOrderStatus);
router.put('/admin/:id/payment', adminAuth, orderController.updatePaymentStatus);

// @route   POST /api/orders/admin/cleanup-pending
// @desc    Cleanup old pending orders
// @access  Admin
router.post('/admin/cleanup-pending', adminAuth, orderController.cleanupPendingOrders);

module.exports = router;