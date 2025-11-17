import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import { EffectFade, Autoplay, Navigation } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import CustomPagination from './CustomPagination';
import { carouselAPI } from '../../../services/api';


const FullScreenCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch slides from API on component mount
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await carouselAPI.getAllSlides();
      
      if (response.data.success) {
        const slidesData = response.data.data.map(slide => ({
          id: slide.id,
          image: slide.image_path,
          title: slide.title,
          subtitle: slide.subtitle || '',
          position: 'center',
          alt: slide.alt_text || slide.title
        }));
        
        setSlides(slidesData);
      } else {
        console.error('Failed to load carousel slides');
        // Fallback to empty array
        setSlides([]);
      }
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
      // Fallback to empty array
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show fallback if no slides
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Welcome to Redragon</h2>
          <p className="text-xl">Gaming gear that elevates your experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <Swiper
        spaceBetween={30}
        effect={'fade'}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        navigation={true}
        modules={[EffectFade, Autoplay, Navigation]}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full fullscreen-carousel"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
                <AnimatePresence>
                  {index === activeIndex && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="max-w-2xl p-8"
                    >
                      <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl font-semibold mt-4 text-gray-300 drop-shadow-md">
                        {slide.subtitle}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <CustomPagination slides={slides} activeIndex={activeIndex} />
    </div>
  );
};

export default FullScreenCarousel;