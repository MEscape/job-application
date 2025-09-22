'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {TimelineCard} from "@/features/portfolio/components/CV/TimelineCard";

interface CVEntry {
  degree?: string;
  position?: string;
  institution?: string;
  company?: string;
  type?: string;
  start_date: string;
  end_date?: string;
  duration?: string;
  grade?: string;
  notes?: string;
  description?: string;
}

interface CVTimelineProps {
  education: CVEntry[];
  experience: CVEntry[];
  className?: string;
}

export function CVTimeline({ education, experience, className = '' }: CVTimelineProps) {
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Fix hydration and restore scroll progress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollProgress(latest);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Smooth spring animation for scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleEntryClick = (type: string, index: number) => {
    const entryId = `${type}-${index}`;
    setActiveEntry(activeEntry === entryId ? null : entryId);
  };

  // Memoize sorted entries to reduce overhead
  const allEntries = useMemo(() => [
    ...education.map((entry, index) => ({ ...entry, type: 'education' as const, originalIndex: index })),
    ...experience.map((entry, index) => ({ ...entry, type: 'experience' as const, originalIndex: index }))
  ].sort((a, b) => {
    if (!a.start_date || !b.start_date) return 0;
    const yearA = parseInt(a.start_date.split('-')[0]);
    const yearB = parseInt(b.start_date.split('-')[0]);
    return yearB - yearA;
  }), [education, experience]);

  // Enhanced timeline animations with smooth start/end
  const timelineHeight = useTransform(smoothProgress, [0.1, 0.9], ["3%", "97%"]);
  const glowIntensity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 0.6, 0.8, 0]);
  const pulseScale = useTransform(smoothProgress,
      [0, 0.15, 0.4, 0.6, 0.85, 1],
      [0.8, 1.2, 1, 1.3, 1.1, 0.8]
  );

  // Dynamic color shifts based on scroll
    const timelineGradient = useTransform(
        smoothProgress,
        [0, 0.3, 0.6, 1],
        [
            "linear-gradient(180deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(99, 102, 241, 0.5) 100%)", // blue → purple → indigo
            "linear-gradient(180deg, rgba(96, 165, 250, 0.5) 0%, rgba(168, 85, 247, 0.45) 50%, rgba(59, 130, 246, 0.55) 100%)", // lighter blue/purple
            "linear-gradient(180deg, rgba(129, 140, 248, 0.55) 0%, rgba(147, 51, 234, 0.45) 50%, rgba(96, 165, 250, 0.5) 100%)", // indigo → violet
            "linear-gradient(180deg, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.55) 50%, rgba(168, 85, 247, 0.6) 100%)" // rich blue → purple → violet
        ]
    );

  return (
      <div ref={containerRef} className={`relative max-w-4xl mx-auto ${className}`}>
        <div className="relative overflow-hidden py-8">
          {/* Enhanced Central Timeline Spine */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-slate-800/40" />

          {/* Multi-layered Atmospheric Glow */}
          <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-6 blur-xl opacity-30"
              style={{
                background: timelineGradient,
                scale: pulseScale
              }}
          />
          <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-3 blur-lg opacity-50"
              style={{
                background: timelineGradient,
                opacity: glowIntensity
              }}
          />

          {/* Animated Progress Line */}
          <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 top-0 w-px backdrop-blur-sm"
              style={{
                height: timelineHeight,
                background: timelineGradient
              }}
          />

          {/* Dynamic Progress Orb */}
          <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/20 backdrop-blur-sm"
              style={{
                top: timelineHeight,
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(139,92,246,0.6) 70%, transparent 100%)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
                scale: pulseScale
              }}
          >
            {/* Orbital rings */}
            <motion.div
                className="absolute inset-0 rounded-full border border-white/10"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
            />
            <motion.div
                className="absolute inset-0 rounded-full border border-purple-400/20"
                animate={{
                  scale: [1, 2.2, 1],
                  opacity: [0.4, 0, 0.4]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.3
                }}
            />
          </motion.div>

          {/* Timeline Entries with Staggered Animation */}
          <div className="space-y-0 overflow-hidden pb-16">
            {allEntries.map((entry, index) => (
                <TimelineCard
                    key={`${entry.type}-${entry.originalIndex}`}
                    entry={entry}
                    index={index}
                    type={entry.type}
                    isActive={activeEntry === `${entry.type}-${entry.originalIndex}`}
                    onClick={() => handleEntryClick(entry.type, entry.originalIndex)}
                    side={index % 2 === 0 ? 'left' : 'right'}
                    scrollProgress={scrollProgress}
                />
            ))}
          </div>
        </div>
      </div>
  );
}