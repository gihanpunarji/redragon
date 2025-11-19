const ProductPromo = require('../models/ProductPromo');

// Get active promotional messages for customers
exports.getActivePromos = async (req, res) => {
  try {
    const promos = await ProductPromo.getActive();
    
    res.status(200).json({
      success: true,
      message: 'Active promotional messages retrieved successfully',
      data: promos
    });
  } catch (error) {
    console.error('Get active promos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promotional messages',
      error: error.message
    });
  }
};

// Get all promotional messages for admin
exports.getAllPromos = async (req, res) => {
  try {
    const promos = await ProductPromo.getAll();
    
    res.status(200).json({
      success: true,
      message: 'All promotional messages retrieved successfully',
      data: promos
    });
  } catch (error) {
    console.error('Get all promos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promotional messages',
      error: error.message
    });
  }
};

// Get promotional message by ID
exports.getPromoById = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await ProductPromo.getById(id);
    
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promotional message not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Promotional message retrieved successfully',
      data: promo
    });
  } catch (error) {
    console.error('Get promo by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promotional message',
      error: error.message
    });
  }
};

// Create new promotional message
exports.createPromo = async (req, res) => {
  try {
    const promoData = req.body;
    
    // Validate required fields
    if (!promoData.message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const result = await ProductPromo.create(promoData);
    
    res.status(201).json({
      success: true,
      message: 'Promotional message created successfully',
      data: {
        id: result.insertId,
        ...promoData
      }
    });
  } catch (error) {
    console.error('Create promo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotional message',
      error: error.message
    });
  }
};

// Update promotional message
exports.updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const promoData = req.body;
    
    // Check if promo exists
    const existingPromo = await ProductPromo.getById(id);
    if (!existingPromo) {
      return res.status(404).json({
        success: false,
        message: 'Promotional message not found'
      });
    }
    
    // Validate required fields
    if (!promoData.message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    await ProductPromo.update(id, promoData);
    
    res.status(200).json({
      success: true,
      message: 'Promotional message updated successfully',
      data: {
        id: parseInt(id),
        ...promoData
      }
    });
  } catch (error) {
    console.error('Update promo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotional message',
      error: error.message
    });
  }
};

// Delete promotional message
exports.deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if promo exists
    const existingPromo = await ProductPromo.getById(id);
    if (!existingPromo) {
      return res.status(404).json({
        success: false,
        message: 'Promotional message not found'
      });
    }
    
    await ProductPromo.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Promotional message deleted successfully'
    });
  } catch (error) {
    console.error('Delete promo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promotional message',
      error: error.message
    });
  }
};

// Toggle promotional message active status
exports.togglePromoActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    // Check if promo exists
    const existingPromo = await ProductPromo.getById(id);
    if (!existingPromo) {
      return res.status(404).json({
        success: false,
        message: 'Promotional message not found'
      });
    }
    
    await ProductPromo.toggleActive(id, is_active);
    
    res.status(200).json({
      success: true,
      message: `Promotional message ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle promo active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotional message status',
      error: error.message
    });
  }
};

// Initialize promotional messages table (for setup)
exports.initializeTable = async (req, res) => {
  try {
    await ProductPromo.createTable();
    
    res.status(200).json({
      success: true,
      message: 'Product promotional messages table created successfully'
    });
  } catch (error) {
    console.error('Initialize table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotional messages table',
      error: error.message
    });
  }
};