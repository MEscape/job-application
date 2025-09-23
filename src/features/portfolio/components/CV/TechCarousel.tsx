'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Technology {
    name: string;
    logo?: string;
    category: string;
}

interface TechCarouselProps {
    technologies: Technology[];
    className?: string;
}

export function TechCarousel({ technologies, className = '' }: TechCarouselProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
    const carouselRef = useRef<HTMLDivElement>(null);

    // Sample technologies if none provided
    const sampleTechs: Technology[] = [
        { name: 'React', category: 'Frontend' },
        { name: 'TypeScript', category: 'Language' },
        { name: 'Node.js', category: 'Backend' },
        { name: 'Python', category: 'Language' },
        { name: 'AWS', category: 'Cloud' },
        { name: 'Docker', category: 'DevOps' },
        { name: 'GraphQL', category: 'API' },
        { name: 'MongoDB', category: 'Database' },
        { name: 'Vue.js', category: 'Frontend' },
        { name: 'Redis', category: 'Database' },
    ];

    const techs = technologies.length > 0 ? technologies : sampleTechs;

    // Handle image load errors
    const handleImageError = (techName: string) => {
        setImageErrors(prev => new Set([...prev, techName]));
    };

    // Get tech initial for fallback
    const getTechInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    // Auto-scroll animation
    useEffect(() => {
        if (!carouselRef.current || techs.length === 0) return;

        const carousel = carouselRef.current;
        let animationId: number;
        const speed = 25;
        let lastTime = Date.now();
        let currentScroll = carousel.scrollLeft;

        const animate = () => {
            if (!isPaused && carousel) {
                const now = Date.now();
                const delta = now - lastTime;
                lastTime = now;

                // Increment scroll by speed * delta (ms)
                currentScroll += (speed * delta) / 1000;
                // Wrap around when reaching the duplicated width
                const maxScroll = carousel.scrollWidth / 3;
                if (currentScroll >= maxScroll) currentScroll -= maxScroll;

                carousel.scrollLeft = currentScroll;
            } else {
                // Keep lastTime updated while paused to avoid jump
                lastTime = Date.now();
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [techs.length, isPaused]);

    return (
        <div className={`relative w-full ${className}`}>
            <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                {/* Flowing tech elements */}
                <div className="relative">
                    <div
                        ref={carouselRef}
                        className="flex overflow-hidden gap-16 py-8"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => {
                            setIsPaused(false);
                            setHoveredIndex(null);
                        }}
                    >
                        {[...techs, ...techs, ...techs].map((tech, index) => (
                            <motion.div
                                key={`${tech.name}-${index}`}
                                className="flex-shrink-0 group relative flex flex-col items-center cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                whileHover={{
                                    scale: 1.1,
                                    y: -8,
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                            >
                                {/* Tech icon/letter - completely free */}
                                <div className="relative">
                                    {/* Subtle glow on hover */}
                                    <motion.div
                                        className="absolute inset-0 blur-xl"
                                        style={{
                                            background: hoveredIndex === index ?
                                                'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' :
                                                'transparent'
                                        }}
                                        animate={{
                                            opacity: hoveredIndex === index ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />

                                    {tech.logo && !imageErrors.has(tech.name) ? (
                                        <motion.img
                                            src={tech.logo}
                                            alt={tech.name}
                                            className="w-12 h-12 object-contain relative z-10"
                                            style={{
                                                filter: 'brightness(0) invert(1) opacity(0.7)',
                                            }}
                                            animate={{
                                                opacity: hoveredIndex === index ? 1 : 0.7,
                                                filter: hoveredIndex === index ?
                                                    'brightness(0) invert(1) opacity(1) drop-shadow(0 0 20px rgba(255,255,255,0.5))' :
                                                    'brightness(0) invert(1) opacity(0.7)'
                                            }}
                                            transition={{ duration: 0.3 }}
                                            onError={() => handleImageError(tech.name)}
                                        />
                                    ) : (
                                        <motion.div
                                            className="w-12 h-12 flex items-center justify-center relative z-10"
                                            animate={{
                                                textShadow: hoveredIndex === index ?
                                                    '0 0 20px rgba(255,255,255,0.8)' :
                                                    'none'
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <span className="text-white/70 font-light text-2xl">
                                                {getTechInitial(tech.name)}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Always visible label */}
                                <motion.div
                                    className="mt-3 whitespace-nowrap"
                                    animate={{
                                        opacity: hoveredIndex === index ? 1 : 0.6,
                                        y: hoveredIndex === index ? -2 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span className="text-white/70 text-sm font-light tracking-wide">
                                        {tech.name}
                                    </span>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Gradient masks for smooth appearing/disappearing */}
                    <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
                </div>

                {/* Minimal pause indicator */}
                <AnimatePresence>
                    {isPaused && (
                        <motion.div
                            className="absolute bottom-4 right-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}