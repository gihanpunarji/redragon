import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useWindowDimensions from "../../../hooks/useWindowDimensions";

const AutoScrollBrands = ({ brands }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const { width } = useWindowDimensions();

  const handleBrandClick = (brandName) => {
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  const handleManualScroll = (direction) => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      setIsPaused(true);
      const scrollAmount = 300;
      scrollContainer.scrollLeft +=
        direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId;

    const scroll = () => {
      scrollContainer.scrollLeft += 1.5; // scroll speed

      // **IF SCROLL END REACHED → RESET TO START**
      if (
        scrollContainer.scrollLeft >=
        scrollContainer.scrollWidth - scrollContainer.clientWidth
      ) {
        scrollContainer.scrollLeft = 0;
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div className="relative w-full px-8 overflow-visible">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth py-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {brands.map((brand, index) => (
          <motion.div
            key={`${brand.name}-${index}`}
            className="flex-shrink-0 w-45 cursor-pointer"
            onClick={() => handleBrandClick(brand.name)}
          >
            <motion.div
              className="bg-white rounded-2xl overflow-hidden
        border border-gray-200
        shadow-md p-6 h-32 flex items-center justify-center"
              whileHover={{
                scale: 1.2,
                y: -15,
                boxShadow: "0 30px 60px rgba(239, 68, 68, 0.4)",
                borderColor: "rgb(239, 68, 68)",
              }}
              transition={{ type: "easeOut", duration: 0.25 }}
            >
              <motion.img
                src={brand.logo}
                alt={brand.name}
                className="object-contain"
                style={{ maxHeight: "80px" }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "easeOut", duration: 0.25 }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Buttons */}
      <button
        onClick={() => handleManualScroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full z-20 shadow-lg focus:outline-none"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => handleManualScroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full z-20 shadow-lg focus:outline-none"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default AutoScrollBrands;
