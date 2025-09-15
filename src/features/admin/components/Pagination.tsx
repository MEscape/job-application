"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage?: number
    onPageChange: (page: number) => void
    isLoading?: boolean
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage = 10,
    onPageChange,
    isLoading = false
}: PaginationProps) {
    if (totalPages <= 1) return null

    const getVisiblePages = () => {
        const delta = 2
        const range = []
        const rangeWithDots = []

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...')
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages)
        } else {
            rangeWithDots.push(totalPages)
        }

        return rangeWithDots
    }

    const visiblePages = getVisiblePages()
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-800/30 border-t border-slate-600/30">
            {/* Items info */}
            <div className="text-sm text-slate-400">
                Showing {startItem} to {endItem} of {totalItems} items
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Previous button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-600/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700/50 disabled:hover:text-slate-300 transition-all duration-200"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                </motion.button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {visiblePages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <div key={`dots-${index}`} className="px-3 py-2 text-slate-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                </div>
                            )
                        }

                        const pageNumber = page as number
                        const isCurrentPage = pageNumber === currentPage

                        return (
                            <motion.button
                                key={pageNumber}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onPageChange(pageNumber)}
                                disabled={isLoading}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isCurrentPage
                                        ? 'bg-blue-500 text-white border border-blue-500'
                                        : 'text-slate-300 bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                            >
                                {pageNumber}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Next button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-600/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700/50 disabled:hover:text-slate-300 transition-all duration-200"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    )
}