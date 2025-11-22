import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CursorFollower = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const cursorSize = 40;

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target;
      if (
        window.getComputedStyle(target).getPropertyValue('cursor') === 'pointer'
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      className={`cursor-follower ${isPointer ? 'cursor-follower-pointer' : ''}`}
      animate={{
        x: position.x - cursorSize / 2,
        y: position.y - cursorSize / 2,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        restDelta: 0.001,
      }}
    />
  );
};

export default CursorFollower;
