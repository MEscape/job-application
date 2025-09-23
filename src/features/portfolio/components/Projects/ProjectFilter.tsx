'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Calendar, Code, Star } from 'lucide-react';
import { useState } from 'react';

interface FilterOptions {
  technologies: string[];
  status: string[];
  searchTerm: string;
  dateRange: 'all' | 'recent' | 'older';
}

interface ProjectFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTechnologies: string[];
  isOpen: boolean;
  onToggle: () => void;
}

const statusOptions = [
  { value: 'completed', label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/20' },
  { value: 'in-progress', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-400/20' },
  { value: 'planned', label: 'Planned', color: 'text-yellow-400', bg: 'bg-yellow-400/20' }
];

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'recent', label: 'Recent (2023+)' },
  { value: 'older', label: 'Older (2022-)' }
];

export function ProjectFilter({ 
  filters, 
  onFiltersChange, 
  availableTechnologies, 
  isOpen, 
  onToggle 
}: ProjectFilterProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTechnology = (tech: string) => {
    const newTechnologies = filters.technologies.includes(tech)
      ? filters.technologies.filter(t => t !== tech)
      : [...filters.technologies, tech];
    updateFilters({ technologies: newTechnologies });
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const clearAllFilters = () => {
    updateFilters({
      technologies: [],
      status: [],
      searchTerm: '',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = filters.technologies.length > 0 || 
                          filters.status.length > 0 || 
                          filters.searchTerm || 
                          filters.dateRange !== 'all';

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="glass-base backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter size={18} className="text-gray-300" />
        <span className="text-white font-medium">Filters</span>
        {hasActiveFilters && (
          <motion.div
            className="w-2 h-2 bg-blue-400 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          />
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-2 h-2 border-r border-b border-white/60 transform rotate-45" />
        </motion.div>
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 mt-4 w-96 glass-base-colored backdrop-blur-xl border border-white/20 rounded-2xl p-6 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter size={20} className="text-gray-300" />
                Filter Projects
              </h3>
              {hasActiveFilters && (
                <motion.button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={14} />
                  Clear All
                </motion.button>
              )}
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Search size={14} />
                Search Projects
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search by title or description..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 transition-colors"
                />
                <motion.div
                  className="absolute inset-0 border-2 border-blue-400/50 rounded-xl pointer-events-none"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: searchFocused ? 1 : 0, scale: searchFocused ? 1 : 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Star size={14} />
                Project Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const isSelected = filters.status.includes(option.value);
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => toggleStatus(option.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected 
                          ? `${option.bg} ${option.color} border border-current` 
                          : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Calendar size={14} />
                Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {dateRangeOptions.map((option) => {
                  const isSelected = filters.dateRange === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => updateFilters({ dateRange: option.value as any })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected 
                          ? 'bg-blue-400/20 text-blue-400 border border-blue-400/50' 
                          : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Code size={14} />
                Technologies
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                <div className="flex p-1 flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableTechnologies.map((tech) => {
                    const isSelected = filters.technologies.includes(tech);
                    return (
                      <div key={tech} className="relative">
                        <motion.button
                          onClick={() => toggleTechnology(tech)}
                          className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-purple-500 text-white border border-purple-400/50 shadow-md'
                              : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {tech}
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}