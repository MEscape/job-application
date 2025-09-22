'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectFilter } from './ProjectFilter';
import { TimelineHeader } from './TimelineHeader';
import { Pagination } from '../shared/Pagination';

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

const PROJECTS_PER_PAGE = 5;

export function ProjectTimeline({ projects, className = '' }: ProjectTimelineProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    technologies: [],
    status: [],
    searchTerm: '',
    dateRange: 'all'
  });
  
  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter(project => {
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const currentProjects = filteredAndSortedProjects.slice(startIndex, endIndex);

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

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of projects section for better UX
    const projectsElement = document.getElementById('projects');
    if (projectsElement) {
      projectsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className={`relative min-h-screen py-20 overflow-hidden ${className}`} id='projects'>
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
            onFiltersChange={handleFiltersChange}
            availableTechnologies={availableTechnologies}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
        </motion.div>

        {/* Results Info */}
        {filteredAndSortedProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-8 text-center"
          >
            <p className="text-slate-400 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProjects.length)} of {filteredAndSortedProjects.length} projects
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </motion.div>
        )}

        {/* Projects Grid with Enhanced Layout */}
        <div className="relative mt-16 min-h-[500px]">
          {/* Projects */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-20">
              {currentProjects.map((project, index) => (
                <ProjectCard
                  key={`${project.id}-${currentPage}`}
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

          {/* Pagination */}
          {filteredAndSortedProjects.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </section>
  );
}