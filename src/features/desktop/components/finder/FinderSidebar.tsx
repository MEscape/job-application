import React from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { useFinderStore } from "../../hooks/useFinderStore";
import { SIDEBAR_SECTIONS, DEFAULT_FAVORITES, DEFAULT_DEVICES } from "../../constants/finder";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  isClickable?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick, isClickable = true }) => {
  return (
    <motion.div
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-500 text-white' 
          : isClickable 
            ? 'text-gray-700 hover:bg-gray-100 cursor-pointer'
            : 'text-gray-500 cursor-default'
      }`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      whileHover={isClickable ? { scale: 1.02, x: 2 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Icon className="mr-3 w-4 h-4" /> 
      <span className="truncate">{label}</span>
    </motion.div>
  );
};

interface FinderSidebarProps {
  sidebarVisible?: boolean;
}

export const FinderSidebar: React.FC<FinderSidebarProps> = ({ sidebarVisible = true }) => {
    const {
        currentPath,
        toggleSidebar,
        navigateTo
    } = useFinderStore();

    const handleItemClick = (path: string) => {
        navigateTo(path);
        
        // Close only on mobile (<768px = Tailwind md breakpoint)
        if (globalThis.window.innerWidth < 768) {
            toggleSidebar();
        }
    };
    
    const renderSection = (title: string, items: Array<{ icon: LucideIcon; label: string; path: string }>, isClickable: boolean = true) => (
        <div className="mb-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
            <div className="space-y-1">
                {items.map((item) => (
                    <SidebarItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        isActive={isClickable && currentPath === item.path}
                        onClick={isClickable ? () => handleItemClick(item.path) : undefined}
                        isClickable={isClickable}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <>
              <AnimatePresence>
                {sidebarVisible && (
                    <motion.div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                        onClick={toggleSidebar}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>

            <motion.div 
                className="w-64 h-full bg-gray-50 border-r border-gray-200 overflow-y-auto relative z-50"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
            >
                <div className="p-4">
                    {/* Favorites Section */}
                    {renderSection(SIDEBAR_SECTIONS.FAVORITES, DEFAULT_FAVORITES, true)}
                    
                    {/* Devices Section */}
                    {renderSection(SIDEBAR_SECTIONS.DEVICES, DEFAULT_DEVICES, false)}
                </div>
            </motion.div>
        </>
    )
}