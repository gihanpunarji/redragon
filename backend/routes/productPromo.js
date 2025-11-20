const express = require('express');
const router = express.Router();

console.log('🚀 ProductPromo router loaded');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getActivePromos,
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  togglePromoActive,
  initializeTable,
  testRoute
} = require('../controllers/productPromoController');

// Test route (for checking if API is working)
router.get('/test', testRoute);

// Public routes (for customers)  
router.get('/active', getActivePromos);

// Admin routes (protected)
router.get('/admin/all', auth, adminAuth, getAllPromos);
router.get('/admin/:id', auth, adminAuth, getPromoById);
router.post('/admin/create', auth, adminAuth, createPromo);
router.put('/admin/:id', auth, adminAuth, updatePromo);
router.delete('/admin/:id', auth, adminAuth, deletePromo);
router.patch('/admin/:id/toggle', auth, adminAuth, togglePromoActive);

// Setup route (for initializing the table)
router.post('/admin/initialize', auth, adminAuth, initializeTable);

module.exports = router;