'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useState } from 'react';

interface HeroButtonProps {
  onClick?: () => void;
  className?: string;
}

export function HeroButton({ onClick, className = '' }: HeroButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      const projectsSection = document.getElementById('projects');
      projectsSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      className={`relative group overflow-hidden w-56 h-14 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Mouse glow effect */}
      <motion.div
        className="absolute inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 70%)'
        }}
        animate={{
          scale: isHovered ? [1, 1.02, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))'
        }}
        animate={{
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 8,
          repeat: isHovered ? Infinity : 0,
          ease: "linear"
        }}
      />
      
      <motion.button
        onClick={handleClick}
        className="relative px-6 py-3 rounded-2xl backdrop-blur-[30px] border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 overflow-hidden group-hover:border-white/30 transition-all duration-300 ease-out w-full h-full flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
          }}
        />
        
        {/* Inner gradient overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))'
          }}
        />
        
        {/* Content */}
        <div className="relative flex items-center gap-3 text-white font-semibold tracking-wide">
          <span className="text-sm">Explore My Work</span>
          <motion.div
            animate={{ 
              y: [0, 4, 0],
              rotate: isHovered ? [0, 5, -5, 0] : 0
            }}
            transition={{
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0.5, ease: "easeInOut" }
            }}
            className="relative"
          >
            <ArrowDown className="w-5 h-5 drop-shadow-lg" />
            
            {/* Arrow glow */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                filter: 'blur(8px)'
              }}
            />
          </motion.div>
        </div>
        
        {/* Bottom highlight */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-px w-0 group-hover:w-3/4 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent)'
          }}
        />
      </motion.button>
    </motion.div>
  );
}
