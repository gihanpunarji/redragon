import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CarouselSlideEditor from '../components/features/admin/carousel/CarouselSlideEditor';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import ErrorPopup from '../components/common/ErrorPopup';
import SuccessPopup from '../components/common/SuccessPopup';

export const CarouselManagement = () => {
  const [slides, setSlides] = useState([
    {
      id: 1,
      image: '/images/slider_images/1.jpg',
      title: 'Ultimate Gaming Experience',
      subtitle: 'High-performance PCs for the dedicated gamer.',
      position: 'center',
      alt: 'Redragon gaming setup with high-performance gaming PC and peripherals'
    },
    {
      id: 2,
      image: '/images/slider_images/2.jpg',
      title: 'Precision Engineered Keyboards',
      subtitle: 'Mechanical keyboards for unmatched speed and accuracy.',
      position: 'center',
      alt: 'Redragon mechanical gaming keyboard with RGB lighting and precision keys'
    },
    {
      id: 3,
      image: '/images/slider_images/3.jpg',
      title: 'Crystal Clear Audio',
      subtitle: 'Immersive headsets to hear every detail.',
      position: 'center',
      alt: 'Redragon gaming headset with crystal clear audio and noise cancellation'
    },
    {
      id: 4,
      image: '/images/slider_images/4.jpg',
      title: 'Next-Gen Graphics Cards',
      subtitle: 'Experience games in stunning 8K resolution.',
      position: 'center',
      alt: 'High-end graphics cards for 8K gaming resolution and performance'
    },
    {
      id: 5,
      image: '/images/slider_images/5.jpg',
      title: 'Ergonomic Gaming Mice',
      subtitle: 'Designed for comfort and precision in the heat of battle.',
      position: 'center',
      alt: 'Redragon ergonomic gaming mouse with precision sensors and RGB lighting'
    },
    {
      id: 6,
      image: '/images/slider_images/6.jpg',
      title: 'Custom PC Builds',
      subtitle: 'Tailor-made systems to match your gaming style.',
      position: 'center',
      alt: 'Custom built gaming PC with high-performance components and RGB lighting'
    },
    {
      id: 7,
      image: '/images/slider_images/7.jpg',
      title: 'Liquid Cooling Solutions',
      subtitle: 'Keep your system cool under pressure for maximum performance.',
      position: 'center',
      alt: 'Advanced liquid cooling system for gaming PCs with optimal temperature control'
    }
  ]);

  const [expandedSlide, setExpandedSlide] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSlideChange = (slideId, field, value) => {
    setSlides(slides.map(slide =>
      slide.id === slideId ? { ...slide, [field]: value } : slide
    ));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await carouselApi.updateSlides(slides);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess('Carousel slides updated successfully!');
      setHasChanges(false);
    } catch (err) {
      setError('Failed to update carousel slides. Please try again.');
      console.error('Error saving carousel:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      // Reset to original state from API or localStorage
      setHasChanges(false);
    }
  };

  const toggleSlide = (slideId) => {
    setExpandedSlide(expandedSlide === slideId ? null : slideId);
  };

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
