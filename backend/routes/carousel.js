const express = require('express');
const router = express.Router();
const multer = require('multer');
const carouselController = require('../controllers/carouselController');
const { adminAuth } = require('../middleware/auth');

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Get all carousel slides (public route)
router.get('/', carouselController.getAllSlides);

// Get slide by ID (public route)
router.get('/:id', carouselController.getSlideById);

// Admin routes (require authentication)
// Create new slide
router.post('/', adminAuth, upload.single('image'), carouselController.createSlide);

// Update slide
router.put('/:id', adminAuth, upload.single('image'), carouselController.updateSlide);

// Update multiple slides (for carousel management bulk update)
router.put('/', adminAuth, carouselController.updateMultipleSlides);

// Delete slide
router.delete('/:id', adminAuth, carouselController.deleteSlide);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(error);
});

module.exports = router;