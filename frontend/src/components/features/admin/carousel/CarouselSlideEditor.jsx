import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Upload, X } from 'lucide-react';

const CarouselSlideEditor = ({ slide, slideNumber, isExpanded, onToggle, onChange }) => {
  const [imagePreview, setImagePreview] = useState(slide.image);

  // Update imagePreview when slide.image changes (e.g., after data refresh)
  useEffect(() => {
    setImagePreview(slide.image);
  }, [slide.image]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        onChange(slide.id, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    onChange(slide.id, 'image', '');
  };

  return (
    <motion.div
      layout
      className="bg-blue-50 rounded-xl md:rounded-2xl shadow-lg overflow-hidden border-2 border-blue-100"
    >
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          {/* Slide Preview Thumbnail */}
          <div className="w-12 h-12 md:w-16 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-300">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={`Slide ${slideNumber}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span className="text-xs text-gray-600">No image</span>
              </div>
            )}
          </div>

          {/* Slide Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-bold text-gray-900 truncate">
              Slide {slideNumber}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 truncate line-clamp-1">
              {slide.title || 'No title'}
            </p>
          </div>
        </div>

        {/* Chevron Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t-2 border-blue-100 overflow-hidden"
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-white">
              {/* Image Section */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-900 mb-3">
                  Slide Image
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Image Preview */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs md:text-sm font-medium text-gray-700">
                      Current Image
                    </label>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt={`Slide ${slideNumber}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-sm text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs md:text-sm font-medium text-gray-700">
                      Upload New Image
                    </label>
                    <label className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto text-blue-500 mb-2" />
                        <span className="text-xs md:text-sm font-medium text-blue-700">
                          Click to upload
                        </span>
                        <span className="text-xs text-gray-500 block">
                          Recommended: 1920x1080px
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Text Content Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-900 mb-3">
                    Text Content
                  </label>

                  {/* Title Field */}
                  <div className="mb-4">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      Heading (Main Title)
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => onChange(slide.id, 'title', e.target.value)}
                      placeholder="Enter main heading"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-800 bg-blue-50 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-colors"
                      maxLength="60"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Character count: {slide.title.length}/60
                    </p>
                  </div>

                  {/* Subtitle Field */}
                  <div className="mb-4">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      Subtitle (Supporting Text)
                    </label>
                    <textarea
                      value={slide.subtitle}
                      onChange={(e) => onChange(slide.id, 'subtitle', e.target.value)}
                      placeholder="Enter supporting text"
                      rows="2"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-800 bg-blue-50 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                      maxLength="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Character count: {slide.subtitle.length}/100
                    </p>
                  </div>

                  {/* Alt Text Field */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      Alt Text (for accessibility)
                    </label>
                    <textarea
                      value={slide.alt}
                      onChange={(e) => onChange(slide.id, 'alt', e.target.value)}
                      placeholder="Describe the image for screen readers"
                      rows="2"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-800 bg-blue-50 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                      maxLength="150"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Character count: {slide.alt.length}/150
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-900 mb-3">
                  Live Preview
                </label>
                <div className="relative w-full h-40 md:h-56 rounded-lg overflow-hidden bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${imagePreview || '/images/slider_images/1.jpg'})` }}>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center p-4">
                    <div>
                      <h3 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg mb-2 line-clamp-2">
                        {slide.title || 'Your heading here'}
                      </h3>
                      <p className="text-sm md:text-base text-gray-200 drop-shadow-md line-clamp-2">
                        {slide.subtitle || 'Your subtitle here'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CarouselSlideEditor;
