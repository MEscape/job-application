import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutGrid, List, PanelRight } from 'lucide-react';
import { useFinderStore } from '../../hooks/useFinderStore';

export const FinderToolbar: React.FC = () => {
    const {
        history,
        sidebarVisible,
        historyIndex,
        viewMode,
        toggleSidebar,
        goBack,
        setViewMode,
        goForward,
    } = useFinderStore();

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;

    return (
        <div className="flex items-center justify-between h-12 px-4 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center space-x-1">
                <motion.button
                    className={`p-2 rounded-md transition-colors ${
                    !canGoBack 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={goBack}
                    disabled={!canGoBack}
                    aria-label="Go back"
                    title="Back"
                    whileHover={!canGoBack ? {} : { scale: 1.1 }}
                    whileTap={!canGoBack ? {} : { scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <ChevronLeft className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                    className={`p-2 rounded-md transition-colors ${
                    !canGoForward 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={goForward}
                    disabled={!canGoForward}
                    aria-label="Go forward"
                    title="Forward"
                    whileHover={!canGoForward ? {} : { scale: 1.1 }}
                    whileTap={!canGoForward ? {} : { scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-md">
                    <motion.button
                        className={`p-2 rounded-l-md transition-colors ${
                            viewMode === 'icon' 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setViewMode('icon')}
                        aria-label="Icon view"
                        title="Icon view"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                        className={`p-2 rounded-r-md transition-colors ${
                            viewMode === 'list' 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setViewMode('list')}
                        aria-label="List view"
                        title="List view"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <List className="w-4 h-4" />
                    </motion.button>
                </div>

                <motion.button
                    className={`p-2 rounded-md transition-colors ${
                    sidebarVisible 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                    title="Toggle sidebar"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <PanelRight className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    )
}