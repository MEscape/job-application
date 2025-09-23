"use client"

import React, { useRef, useCallback, useState, useEffect } from "react";
import { useDesktopStore } from "../../hooks/useDesktopStore";
import { useWindowStore } from "../../hooks/useWindowStore";
import { Finder } from "../finder/Finder";
import { PDFViewer } from "../pdf/PDFViewer";
import { VideoViewer } from "../video/VideoViewer";
import { ICON_SIZE } from "../../constants/grid";
import { Icon } from "./Icon";

interface DesktopProps {
  className?: string;
}

export function Desktop({ className = "" }: DesktopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  const {
    items,
    selectedItems,
    isLoading,
    error,
    selectItem,
    clearSelection,
    isSystemItem
  } = useDesktopStore();

  const {
    addWindow
  } = useWindowStore();

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle item selection
  const handleItemClick = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const multiSelect = e.metaKey || e.ctrlKey;
    selectItem(itemId, multiSelect);
  }, [selectItem]);

  // Handle item double-click
  const handleItemDoubleClick = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Don't handle double-clicks on system items
    if (isSystemItem(itemId)) return;

    const item = items.find(i => i.id === itemId);
    // Check if item exists
    if (!item) {
      console.error(`Item not found: ${itemId}`);
      return;
    }

    if (item.type === 'folder') {
      // Open finder window with the folder path
      addWindow({
        title: item.name,
        content: <Finder initialPath={item.path} />,
        size: { width: 800, height: 600 }
      });
    } else if (item.name.split('.').pop() === 'pdf') {
      console.log('Opening PDF:', item.name);
      addWindow({
        title: item.name,
        content: <PDFViewer fileId={item.id} fileName={item.name} />,
        size: { width: 900, height: 700 }
      });
    } else if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(item.name.split('.').pop()?.toLowerCase() || '')) {
      console.log('Opening Video:', item.name);
      addWindow({
        title: item.name,
        content: <VideoViewer fileId={item.id} fileName={item.name} />,
        size: { width: 1000, height: 700 }
      });
    }
  }, [items, isSystemItem, addWindow]);

  // Handle clicking on empty space
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  // Loading skeleton component
  const LoadingSkeleton = () => {
    return (
        <div className={`absolute inset-0 overflow-hidden select-none flex flex-wrap content-start gap-5 p-5 ${className}`}>
          {Array.from({ length: 12 }).map((_, index) => (
              <div
                  key={index}
                  className="select-none flex flex-col items-center justify-center p-1"
                  style={{
                    width: ICON_SIZE.width,
                    height: ICON_SIZE.height,
                  }}
              >
                {/* Main Icon Container */}
                <div className="flex flex-col items-center justify-center h-full p-1">
                  {/* Icon Background & Icon */}
                  <div className="w-12 h-12 mb-1 bg-white/10 rounded-lg animate-pulse" />
                  {/* Label */}
                  <div className="text-center w-full">
                    <div className="w-16 h-3 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
          ))}
        </div>
    );
  };

  // Error state component
  const ErrorState = () => (
      <div className={`absolute inset-0 overflow-hidden select-none flex flex-wrap content-start gap-5 p-5 ${className}`} onClick={handleContainerClick}>
        {/* Show system items even on error */}
        {items.map((item) => {
          if (!isSystemItem(item.id)) return null;

          const isSystem = isSystemItem(item.id);

          return (
              <Icon
                  key={item.id}
                  item={item}
                  isSelected={false}
                  isSystemItem={isSystem}
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={(e) => handleItemDoubleClick(item.id, e)}
                  size={ICON_SIZE}
              />
          );
        })}

        {/* Subtle error indicator */}
        <div className="absolute top-4 right-4 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2 backdrop-blur-sm">
          <div className="text-red-300 text-sm font-medium">Unable to load files</div>
        </div>
      </div>
  );

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
        <div className={`absolute inset-0 overflow-hidden select-none flex flex-wrap content-start gap-5 p-5 ${className}`}>
          {/* Simple placeholder that matches server rendering */}
        </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
      <div
          ref={containerRef}
          className={`absolute inset-0 overflow-hidden select-none flex flex-wrap content-start gap-5 p-5 ${className}`}
          onClick={handleContainerClick}
      >
        {items.map((item) => {
          const isSelected = selectedItems.has(item.id);
          const isSystem = isSystemItem(item.id);

          return (
              <Icon
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  isSystemItem={isSystem}
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={(e) => handleItemDoubleClick(item.id, e)}
                  size={ICON_SIZE}
              />
          );
        })}
      </div>
  );
}

export default Desktop;