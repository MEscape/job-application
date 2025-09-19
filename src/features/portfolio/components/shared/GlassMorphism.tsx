'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface GlassMorphismProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'light' | 'medium' | 'dark' | 'colored';
  intensity?: 'low' | 'medium' | 'high';
  border?: boolean;
  shadow?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const variants = {
  light: {
    background: 'bg-white/10',
    backdrop: 'backdrop-blur-[10px]',
    border: 'border-white/20'
  },
  medium: {
    background: 'bg-white/5',
    backdrop: 'backdrop-blur-[20px]',
    border: 'border-white/10'
  },
  dark: {
    background: 'bg-black/20',
    backdrop: 'backdrop-blur-[15px]',
    border: 'border-white/5'
  },
  colored: {
    background: 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10',
    backdrop: 'backdrop-blur-[20px]',
    border: 'border-white/10'
  }
};

const intensities = {
  low: 'backdrop-blur-[5px]',
  medium: 'backdrop-blur-[15px]',
  high: 'backdrop-blur-[25px]'
};

const roundedStyles = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full'
};

const shadows = {
  light: 'shadow-lg shadow-white/5',
  medium: 'shadow-xl shadow-black/10',
  dark: 'shadow-2xl shadow-black/20',
  colored: 'shadow-xl shadow-purple-500/20'
};

export const GlassMorphism = forwardRef<HTMLDivElement, GlassMorphismProps>(
  ({
    children,
    variant = 'medium',
    intensity = 'medium',
    border = true,
    shadow = true,
    rounded = 'xl',
    className = '',
    ...props
  }, ref) => {
    const variantStyles = variants[variant];
    const intensityStyle = intensities[intensity];
    const roundedStyle = roundedStyles[rounded];
    const shadowStyle = shadow ? shadows[variant] : '';
    const borderStyle = border ? `border ${variantStyles.border}` : '';

    const baseClasses = `
      relative overflow-hidden
      ${variantStyles.background}
      ${intensityStyle}
      ${roundedStyle}
      ${borderStyle}
      ${shadowStyle}
      ${className}
    `;

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3
        }}
        {...props}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out pointer-events-none" />
        
        {/* Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

GlassMorphism.displayName = 'GlassMorphism';

// Preset components for common use cases
export const GlassCard = ({ children, className = '', ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism
    variant="medium"
    className={`p-6 ${className}`}
    whileHover={{
      scale: 1.02,
      transition: { duration: 0.2 }
    }}
    {...props}
  >
    {children}
  </GlassMorphism>
);

export const GlassButton = ({ children, className = '', ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism
    variant="light"
    rounded="lg"
    className={`px-6 py-3 cursor-pointer select-none ${className}`}
    whileHover={{
      scale: 1.05,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      transition: { duration: 0.2 }
    }}
    whileTap={{
      scale: 0.98,
      transition: { duration: 0.1 }
    }}
    {...props}
  >
    {children}
  </GlassMorphism>
);

export const GlassPanel = ({ children, className = '', ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism
    variant="dark"
    intensity="high"
    className={`p-8 ${className}`}
    {...props}
  >
    {children}
  </GlassMorphism>
);

export const GlassModal = ({ children, className = '', ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism
    variant="colored"
    intensity="high"
    shadow={true}
    className={`p-6 max-w-lg mx-auto ${className}`}
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 20 }}
    transition={{
      duration: 0.3,

    }}
    {...props}
  >
    {children}
  </GlassMorphism>
);