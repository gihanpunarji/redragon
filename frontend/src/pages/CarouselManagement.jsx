import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CarouselSlideEditor from '../components/features/admin/carousel/CarouselSlideEditor';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import ErrorPopup from '../components/common/ErrorPopup';
import SuccessPopup from '../components/common/SuccessPopup';
import { carouselAPI } from '../services/api';

export const CarouselManagement = () => {
  const [slides, setSlides] = useState([]);
  const [originalSlides, setOriginalSlides] = useState([]);
  const [expandedSlide, setExpandedSlide] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Load slides from API on component mount
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setIsLoading(true);
      const response = await carouselAPI.getAllSlides();
      
      if (response.data.success) {
        const slidesData = response.data.data.map(slide => ({
          id: slide.id,
          image: slide.image_path,
          title: slide.title,
          subtitle: slide.subtitle || '',
          position: 'center', // Default position
          alt: slide.alt_text || ''
        }));
        
        setSlides(slidesData);
        setOriginalSlides(JSON.parse(JSON.stringify(slidesData))); // Deep copy
      } else {
        setError('Failed to load carousel slides');
      }
    } catch (err) {
      console.error('Error fetching slides:', err);
      setError('Failed to load carousel slides. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlideChange = (slideId, field, value) => {
    setSlides(slides.map(slide =>
      slide.id === slideId ? { ...slide, [field]: value } : slide
    ));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Prepare slides data for API
      const slidesData = {
        slides: slides.map(slide => ({
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle,
          alt: slide.alt,
          image: slide.image // This will be handled by the backend if it's a data URI
        }))
      };

      const response = await carouselAPI.updateMultipleSlides(slidesData);

      if (response.data.success) {
        setSuccess('Carousel slides updated successfully!');
        setHasChanges(false);
        
        // Store current expanded slide to preserve UI state
        const currentExpandedSlide = expandedSlide;
        
        // Refresh data from server to get the latest values
        await fetchSlides();
        
        // Restore expanded slide state after data refresh
        setTimeout(() => {
          setExpandedSlide(currentExpandedSlide);
        }, 100);
      } else {
        setError(response.data.message || 'Failed to update carousel slides');
      }
    } catch (err) {
      console.error('Error saving carousel:', err);
      setError('Failed to update carousel slides. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      // Reset to original state from API
      setSlides(JSON.parse(JSON.stringify(originalSlides)));
      setHasChanges(false);
    }
  };

  const toggleSlide = (slideId) => {
    setExpandedSlide(expandedSlide === slideId ? null : slideId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-2 sm:px-4 md:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-0">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">
          Carousel Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Edit carousel slides displayed on the home page. You can customize images, titles, and subtitles for each slide.
        </p>
      </div>

      {/* Alert Box */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6 p-3 md:p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 text-sm md:text-base">Unsaved Changes</h3>
              <p className="text-xs md:text-sm text-yellow-700 mt-1">
                You have unsaved changes. Click "Save Changes" to apply them.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-6 md:mb-8">
        <motion.button
          onClick={handleSaveChanges}
          disabled={!hasChanges || isSaving}
          whileHover={!isSaving && hasChanges ? { scale: 1.02 } : {}}
          whileTap={!isSaving && hasChanges ? { scale: 0.98 } : {}}
          className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4 md:w-5 md:h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </motion.button>

        <motion.button
          onClick={handleReset}
          disabled={!hasChanges || isSaving}
          whileHover={!isSaving && hasChanges ? { scale: 1.02 } : {}}
          whileTap={!isSaving && hasChanges ? { scale: 0.98 } : {}}
          className="flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
          Reset
        </motion.button>
      </div>

      {/* Slides Container */}
      <div className="space-y-3 md:space-y-4">
        {slides.map((slide, index) => (
          <CarouselSlideEditor
            key={slide.id}
            slide={slide}
            slideNumber={index + 1}
            isExpanded={expandedSlide === slide.id}
            onToggle={() => toggleSlide(slide.id)}
            onChange={handleSlideChange}
          />
        ))}
      </div>

      <ErrorPopup message={error} onClose={() => setError(null)} />
      <SuccessPopup message={success} onClose={() => setSuccess(null)} />
    </div>
  );
};

export default CarouselManagement;
