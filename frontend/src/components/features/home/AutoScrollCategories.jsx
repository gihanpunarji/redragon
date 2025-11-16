import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useWindowDimensions from '../../../hooks/useWindowDimensions';

const AutoScrollCategories = ({ categories }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const { width } = useWindowDimensions();

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  // Manual scroll
  const handleManualScroll = (direction) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    setIsPaused(true);

    const scrollAmount = 250;
    if (direction === 'left') {
      scrollContainer.scrollLeft -= scrollAmount;
    } else {
      scrollContainer.scrollLeft += scrollAmount;
    }
  };

  // Continuous scrolling loop
  useEffect(() => {
    if (isPaused) return;
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrame;

    const autoScroll = () => {
      scrollContainer.scrollLeft += 1.2; // speed
      // If we reach the end of first list, snap back smoothly
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      }
      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused]);

  return (
    <div className="relative w-full px-8 overflow-visible">

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth py-8 overflow-y-visible"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowY: 'visible' }}
      >
        {/* REAL CATEGORIES LIST */}
        {categories.map((category, index) => (
          <motion.div
            key={`${category.name}-${index}`}
            className="flex-shrink-0 w-40 cursor-pointer"
            onClick={() => handleCategoryClick(category.name)}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden
        border border-white/10
        shadow-md h-44 flex flex-col relative"
              whileHover={{
                scale: 1.2,
                y: -15,
                boxShadow: "0 30px 60px rgba(239, 68, 68, 0.4)",
                borderColor: "rgb(239, 68, 68)",
              }}
              transition={{ type: "easeOut", duration: 0.25 }}
            >
              <motion.img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover absolute inset-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "easeOut", duration: 0.25 }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center min-h-14">
                <h3 className="text-sm font-bold text-white text-center uppercase tracking-wide line-clamp-2">
                  {category.name}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* GHOST COPY (INVISIBLE) - For seamless scroll */}
        {categories.map((category, index) => (
          <div key={`ghost-${index}`} className="w-40 opacity-0 pointer-events-none" />
        ))}
      </div>

      {/* Left / Right Manual Buttons */}
      <button
        onClick={() => handleManualScroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full z-20 shadow-lg focus:outline-none"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => handleManualScroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full z-20 shadow-lg focus:outline-none"
      >
        <ChevronRight size={24} />
      </button>

      {/* Fading edges */}
    </div>
  );
};

export default AutoScrollCategories;
