'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollProgress {
  /**
   * Scroll progress as a percentage (0-100)
   */
  progress: number;
  /**
   * Current scroll position in pixels
   */
  scrollY: number;
  /**
   * Total scrollable height in pixels
   */
  scrollHeight: number;
  /**
   * Viewport height in pixels
   */
  viewportHeight: number;
  /**
   * Whether user is scrolling down
   */
  isScrollingDown: boolean;
  /**
   * Whether user is scrolling up
   */
  isScrollingUp: boolean;
  /**
   * Scroll velocity in pixels per millisecond
   */
  velocity: number;
}

interface UseScrollProgressOptions {
  /**
   * Whether to track scroll progress
   * @default true
   */
  enabled?: boolean;
  /**
   * Throttle delay in milliseconds
   * @default 16
   */
  throttleMs?: number;
  /**
   * Element to track scroll progress for (defaults to window)
   */
  element?: HTMLElement | null;
  /**
   * Whether to include velocity calculations
   * @default true
   */
  includeVelocity?: boolean;
  /**
   * Whether to include direction tracking
   * @default true
   */
  includeDirection?: boolean;
  /**
   * Offset from top in pixels
   * @default 0
   */
  offset?: number;
}

/**
 * Custom hook for tracking scroll progress with various options
 * 
 * @param options Configuration options for scroll tracking
 * @returns Scroll progress data
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { progress, scrollY } = useScrollProgress();
 * 
 * // With custom element
 * const elementRef = useRef<HTMLDivElement>(null);
 * const { progress, isScrollingDown } = useScrollProgress({
 *   element: elementRef.current,
 *   throttleMs: 32
 * });
 * 
 * // With offset
 * const { progress } = useScrollProgress({
 *   offset: 100 // Start tracking 100px from top
 * });
 * ```
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}): ScrollProgress {
  const {
    enabled = true,
    throttleMs = 16,
    element = null,
    includeVelocity = true,
    includeDirection = true,
    offset = 0,
  } = options;

  const [scrollData, setScrollData] = useState<ScrollProgress>({
    progress: 0,
    scrollY: 0,
    scrollHeight: 0,
    viewportHeight: 0,
    isScrollingDown: false,
    isScrollingUp: false,
    velocity: 0,
  });

  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const throttleRef = useRef<number | null>(null);

  const calculateScrollProgress = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    const isWindow = !element;
    
    let scrollY: number;
    let scrollHeight: number;
    let viewportHeight: number;

    if (isWindow) {
      scrollY = window.scrollY || window.pageYOffset;
      scrollHeight = document.documentElement.scrollHeight;
      viewportHeight = window.innerHeight;
    } else if (element) {
      scrollY = element.scrollTop;
      scrollHeight = element.scrollHeight;
      viewportHeight = element.clientHeight;
    } else {
      return;
    }

    // Apply offset
    const adjustedScrollY = Math.max(0, scrollY - offset);
    const adjustedScrollHeight = Math.max(1, scrollHeight - viewportHeight - offset);
    
    // Calculate progress (0-100)
    const progress = Math.min(100, Math.max(0, (adjustedScrollY / adjustedScrollHeight) * 100));

    // Calculate direction
    let isScrollingDown = false;
    let isScrollingUp = false;
    
    if (includeDirection) {
      isScrollingDown = scrollY > lastScrollY.current;
      isScrollingUp = scrollY < lastScrollY.current;
    }

    // Calculate velocity
    let velocity = 0;
    if (includeVelocity) {
      const deltaTime = now - lastTime.current;
      const deltaY = scrollY - lastScrollY.current;
      velocity = deltaTime > 0 ? deltaY / deltaTime : 0;
    }

    setScrollData({
      progress,
      scrollY,
      scrollHeight,
      viewportHeight,
      isScrollingDown,
      isScrollingUp,
      velocity,
    });

    lastScrollY.current = scrollY;
    lastTime.current = now;
  }, [enabled, element, includeVelocity, includeDirection, offset]);

  const throttledCalculateScrollProgress = useCallback(() => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    throttleRef.current = window.setTimeout(calculateScrollProgress, throttleMs);
  }, [calculateScrollProgress, throttleMs]);

  useEffect(() => {
    if (!enabled) return;

    const targetElement = element || window;
    
    // Initial calculation
    calculateScrollProgress();

    // Add scroll listener
    if (targetElement === window) {
      window.addEventListener('scroll', throttledCalculateScrollProgress, { passive: true });
      window.addEventListener('resize', calculateScrollProgress, { passive: true });
    } else {
      (targetElement as HTMLElement).addEventListener('scroll', throttledCalculateScrollProgress, { passive: true });
    }

    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      
      if (targetElement === window) {
        window.removeEventListener('scroll', throttledCalculateScrollProgress);
        window.removeEventListener('resize', calculateScrollProgress);
      } else {
        (targetElement as HTMLElement).removeEventListener('scroll', throttledCalculateScrollProgress);
      }
    };
  }, [enabled, element, throttledCalculateScrollProgress, calculateScrollProgress]);

  return scrollData;
}

/**
 * Hook for tracking scroll progress of a specific element
 * 
 * @param elementRef Ref to the element to track
 * @param options Scroll progress options
 * @returns Scroll progress data for the element
 */
export function useElementScrollProgress(
  elementRef: React.RefObject<HTMLElement>,
  options: Omit<UseScrollProgressOptions, 'element'> = {}
) {
  return useScrollProgress({
    ...options,
    element: elementRef.current,
  });
}

/**
 * Hook for tracking when an element enters/exits the viewport
 * 
 * @param elementRef Ref to the element to track
 * @param options Intersection options
 * @returns Visibility and progress data
 */
export function useScrollVisibility(
  elementRef: React.RefObject<HTMLElement>,
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [visibilityProgress, setVisibilityProgress] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        const progress = entry.intersectionRatio;
        
        setIsVisible(visible);
        setVisibilityProgress(progress);
        
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, threshold, rootMargin, hasBeenVisible]);

  return {
    isVisible: triggerOnce ? hasBeenVisible : isVisible,
    hasBeenVisible,
    visibilityProgress,
  };
}

/**
 * Hook for tracking scroll progress between two points
 * 
 * @param startY Start position in pixels
 * @param endY End position in pixels
 * @param options Scroll progress options
 * @returns Progress between the two points (0-100)
 */
export function useScrollProgressBetween(
  startY: number,
  endY: number,
  options: UseScrollProgressOptions = {}
) {
  const { scrollY } = useScrollProgress(options);
  
  const progress = Math.min(100, Math.max(0, ((scrollY - startY) / (endY - startY)) * 100));
  
  return {
    progress,
    isInRange: scrollY >= startY && scrollY <= endY,
    isBeforeRange: scrollY < startY,
    isAfterRange: scrollY > endY,
  };
}

/**
 * Hook for tracking scroll progress with easing
 * 
 * @param options Scroll progress options with easing
 * @returns Eased scroll progress
 */
export function useEasedScrollProgress(
  options: UseScrollProgressOptions & {
    /**
     * Easing function to apply to progress
     * @default 'easeOutCubic'
     */
    easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  } = {}
) {
  const { easing = 'easeOutCubic', ...scrollOptions } = options;
  const scrollData = useScrollProgress(scrollOptions);
  
  const easingFunctions = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  };
  
  const easedProgress = easingFunctions[easing](scrollData.progress / 100) * 100;
  
  return {
    ...scrollData,
    progress: easedProgress,
    rawProgress: scrollData.progress,
  };
}

/**
 * Hook for tracking scroll direction with debouncing
 * 
 * @param delay Debounce delay in milliseconds
 * @param options Scroll progress options
 * @returns Debounced scroll direction
 */
export function useDebouncedScrollDirection(
  delay: number = 100,
  options: UseScrollProgressOptions = {}
) {
  const { isScrollingDown, isScrollingUp } = useScrollProgress(options);
  const [debouncedDirection, setDebouncedDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isScrollingDown || isScrollingUp) {
      setDebouncedDirection(isScrollingDown ? 'down' : 'up');
      
      timeoutRef.current = window.setTimeout(() => {
        setDebouncedDirection('idle');
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isScrollingDown, isScrollingUp, delay]);

  return debouncedDirection;
}

export default useScrollProgress;