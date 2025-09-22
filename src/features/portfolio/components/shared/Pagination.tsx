'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { GlassMorphism } from '../shared/GlassMorphism';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    // Always show last page if totalPages > 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add dots where there are gaps
    let prev = 0;
    for (const page of range) {
      if (page - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (page - prev > 2) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex items-center justify-center gap-2 mt-12 ${className}`}
    >
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="group"
      >
        <GlassMorphism
          variant="light"
          intensity="low"
          className={`
            p-2.5 transition-all duration-200
            ${currentPage === 1 
              ? 'opacity-40 cursor-not-allowed' 
              : 'hover:bg-white/10 cursor-pointer'
            }
          `}
        >
          <ChevronLeft 
            size={18} 
            className={`
              transition-colors duration-200
              ${currentPage === 1 
                ? 'text-slate-500' 
                : 'text-slate-300 group-hover:text-white'
              }
            `} 
          />
        </GlassMorphism>
      </motion.button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <div
                key={`dots-${index}`}
                className="flex items-center justify-center w-10 h-10"
              >
                <MoreHorizontal size={16} className="text-slate-400" />
              </div>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: isActive ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(pageNum)}
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              <GlassMorphism
                variant={isActive ? "medium" : "light"}
                intensity={isActive ? "medium" : "low"}
                className={`
                  w-10 h-10 flex items-center justify-center
                  transition-all duration-200 relative overflow-hidden
                  ${isActive 
                    ? 'bg-blue-500/20 border border-blue-400/30' 
                    : 'cursor-pointer'
                  }
                `}
              >
                {/* Page number */}
                <span 
                  className={`
                    text-sm font-medium relative z-10 transition-colors duration-200
                  `}
                >
                  {pageNum}
                </span>
              </GlassMorphism>
            </motion.button>
          );
        })}
      </div>

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="group"
      >
        <GlassMorphism
          variant="light"
          intensity="low"
          className={`
            p-2.5 transition-all duration-200
            ${currentPage === totalPages 
              ? 'opacity-40 cursor-not-allowed' 
              : 'hover:bg-white/10 cursor-pointer'
            }
          `}
        >
          <ChevronRight 
            size={18} 
            className={`
              transition-colors duration-200
              ${currentPage === totalPages 
                ? 'text-slate-500' 
                : 'text-slate-300 group-hover:text-white'
              }
            `} 
          />
        </GlassMorphism>
      </motion.button>
    </motion.div>
  );
}