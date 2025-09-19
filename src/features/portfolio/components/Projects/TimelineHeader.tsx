'use client';

import { motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
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

interface TimelineHeaderProps {
  projects: Project[];
  filteredCount: number;
}

export function TimelineHeader({ projects, filteredCount }: TimelineHeaderProps) {
  const statsRef = useRef<HTMLDivElement>(null!);
  
  const { isIntersecting: statsInView } = useIntersectionObserver(statsRef, {
    threshold: 0.2,
    rootMargin: '-50px 0px',
    triggerOnce: true
  });

  const stats = useMemo(() => {
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const planned = projects.filter(p => p.status === 'planned').length;
    
    const allTechnologies = [...new Set(projects.flatMap(p => p.technologies))];
    const techCount = allTechnologies.length;
    
    const dates = projects.map(p => new Date(p.startDate)).sort((a, b) => a.getTime() - b.getTime());
    const firstProject = dates[0];
    const lastProject = dates[dates.length - 1];
    
    return {
      completed,
      inProgress,
      planned,
      techCount,
      timespan: firstProject && lastProject ? {
        start: firstProject.getFullYear(),
        end: lastProject.getFullYear()
      } : null
    };
  }, [projects]);

  return (
    <div className="relative mb-16">
      {/* Main header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center gap-3 mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Project Timeline
          </h2>
        </motion.div>
        
        <motion.p
          className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          A chronological journey through development projects
          {stats.timespan && (
            <span className="block mt-2 text-gray-400/80 leading-relaxed text-xl">
              {stats.timespan.start} - {stats.timespan.end}
            </span>
          )}
        </motion.p>
      </motion.div>

      {/* Simple Project Statistics */}
      <motion.div 
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
        initial={{ opacity: 0, y: 30 }}
        animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div 
            className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={statsInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            {projects.length}
          </motion.div>
          <div className="text-white/60 text-sm font-medium tracking-wide uppercase">
            Total Projects
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div 
            className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={statsInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
          >
            {filteredCount}
          </motion.div>
          <div className="text-white/60 text-sm font-medium tracking-wide uppercase">
            Filtered
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={statsInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
          >
            {stats.techCount}
          </motion.div>
          <div className="text-white/60 text-sm font-medium tracking-wide uppercase">
            Technologies
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div 
            className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={statsInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
          >
            {stats.completed}
          </motion.div>
          <div className="text-white/60 text-sm font-medium tracking-wide uppercase">
            Completed
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}