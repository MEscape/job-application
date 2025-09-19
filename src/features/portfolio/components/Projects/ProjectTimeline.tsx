'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef } from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectFilter } from './ProjectFilter';
import { TimelineHeader } from './TimelineHeader';

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

interface ProjectTimelineProps {
  projects: Project[];
  className?: string;
}

interface FilterOptions {
  technologies: string[];
  status: string[];
  searchTerm: string;
  dateRange: 'all' | 'recent' | 'older';
}

export function ProjectTimeline({ projects, className = '' }: ProjectTimelineProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    technologies: [],
    status: [],
    searchTerm: '',
    dateRange: 'all'
  });
  
  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.technologies.some(tech => tech.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(project.status)) {
        return false;
      }

      // Technology filter
      if (filters.technologies.length > 0) {
        const hasMatchingTech = filters.technologies.some(tech => 
          project.technologies.includes(tech)
        );
        if (!hasMatchingTech) return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const projectYear = new Date(project.startDate).getFullYear();
        if (filters.dateRange === 'recent' && projectYear < 2023) return false;
        if (filters.dateRange === 'older' && projectYear >= 2023) return false;
      }

      return true;
    });

    // Sort chronologically (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [projects, filters]);

  // Get all available technologies for filter
  const availableTechnologies = useMemo(() => {
    const allTechs = projects.flatMap(p => p.technologies);
    return [...new Set(allTechs)].sort();
  }, [projects]);

  const toggleExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <section className={`relative min-h-screen py-20 overflow-hidden bg-black ${className}`} id='projects'>
      {/* Deep Atmospheric Background */}
      <div className="absolute inset-0">
        {/* Base Dark Gradients - More Visible */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 20% 10%, rgba(25, 25, 112, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 100% 60% at 80% 90%, rgba(139, 0, 139, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 150% 100% at 50% 50%, rgba(75, 0, 130, 0.15) 0%, transparent 60%)
            `
          }}
        />
        
        {/* Primary Atmospheric Orb */}
        <motion.div
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, 
              rgba(138, 43, 226, 0.20) 0%, 
              rgba(75, 0, 130, 0.24) 30%, 
              rgba(25, 25, 112, 0.18) 60%, 
              transparent 80%)`,
            width: '800px',
            height: '600px',
            left: '30%',
            top: '20%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(80px)'
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -20, 40, 0],
            scale: [1, 1.1, 0.95, 1],
            opacity: [0.6, 0.8, 0.4, 0.6]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Secondary Atmospheric Orb */}
        <motion.div
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, 
              rgba(139, 0, 139, 0.16) 0%, 
              rgba(72, 61, 139, 0.10) 40%, 
              transparent 70%)`,
            width: '600px',
            height: '500px',
            right: '20%',
            bottom: '30%',
            transform: 'translate(50%, 50%)',
            filter: 'blur(60px)'
          }}
          animate={{
            x: [0, -40, 60, 0],
            y: [0, 30, -50, 0],
            scale: [0.9, 1.05, 0.85, 0.9],
            opacity: [0.5, 0.7, 0.3, 0.5]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        
        {/* Deep Shadows and Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.7) 100%),
              linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)
            `
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <TimelineHeader 
            projects={projects}
            filteredCount={filteredAndSortedProjects.length}
          />
        </motion.div>
 
        {/* Filter Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <ProjectFilter
            filters={filters}
            onFiltersChange={setFilters}
            availableTechnologies={availableTechnologies}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
        </motion.div>

        {/* Projects Grid with Enhanced Layout */}
        <div className="relative mt-16 min-h-[500px]">
          {/* Projects */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-20">
              {filteredAndSortedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isExpanded={expandedProjects.has(project.id)}
                  onToggleExpand={() => toggleExpanded(project.id)}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredAndSortedProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12C21 
                      16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 
                      12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 
                      21 12Z"
                  />
                </svg>
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold text-white/90 mb-2">
                No projects found
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                Try adjusting your filters or search terms to see more results.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}