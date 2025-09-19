'use client';

import { motion, useScroll, useTransform, HTMLMotionProps } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxSectionProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  offset?: [string, string];
  className?: string;
  backgroundImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function ParallaxSection({
  children,
  speed = 0.5,
  direction = 'up',
  offset = ['start end', 'end start'],
  className = '',
  backgroundImage,
  overlay = false,
  overlayOpacity = 0.5,
  ...props
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any || ["start end", "end start"]
  });

  // Calculate transform values based on direction and speed
  const getTransformValue = () => {
    const distance = speed * 100;
    switch (direction) {
      case 'up':
        return useTransform(scrollYProgress, [0, 1], [0, -distance]);
      case 'down':
        return useTransform(scrollYProgress, [0, 1], [0, distance]);
      case 'left':
        return useTransform(scrollYProgress, [0, 1], [0, -distance]);
      case 'right':
        return useTransform(scrollYProgress, [0, 1], [0, distance]);
      default:
        return useTransform(scrollYProgress, [0, 1], [0, -distance]);
    }
  };

  const transformValue = getTransformValue();
  
  // Create transform style based on direction
  const getTransformStyle = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: transformValue };
      case 'left':
      case 'right':
        return { x: transformValue };
      default:
        return { y: transformValue };
    }
  };

  const transformStyle = getTransformStyle();

  return (
    <motion.div ref={ref} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Background Image with Parallax */}
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            ...transformStyle
          }}
        />
      )}
      
      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* Content with Parallax */}
      <motion.div
        className="relative z-10"
        style={transformStyle}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Parallax layers for complex effects
export function ParallaxLayers({ 
  children, 
  className = '',
  ...props 
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  return (
    <motion.div ref={ref} className={`relative overflow-hidden ${className}`} {...props}>
      {children}
    </motion.div>
  );
}

// Individual parallax layer
export function ParallaxLayer({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  zIndex = 1,
  ...props
}: {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  zIndex?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const distance = speed * 100;
  const y = direction === 'up' 
    ? useTransform(scrollYProgress, [0, 1], [0, -distance])
    : useTransform(scrollYProgress, [0, 1], [0, distance]);
  
  const x = direction === 'left'
    ? useTransform(scrollYProgress, [0, 1], [0, -distance])
    : direction === 'right'
    ? useTransform(scrollYProgress, [0, 1], [0, distance])
    : 0;

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 ${className}`}
      style={{ 
        y: direction === 'up' || direction === 'down' ? y : 0,
        x: direction === 'left' || direction === 'right' ? x : 0,
        zIndex 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Parallax text with multiple speeds
export function ParallaxText({
  children,
  speed = 0.5,
  className = '',
  ...props
}: {
  children: string;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, opacity }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Floating elements with parallax
export function FloatingElements({
  count = 10,
  className = '',
  ...props
}: {
  count?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  return (
    <motion.div ref={ref} className={`absolute inset-0 pointer-events-none ${className}`} {...props}>
      {Array.from({ length: count }).map((_, index) => {
        const speed = 0.2 + (index % 3) * 0.3;
        const y = useTransform(scrollYProgress, [0, 1], [0, -speed * 200]);
        const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
        const opacity = useTransform(
          scrollYProgress, 
          [0, 0.2, 0.8, 1], 
          [0, 0.6, 0.6, 0]
        );

        return (
          <motion.div
            key={index}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              y,
              rotate,
              opacity
            }}
          />
        );
      })}
    </motion.div>
  );
}

// Parallax background with multiple layers
export function ParallaxBackground({
  layers,
  className = '',
  ...props
}: {
  layers: {
    image: string;
    speed: number;
    opacity?: number;
  }[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  return (
    <motion.div ref={ref} className={`absolute inset-0 ${className}`} {...props}>
      {layers.map((layer, index) => {
        const y = useTransform(scrollYProgress, [0, 1], [0, -layer.speed * 100]);
        
        return (
          <motion.div
            key={index}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${layer.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: layer.opacity || 1,
              y,
              zIndex: layers.length - index
            }}
          />
        );
      })}
    </motion.div>
  );
}

// Mouse parallax effect
export function MouseParallax({
  children,
  strength = 0.1,
  className = '',
  ...props
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        if (!ref.current) return;
        
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        ref.current.style.transform = 'translate(0px, 0px)';
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}