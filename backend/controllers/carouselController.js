const CarouselSlide = require('../models/CarouselSlide');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Get all carousel slides
exports.getAllSlides = async (req, res) => {
  try {
    const slides = await CarouselSlide.getAll();
    
    res.json({
      success: true,
      message: 'Carousel slides retrieved successfully',
      data: slides
    });
  } catch (error) {
    console.error('Get carousel slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get slide by ID
exports.getSlideById = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await CarouselSlide.getById(id);
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Carousel slide not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Carousel slide retrieved successfully',
      data: slide
    });
  } catch (error) {
    console.error('Get carousel slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Create new slide
exports.createSlide = async (req, res) => {
  try {
    const { title, subtitle, alt_text, slide_order } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    let imageUrl = null;
    
    // Handle image upload to Cloudinary
    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const cloudinaryResult = await uploadToCloudinary(dataURI, 'redragon-carousel');
      imageUrl = cloudinaryResult.url;
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload carousel image'
      });
    }

    // Get next order if not provided
    const order = slide_order || await CarouselSlide.getNextOrder();

    const slideData = {
      slide_order: order,
      image_path: imageUrl,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      alt_text: alt_text ? alt_text.trim() : null
    };

    const newSlide = await CarouselSlide.create(slideData);
    
    res.status(201).json({
      success: true,
      message: 'Carousel slide created successfully',
      data: newSlide
    });
  } catch (error) {
    console.error('Create carousel slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update slide
exports.updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, alt_text, slide_order } = req.body;
    
    // Check if slide exists
    const existingSlide = await CarouselSlide.getById(id);
    if (!existingSlide) {
      return res.status(404).json({
        success: false,
        message: 'Carousel slide not found'
      });
    }

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    let imageUrl = existingSlide.image_path;
    
    // Handle image upload to Cloudinary if provided
    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const cloudinaryResult = await uploadToCloudinary(dataURI, 'redragon-carousel');
        imageUrl = cloudinaryResult.url;
        
        // TODO: Delete old image from Cloudinary if it exists
        // This would require storing the public_id in the database
        
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload carousel image'
        });
      }
    }

    const slideData = {
      slide_order: slide_order || existingSlide.slide_order,
      image_path: imageUrl,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      alt_text: alt_text ? alt_text.trim() : null
    };

    const updatedSlide = await CarouselSlide.update(id, slideData);
    
    res.json({
      success: true,
      message: 'Carousel slide updated successfully',
      data: updatedSlide
    });
  } catch (error) {
    console.error('Update carousel slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update multiple slides (bulk update for carousel management)
exports.updateMultipleSlides = async (req, res) => {
  try {
    const { slides } = req.body;
    
    if (!Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Slides array is required'
      });
    }

    // Process each slide and handle image uploads
    const processedSlides = [];
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Validation
      if (!slide.title || slide.title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `Title is required for slide ${i + 1}`
        });
      }

      let imageUrl = slide.image_path;
      
      // If updating an existing slide, get current image path
      if (slide.id) {
        const existingSlide = await CarouselSlide.getById(slide.id);
        if (existingSlide) {
          imageUrl = existingSlide.image_path;
        }
      }
      
      // Handle base64 image upload if it's a data URI
      if (slide.image && slide.image.startsWith('data:')) {
        try {
          const cloudinaryResult = await uploadToCloudinary(slide.image, 'redragon-carousel');
          imageUrl = cloudinaryResult.url;
        } catch (uploadError) {
          console.error('Image upload error for slide', i + 1, ':', uploadError);
          return res.status(500).json({
            success: false,
            message: `Failed to upload image for slide ${i + 1}`
          });
        }
      }

      processedSlides.push({
        id: slide.id || null,
        slide_order: i + 1, // Use array index + 1 as order
        image_path: imageUrl,
        title: slide.title.trim(),
        subtitle: slide.subtitle ? slide.subtitle.trim() : null,
        alt_text: slide.alt ? slide.alt.trim() : null
      });
    }

    const updatedSlides = await CarouselSlide.updateMultiple(processedSlides);
    
    res.json({
      success: true,
      message: 'Carousel slides updated successfully',
      data: updatedSlides
    });
  } catch (error) {
    console.error('Update multiple slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete slide
exports.deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if slide exists
    const existingSlide = await CarouselSlide.getById(id);
    if (!existingSlide) {
      return res.status(404).json({
        success: false,
        message: 'Carousel slide not found'
      });
    }

    const deleted = await CarouselSlide.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete carousel slide'
      });
    }
    
    res.json({
      success: true,
      message: 'Carousel slide deleted successfully'
    });
  } catch (error) {
    console.error('Delete carousel slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};