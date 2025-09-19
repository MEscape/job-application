'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MouseGlowProps {
  containerRef: React.RefObject<HTMLElement>;
}

export function MouseGlow({ containerRef }: MouseGlowProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMounted, containerRef]);

  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      className="fixed pointer-events-none z-10 will-change-transform"
      style={{
        left: mousePosition.x - 150,
        top: mousePosition.y - 150,
      }}
      animate={{
        opacity: isVisible ? 0.4 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
    >
      <div 
        className="w-[300px] h-[300px] blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(79, 156, 249, 0.4) 0%, rgba(124, 58, 237, 0.3) 40%, rgba(236, 72, 153, 0.2) 70%, transparent 100%)',
        }}
      />
    </motion.div>
  );
}