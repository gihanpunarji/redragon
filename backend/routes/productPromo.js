const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getActivePromos,
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  togglePromoActive,
  initializeTable
} = require('../controllers/productPromoController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Product promo routes are working', timestamp: new Date() });
});

// Public routes (for customers)  
router.get('/active', getActivePromos);

// Admin routes (protected)
router.get('/admin/all', adminAuth, getAllPromos);
router.get('/admin/:id', adminAuth, getPromoById);
router.post('/admin/create', adminAuth, createPromo);
router.put('/admin/:id', adminAuth, updatePromo);
router.delete('/admin/:id', adminAuth, deletePromo);
router.patch('/admin/:id/toggle', adminAuth, togglePromoActive);

// Setup route (for initializing the table)
router.post('/admin/initialize', adminAuth, initializeTable);

module.exports = router;