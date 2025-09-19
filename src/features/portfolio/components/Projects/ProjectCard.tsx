'use client';

import { motion } from 'framer-motion';
import { Github, ExternalLink, Calendar, Clock, Star } from 'lucide-react';
import { useState, useRef } from 'react';
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
  liveUrl?: string;
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
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null!);
  const config = statusConfig[project.status];
  const StatusIcon = config.icon;
  
  // Intersection observer for animations
  const { isIntersecting } = useIntersectionObserver(cardRef, {
    threshold: 0.1,
    triggerOnce: true
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const { x, y } = mousePosition;
  
  // Calculate distance to each edge
  const distanceToTop = y;           
  const distanceToBottom = 1 - y;    
  const distanceToLeft = x;          
  const distanceToRight = 1 - x;

  // Threshold for activation distance - erhöht für größeren Aktivierungsbereich
  const threshold = 0.5;
  
  // Calculate base intensity for each edge - mit stärkerer Intensität
  const getBaseIntensity = (distance: number) => {
    return Math.max(0, Math.min(1, (threshold - distance) / threshold * 1.2));
  };

  // Get base intensities
  const topBase = getBaseIntensity(distanceToTop);
  const bottomBase = getBaseIntensity(distanceToBottom);
  const leftBase = getBaseIntensity(distanceToLeft);
  const rightBase = getBaseIntensity(distanceToRight);

  // Create gradient positions and intensities
  const createGradient = (base: number, position: number, isHorizontal: boolean) => {
    if (base === 0) return 'transparent';
    
    const maxIntensity = base * 1.0;
    const falloff = 0.4;
    
    if (isHorizontal) {
      // For top/bottom borders, gradient moves left to right based on x position
      const center = position * 100;
      const leftPos = Math.max(0, center - falloff * 100);
      const rightPos = Math.min(100, center + falloff * 100);
      
      return `linear-gradient(to right, 
        transparent 0%, 
        transparent ${leftPos}%, 
        rgba(255, 255, 255, ${maxIntensity}) ${center}%, 
        transparent ${rightPos}%, 
        transparent 100%)`;
    } else {
      // For left/right borders, gradient moves top to bottom based on y position
      const center = position * 100;
      const topPos = Math.max(0, center - falloff * 100);
      const bottomPos = Math.min(100, center + falloff * 100);
      
      return `linear-gradient(to bottom, 
        transparent 0%, 
        transparent ${topPos}%, 
        rgba(255, 255, 255, ${maxIntensity}) ${center}%, 
        transparent ${bottomPos}%, 
        transparent 100%)`;
    }
  };

  // Create individual gradient overlays for each border
  const topGradient = createGradient(topBase, x, true);
  const bottomGradient = createGradient(bottomBase, x, true);
  const leftGradient = createGradient(leftBase, y, false);
  const rightGradient = createGradient(rightBase, y, false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isIntersecting ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
      transition={{ 
        delay: isIntersecting ? index * 0.1 : 0, 
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="relative mb-8 group"
    >
      {/* Atmospheric Background Layer */}
      <div className="absolute left-6 top-0 w-px h-full bg-gradient-to-b from-blue-500/40 via-purple-500/30 to-transparent" />
      <div className="absolute left-5 top-6 w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-400/50" />
      
      {/* Floating Particles around timeline */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/60"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 4}px`,
            top: `${30 + i * 20}%`
          }}
        />
      ))}
      
      {/* Card */}
      <div className="ml-16">
        <GlassMorphism
          variant="medium"
          intensity="medium"
          className="relative cursor-pointer group/card"
          onClick={onToggleExpand}
        >
          <div
            ref={cardRef}
            className="relative p-6 transition-all duration-200"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
          {/* Simplified Shimmer Overlays */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
            style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease-out' }}
          >
            {/* Top border gradient */}
            <div
              className="absolute top-0 left-0 w-full h-px"
              style={{ background: topGradient }}
            />
            
            {/* Bottom border gradient */}
            <div
              className="absolute bottom-0 left-0 w-full h-px"
              style={{ background: bottomGradient }}
            />
            
            {/* Left border gradient */}
            <div
              className="absolute top-0 left-0 w-px h-full"
              style={{ background: leftGradient }}
            />
            
            {/* Right border gradient */}
            <div
              className="absolute top-0 right-0 w-px h-full"
              style={{ background: rightGradient }}
            />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-medium text-white">
                  {project.title}
                </h3>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bg}`}>
                  <StatusIcon size={12} className={config.color} />
                  <span className={`text-xs font-medium ${config.color} capitalize`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar size={14} />
                <span>{project.startDate}{project.endDate && ` - ${project.endDate}`}</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={16} className="text-slate-300" />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} className="text-slate-300" />
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-300 mb-4 leading-relaxed text-sm">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 bg-slate-800/60 rounded-md text-xs text-slate-300 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Expandable content */}
          <motion.div
            initial={false}
            animate={{ 
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0 
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Features</h4>
              <ul className="space-y-2">
                {project.features.map((feature, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Simple expand indicator */}
          <div className="flex justify-center mt-4 pt-3">
             <div className="text-slate-500 text-xs">
               {isExpanded ? 'Click to collapse' : 'Click to expand'}
             </div>
           </div>
          </div>
        </GlassMorphism>
      </div>
    </motion.div>
  );
}