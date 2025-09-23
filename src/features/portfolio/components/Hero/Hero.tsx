'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { MouseGlow } from './MouseGlow';
import { TypingText } from './TypingText';
import { HeroButton } from './HeroButton';

interface HeroProps {
  className?: string;
}

export function Hero({ className = '' }: HeroProps) {
  const controls = useAnimation();
  const [particles, setParticles] = useState<Array<{left: number, top: number, delay: number, duration: number}>>([]);
  const heroRef = useRef<HTMLElement>(null!);
  
  const storylineText = [
    "Hi, I'm Marvin — 21, Full-Stack Developer in training",
    "3rd year Programmer at EDAG",
    "Currently at a 1.0 grade",
    "Working with Java, Spring Boot, React & Next.js"
  ];

  const pauseDurations = [1700, 1500, 1400, 1300];

  useEffect(() => {
    // Generate particle positions on client side only
    const particleData = Array.from({ length: 12 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4
    }));
    setParticles(particleData);
    
    const sequence = async () => {
      await controls.start({
        opacity: [0, 0.3, 0],
        scale: [0.8, 1.1, 1],
        transition: { duration: 2, ease: "easeOut" }
      });
    };
    sequence();
  }, [controls]);

  const scrollToElement = (selector: string, duration = 800) => {
    const el = document.querySelector(selector);
    if (!el) return;

    const start = window.scrollY;
    const end = el.getBoundingClientRect().top + start;
    const distance = end - start;
    let startTime: number | null = null;

    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      const eased = easeInOutQuad(Math.min(progress, 1));
      window.scrollTo(0, start + distance * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  return (
    <section ref={heroRef} className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Atmospheric depth layers */}
      <div className="absolute inset-0">
        {/* Ultra-subtle floating particles */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.3)]"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
        
        {/* Depth layers with breathing animation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 120% 80% at 50% 120%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)',
              'radial-gradient(ellipse 120% 80% at 50% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
              'radial-gradient(ellipse 120% 80% at 50% 120%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <MouseGlow containerRef={heroRef} />
      
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        {/* Main title with sophisticated entrance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent leading-[1.1] tracking-tight text-center min-h-[120px] md:min-h-[160px] lg:min-h-[200px] flex items-center justify-center"
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ 
              duration: 1.2, 
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <TypingText 
               lines={storylineText}
               pauseDurations={pauseDurations}
               typingSpeed={40}
               deletingSpeed={25}
               loop={true}
             />
          </motion.h1>
          
          {/* Subtitle with staggered word animation */}
          <motion.div
            className="text-xl md:text-2xl text-gray-400 mb-8 leading-[1.6] tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {"Crafting digital experiences with modern technologies".split(" ").map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-2"
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.6,
                  delay: 1.5 + index * 0.1,
                  ease: "easeOut"
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
          
          {/* Button with elegant entrance */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 2.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="flex justify-center"
          >
            <HeroButton onClick={() => scrollToElement("#projects", 1000)} />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Minimal vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20 pointer-events-none" />
    </section>
  );
}