"use client"

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FinderItem } from "../../constants/finder";
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Archive, 
  Code, 
  File,
  Trash2,
  HardDrive,
  Globe
} from "lucide-react";
import { formatFileSize } from "../../utils/finderHelper";
interface IconProps {
  item: FinderItem;
  isSelected: boolean;
  isSystemItem: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  size?: {
    width: number;
    height: number;
  };
}

const getFileIcon = (item: FinderItem, isSystemItem: boolean) => {
  if (isSystemItem) {
    if (item.name.toLowerCase().includes('trash')) {
      return <Trash2 className="w-8 h-8 text-gray-600" />;
    }
    if (item.name.toLowerCase().includes('macintosh') || item.name.toLowerCase().includes('disk')) {
      return <HardDrive className="w-8 h-8 text-gray-600" />;
    }
    if (item.name.toLowerCase().includes('safari')) {
      return <Globe className="w-8 h-8 text-blue-500" />;
    }
  }

  const iconColors = {
    folder: "text-blue-500",
    document: "text-red-500", 
    image: "text-green-500",
    video: "text-purple-500",
    audio: "text-pink-500",
    archive: "text-orange-500",
    code: "text-yellow-500",
    other: "text-gray-600",
  };

  const iconComponents: Record<string, React.ComponentType<any>> = {
    folder: Folder,
    document: FileText,
    image: ImageIcon,
    video: Film,
    audio: Music,
    archive: Archive,
    code: Code,
    other: File
  };

  const IconComponent = iconComponents[item.type] || File;
  const colorClass = iconColors[item.type] || 'text-gray-600';

  return (
    <IconComponent 
      className={`w-8 h-8 ${colorClass}`} 
    />
  );
};

export function Icon({
                       item,
                       isSelected,
                       isSystemItem,
                       onClick,
                       onDoubleClick,
                       size = { width: 80, height: 80 }
                     }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8
        });
        setShowTooltip(true);
      }
    }, 800);
  };

  return (
      <>
        <motion.div
            ref={containerRef}
            className="select-none flex flex-col items-center justify-center p-1 relative"
            style={{
              width: size.width,
              height: size.height,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => {
              setIsHovered(false);
              setShowTooltip(false);
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
              }
            }}
        >
          {/* Selection Highlight */}
          <AnimatePresence>
            {isSelected && (
                <motion.div
                    className="absolute inset-0 bg-blue-500/20 rounded-lg border border-blue-400/60"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                />
            )}
          </AnimatePresence>

          {/* Main Icon Container */}
          <div className="flex flex-col items-center justify-center h-full p-1">
            {/* Icon Background & Icon */}
            <motion.div
                className={`
              flex items-center justify-center
              w-12 h-12 mb-1 rounded-lg
              transition-all duration-200
              ${isHovered && !isSystemItem ? 'bg-white/10' : 'bg-white/5'}
              shadow-md
            `}
                animate={{
                  scale: isHovered && !isSystemItem ? 1.05 : 1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {getFileIcon(item, isSystemItem)}
            </motion.div>

            {/* Label */}
            <div className="text-center w-full max-w-[75px]">
              <motion.div
                  className={`
                text-xs font-medium leading-tight
                px-1 rounded-md
                max-w-full
                transition-all duration-200
                ${isSelected
                      ? 'text-white bg-blue-600 shadow-sm'
                      : 'text-white'
                  }
                opacity-100
              `}
              >
                <div className="truncate text-center">
                  {item.name}
                </div>
              </motion.div>

              {/* File Size */}
              {item.type !== 'folder' && item.size && (
                  <div className="text-xs text-white/60 truncate">
                    {formatFileSize(item.size)}
                  </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tooltip - Now rendered as a portal with fixed positioning */}
        <AnimatePresence>
          {showTooltip && !isSystemItem && (
              <motion.div
                  className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-900/90 backdrop-blur-sm rounded-md shadow-lg pointer-events-none"
                  style={{
                    left: tooltipPosition.x,
                    top: tooltipPosition.y,
                    transform: 'translateX(-50%)'
                  }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
              >
                <div className="text-center">
                  <div className="font-medium">{item.name}</div>
                  {item.type !== 'folder' && item.size && (
                      <div className="text-gray-300">{formatFileSize(item.size)}</div>
                  )}
                  <div className="text-gray-400 capitalize">{item.type}</div>
                </div>
                {/* Tooltip Arrow */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
              </motion.div>
          )}
        </AnimatePresence>
      </>
  );
}