import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { productPromoAPI } from '../../services/api';

const ProductPromoSection = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const getThemeStyles = (theme) => {
    const themes = {
      primary: { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' },
      success: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      error: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      info: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
      redragon: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
    };
    return themes[theme] || themes.primary;
  };

  useEffect(() => {
    fetchActivePromos();
  }, []);

  const fetchActivePromos = async () => {
    try {
      setLoading(true);
      
      // For testing: directly fetch from local backend
      const response = await fetch('http://localhost:5001/api/product-promo/active');
      const data = await response.json();
      
      if (data.success) {
        setPromos(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch promotional messages:', error);
      setError('Failed to load promotional messages');
    } finally {
      setLoading(false);
    }
  };


  const nextPromo = () => {
    setCurrentIndex((prev) => (prev + 1) % promos.length);
  };

  const prevPromo = () => {
    setCurrentIndex((prev) => (prev === 0 ? promos.length - 1 : prev - 1));
  };

  // Auto-slide functionality
  useEffect(() => {
    if (promos.length <= 1) return;
    
    const interval = setInterval(() => {
      nextPromo();
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [promos.length, currentIndex]);

  // Don't render if no promos or still loading
  if (loading || error || promos.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="relative">
        <AnimatePresence mode="wait">
          {promos.map((promo, index) => {
            if (index !== currentIndex) return null;
            
            const themeStyles = getThemeStyles(promo.theme);
            
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="relative overflow-hidden rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: themeStyles.bg,
                  borderColor: themeStyles.border,
                  color: promo.color
                }}
              >
                {/* Gradient overlay for depth */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${promo.color} 0%, transparent 100%)`
                  }}
                />
                
                {/* Content */}
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    {/* Icon Dot */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 10
                      }}
                      className="flex-shrink-0"
                    >
                      <div 
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-lg"
                        style={{ backgroundColor: promo.color }}
                      />
                    </motion.div>

                    {/* Message */}
                    <div className="flex-1">
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed"
                        style={{ color: promo.color }}
                      >
                        {promo.message}
                      </motion.p>
                    </div>

                    {/* Message Icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex-shrink-0 opacity-30"
                    >
                      <MessageSquare 
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        style={{ color: promo.color }}
                      />
                    </motion.div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(9)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: 0.5 + (i * 0.05),
                            type: "spring"
                          }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: promo.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div 
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${promo.color} 0%, transparent 100%)`,
                    opacity: 0.4
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Navigation arrows - only show if multiple promos */}
        {promos.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevPromo}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextPromo}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </motion.button>
          </>
        )}
      </div>

      {/* Pagination dots - only show if multiple promos */}
      {promos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {promos.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-red-500 w-6 sm:w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPromoSection;