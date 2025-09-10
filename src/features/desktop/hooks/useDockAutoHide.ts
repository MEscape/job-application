"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWindowStore } from './useWindowStore';

export interface DockAutoHideState {
    isVisible: boolean;
    isHovered: boolean;
    shouldAutoHide: boolean;
}

export const useDockAutoHide = () => {
    const { hasFullscreenWindow } = useWindowStore();
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mousePositionRef = useRef({ x: 0, y: 0 });
    
    const shouldAutoHide = hasFullscreenWindow();
    
    // Clear any pending timeouts
    const clearTimeouts = useCallback(() => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
        }
    }, []);
    
    // Handle dock visibility based on fullscreen state
    useEffect(() => {
        if (!shouldAutoHide) {
            // No fullscreen windows - always show dock
            clearTimeouts();
            setIsVisible(true);
        } else {
            // Fullscreen window exists - hide dock unless hovered
            if (!isHovered) {
                hideTimeoutRef.current = setTimeout(() => {
                    setIsVisible(false);
                }, 300); // Small delay before hiding
            }
        }
        
        return clearTimeouts;
    }, [shouldAutoHide, isHovered, clearTimeouts]);
    
    // Mouse movement detection for bottom edge hover
    useEffect(() => {
        if (!shouldAutoHide) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            mousePositionRef.current = { x: e.clientX, y: e.clientY };
            
            const windowHeight = window.innerHeight;
            const bottomThreshold = 50; // Pixels from bottom to trigger show
            const isNearBottom = e.clientY >= windowHeight - bottomThreshold;
            
            if (isNearBottom && !isVisible) {
                clearTimeouts();
                showTimeoutRef.current = setTimeout(() => {
                    setIsVisible(true);
                }, 100); // Quick show on hover
            }
        };
        
        const handleMouseLeave = () => {
            if (shouldAutoHide && !isHovered) {
                clearTimeouts();
                hideTimeoutRef.current = setTimeout(() => {
                    setIsVisible(false);
                }, 1000); // Delay before hiding when mouse leaves
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeouts();
        };
    }, [shouldAutoHide, isVisible, isHovered, clearTimeouts]);
    
    // Handle dock hover state
    const handleDockMouseEnter = useCallback(() => {
        setIsHovered(true);
        clearTimeouts();
        if (shouldAutoHide) {
            setIsVisible(true);
        }
    }, [shouldAutoHide, clearTimeouts]);
    
    const handleDockMouseLeave = useCallback(() => {
        setIsHovered(false);
        if (shouldAutoHide) {
            clearTimeouts();
            hideTimeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 1000); // Delay before hiding after mouse leaves dock
        }
    }, [shouldAutoHide, clearTimeouts]);
    
    return {
        isVisible,
        shouldAutoHide,
        isHovered,
        handleDockMouseEnter,
        handleDockMouseLeave,
    };
};