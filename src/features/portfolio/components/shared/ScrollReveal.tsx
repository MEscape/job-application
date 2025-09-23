'use client';

import { motion, useInView, HTMLMotionProps } from 'framer-motion';
import { ReactNode, useRef, forwardRef } from 'react';

interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  triggerOnce?: boolean;
  cascade?: boolean;
  cascadeDelay?: number;
  className?: string;
}

const directionVariants = {
  up: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  down: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 }
  },
  left: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  right: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
};

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    distance = 50,
    threshold = 0.1,
    triggerOnce = true,
    cascade = false,
    cascadeDelay = 0.1,
    className = '',
    ...props
  }, ref) => {
    const localRef = useRef<HTMLDivElement>(null);
    const targetRef = ref || localRef;
    
    const isInView = useInView(targetRef as React.RefObject<HTMLDivElement>, {
      amount: threshold,
      once: triggerOnce,
      margin: '-50px'
    });

    // Custom variants with distance parameter
    const customVariants = {
      hidden: {
        opacity: 0,
        ...(direction === 'up' && { y: distance }),
        ...(direction === 'down' && { y: -distance }),
        ...(direction === 'left' && { x: -distance }),
        ...(direction === 'right' && { x: distance }),
        ...(direction === 'scale' && { scale: 0.8 }),
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          duration,
          delay,

          ...(cascade && {
            staggerChildren: cascadeDelay,
            delayChildren: delay
          })
        }
      }
    };

    return (
      <motion.div
        ref={targetRef}
        variants={customVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = 'ScrollReveal';

// Preset components for common use cases
export const FadeIn = ({ children, delay = 0, duration = 0.6, className = '', ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal
    direction="fade"
    delay={delay}
    duration={duration}
    className={className}
    {...props}
  >
    {children}
  </ScrollReveal>
);

export const SlideUp = ({ children, delay = 0, duration = 0.6, distance = 50, className = '', ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal
    direction="up"
    delay={delay}
    duration={duration}
    distance={distance}
    className={className}
    {...props}
  >
    {children}
  </ScrollReveal>
);

export const SlideLeft = ({ children, delay = 0, duration = 0.6, distance = 50, className = '', ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal
    direction="left"
    delay={delay}
    duration={duration}
    distance={distance}
    className={className}
    {...props}
  >
    {children}
  </ScrollReveal>
);

export const SlideRight = ({ children, delay = 0, duration = 0.6, distance = 50, className = '', ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal
    direction="right"
    delay={delay}
    duration={duration}
    distance={distance}
    className={className}
    {...props}
  >
    {children}
  </ScrollReveal>
);

export const ScaleIn = ({ children, delay = 0, duration = 0.6, className = '', ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal
    direction="scale"
    delay={delay}
    duration={duration}
    className={className}
    {...props}
  >
    {children}
  </ScrollReveal>
);

// Cascade reveal for lists and grids
export const CascadeReveal = ({ 
  children, 
  direction = 'up', 
  cascadeDelay = 0.1, 
  className = '', 
  ...props 
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: 0.1,
    once: true,
    margin: '-50px'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: cascadeDelay,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = directionVariants[direction];

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      {...props}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

// Text reveal with character-by-character animation
export const TextReveal = ({ 
  children, 
  delay = 0, 
  className = '', 
  ...props 
}: { children: string; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: 0.1,
    once: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: delay
      }
    }
  };

  const charVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.3,

      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`inline-block ${className}`}
      {...props}
    >
      {children.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          className="inline-block"
          style={{ transformOrigin: '50% 100%' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Progressive blur reveal
export const BlurReveal = ({ 
  children, 
  delay = 0, 
  duration = 0.8, 
  className = '', 
  ...props 
}: Omit<ScrollRevealProps, 'direction'>) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: 0.1,
    once: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        filter: 'blur(10px)',
        scale: 1.1
      }}
      animate={isInView ? {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1
      } : {
        opacity: 0,
        filter: 'blur(10px)',
        scale: 1.1
      }}
      transition={{
        duration,
        delay,

      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};