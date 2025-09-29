'use client';

import { motion } from 'framer-motion';
import { Github, Calendar, Clock, Star, Image } from 'lucide-react';
import { useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GlassMorphism } from '../shared/GlassMorphism';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  features: string[];
  status: 'completed' | 'in-progress' | 'planned';
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  galleryUrl?: string;
  image?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const statusConfig = {
  completed: { 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/20',
    icon: Star 
  },
  'in-progress': { 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20',
    icon: Clock 
  },
  planned: { 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/20',
    icon: Calendar 
  }
};

export function ProjectCard({ project, index, isExpanded, onToggleExpand }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null!);
  const config = statusConfig[project.status];
  const StatusIcon = config.icon;
  
  // Intersection observer for animations
  const { isIntersecting } = useIntersectionObserver(cardRef, {
    threshold: 0.1,
    triggerOnce: true
  });

  // Optimized mouse handlers with useCallback
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Memoized animation variants for better performance
  const cardVariants = useMemo(() => ({
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 }
  }), []);

  const expandVariants = useMemo(() => ({
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1 }
  }), []);

  return (
    <motion.div
      initial="initial"
      animate={isIntersecting ? "animate" : "initial"}
      variants={cardVariants}
      transition={{ 
        delay: isIntersecting ? index * 0.1 : 0, 
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="relative mb-6 sm:mb-8 group"
    >
      {/* Simplified Atmospheric Background Layer - hidden on mobile for performance */}
      <div className="hidden sm:block absolute left-6 top-0 w-px h-full bg-gradient-to-b from-blue-500/40 via-purple-500/30 to-transparent" />
      <div className="hidden sm:block absolute left-5 top-6 w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-400/50" />
      
      {/* Simplified floating particles - reduced count and hidden on mobile */}
      {Array.from({ length: 2 }).map((_, i) => (
        <motion.div
          key={i}
          className="hidden md:block absolute w-1 h-1 rounded-full bg-blue-400/60"
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 6}px`,
            top: `${30 + i * 25}%`
          }}
        />
      ))}
      
      {/* Card - responsive margins and padding */}
      <div className="ml-4 sm:ml-16">
        <GlassMorphism
          variant="medium"
          intensity="medium"
          className="relative cursor-pointer group/card"
          onClick={onToggleExpand}
        >
          <div
            ref={cardRef}
            className="relative p-4 sm:p-6 transition-all duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
          {/* Simplified shimmer effect - only on desktop and when hovered */}
          <div
            className="hidden sm:block absolute inset-0 rounded-xl pointer-events-none overflow-hidden opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
              background: isHovered ? 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)' : 'transparent'
            }}
          />

          {/* Header - responsive layout */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h3 className="text-base sm:text-lg font-medium text-white truncate">
                  {project.title}
                </h3>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bg} self-start`}>
                  <StatusIcon size={12} className={config.color} />
                  <span className={`text-xs font-medium ${config.color} capitalize`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar size={14} />
                <span className="truncate">{project.startDate}{project.endDate && ` - ${project.endDate}`}</span>
              </div>
            </div>

            {/* Links - responsive layout */}
            <div className="flex gap-2 self-start sm:self-auto">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition-colors touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={16} className="text-slate-300" />
                </a>
              )}
              {project.galleryUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(project.galleryUrl!);
                  }}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition-colors touch-manipulation"
                  title="View Gallery"
                >
                  <Image size={16} className="text-slate-300" />
                </button>
              )}
            </div>
          </div>

          {/* Description - responsive text size */}
          <p className="text-slate-300 mb-4 leading-relaxed text-sm sm:text-base">
            {project.description}
          </p>

          {/* Technologies - responsive grid */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 sm:px-2.5 py-1 bg-slate-800/60 rounded-md text-xs text-slate-300 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Expandable content - optimized animation */}
          <motion.div
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            variants={expandVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Features</h4>
              <ul className="space-y-2">
                {project.features.map((feature, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Simple expand indicator - responsive text */}
          <div className="flex justify-center mt-4 pt-3">
             <div className="text-slate-500 text-xs sm:text-sm">
               {isExpanded ? 'Zum Einklappen tippen' : 'Zum Erweitern tippen'}
             </div>
           </div>
          </div>
        </GlassMorphism>
      </div>
    </motion.div>
  );
}