import React, { useEffect, useRef, useState, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import ProductCard from '../../common/ProductCard.jsx';

const AutoScrollProducts = memo(({ products, bg_color }) => {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const manualScrollTimeout = useRef(null);
  const { width } = useWindowDimensions();

  const { cardWidth, gap } = useMemo(() => ({
    cardWidth: width < 768 ? 160 : 300,
    gap: width < 768 ? 16 : 24
  }), [width]);

  // Manual scroll functions
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = (cardWidth + gap) * 2; // Scroll 2 items at a time
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollRef.current.style.scrollBehavior = 'smooth';
    scrollRef.current.scrollLeft = newScrollLeft;
  };

  const handleWheel = (e) => {
    if (isMouseOver) {
      // Don't prevent default to avoid console warnings
      // Just scroll horizontally
      const direction = e.deltaY > 0 ? 'right' : 'left';
      scroll(direction);
    }
  };

  // Handle manual scrolling detection
  const handleScroll = () => {
    setIsManualScrolling(true);
    setIsPaused(true);
    
    // Clear existing timeout
    if (manualScrollTimeout.current) {
      clearTimeout(manualScrollTimeout.current);
    }
    
    // Resume auto-scroll after user stops scrolling
    manualScrollTimeout.current = setTimeout(() => {
      setIsManualScrolling(false);
      setIsPaused(false);
    }, 3000); // Resume after 3 seconds of no scrolling
  };

  useEffect(() => {
    if (isPaused || isManualScrolling || products.length === 0) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const itemWidth = cardWidth + gap;

    let timeout;
    let scrollTimeout;

    const scrollToNext = () => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= products.length) {
          setTimeout(() => {
            if (scrollContainer) {
            
              scrollContainer.style.scrollBehavior = 'auto';
              scrollContainer.scrollLeft = 0;
              setTimeout(() => {
                scrollContainer.style.scrollBehavior = 'smooth';
              }, 50);
            }
          }, 0);
          return 0;
        }

        return nextIndex;
      });
    };

    scrollTimeout = setTimeout(() => {
      if (scrollContainer) {
        scrollContainer.style.scrollBehavior = 'smooth';
        scrollContainer.scrollLeft = currentIndex * itemWidth;
      }

      timeout = setTimeout(scrollToNext, 2000);
    }, 100);

    return () => {
      clearTimeout(timeout);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, isPaused, isManualScrolling, products.length, cardWidth, gap]);

  return (
    <div className="relative w-full py-4 overflow-visible">
      {/* Navigation Buttons - Desktop */}
      {width >= 768 && (
        <>
          <motion.button
            onClick={() => scroll('left')}
            whileHover={{ scale: 1.1, x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            onClick={() => scroll('right')}
            whileHover={{ scale: 1.1, x: 4 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-4 pb-4 py-8"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#ef4444 #1f2937',
          msOverflowStyle: 'auto',
          WebkitScrollbar: '10px',
        }}
        onMouseEnter={() => {
          setIsPaused(true);
          setIsMouseOver(true);
        }}
        onMouseLeave={() => {
          setIsPaused(false);
          setIsMouseOver(false);
        }}
        onWheel={handleWheel}
        onScroll={handleScroll}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className={`flex-shrink-0 ${width < 768 ? 'w-40' : 'w-72'} cursor-pointer`}
            whileHover={{ y: -12, scale: 1.08 }}
            transition={{ type: "easeOut", duration: 0.25 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* Custom scrollbar styling */}
      <style>{`
        div::-webkit-scrollbar {
          height: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #dc2626;
        }
      `}</style>

    </div>
  );
});

AutoScrollProducts.displayName = 'AutoScrollProducts';

export default AutoScrollProducts;