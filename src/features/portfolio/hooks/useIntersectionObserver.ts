'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface IntersectionObserverEntry {
  /**
   * Whether the element is currently intersecting
   */
  isIntersecting: boolean;
  /**
   * Ratio of intersection (0-1)
   */
  intersectionRatio: number;
  /**
   * Bounding rectangle of the intersection
   */
  intersectionRect: DOMRectReadOnly;
  /**
   * Bounding rectangle of the target element
   */
  boundingClientRect: DOMRectReadOnly;
  /**
   * Bounding rectangle of the root element
   */
  rootBounds: DOMRectReadOnly | null;
  /**
   * Target element
   */
  target: Element;
  /**
   * Timestamp when the intersection occurred
   */
  time: number;
}

interface UseIntersectionObserverOptions {
  /**
   * Element that is used as the viewport for checking visibility
   * @default null (viewport)
   */
  root?: Element | null;
  /**
   * Margin around the root
   * @default '0px'
   */
  rootMargin?: string;
  /**
   * Threshold(s) at which to trigger the callback
   * @default 0
   */
  threshold?: number | number[];
  /**
   * Whether to trigger only once
   * @default false
   */
  triggerOnce?: boolean;
  /**
   * Whether to start observing immediately
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback function when intersection changes
   */
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  /**
   * Callback function when element enters viewport
   */
  onEnter?: (entry: IntersectionObserverEntry) => void;
  /**
   * Callback function when element exits viewport
   */
  onExit?: (entry: IntersectionObserverEntry) => void;
}

interface IntersectionResult {
  /**
   * Whether the element is currently intersecting
   */
  isIntersecting: boolean;
  /**
   * Whether the element has ever been intersecting
   */
  hasIntersected: boolean;
  /**
   * Ratio of intersection (0-1)
   */
  intersectionRatio: number;
  /**
   * Latest intersection entry
   */
  entry: IntersectionObserverEntry | null;
  /**
   * Function to manually trigger observation
   */
  observe: () => void;
  /**
   * Function to stop observation
   */
  unobserve: () => void;
}

/**
 * Custom hook for using Intersection Observer API
 * 
 * @param elementRef Ref to the element to observe
 * @param options Configuration options for intersection observer
 * @returns Intersection data and control functions
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const elementRef = useRef<HTMLDivElement>(null);
 * const { isIntersecting, intersectionRatio } = useIntersectionObserver(elementRef);
 * 
 * // With callbacks
 * const { isIntersecting } = useIntersectionObserver(elementRef, {
 *   threshold: 0.5,
 *   onEnter: (entry) => console.log('Element entered viewport'),
 *   onExit: (entry) => console.log('Element exited viewport'),
 * });
 * 
 * // Trigger once
 * const { hasIntersected } = useIntersectionObserver(elementRef, {
 *   triggerOnce: true,
 *   threshold: 0.1
 * });
 * ```
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): IntersectionResult {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    enabled = true,
    onIntersect,
    onEnter,
    onExit,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const wasIntersectingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [intersectionEntry] = entries;
      const isCurrentlyIntersecting = intersectionEntry.isIntersecting;
      const currentRatio = intersectionEntry.intersectionRatio;
      
      setIsIntersecting(isCurrentlyIntersecting);
      setIntersectionRatio(currentRatio);
      setEntry(intersectionEntry);
      
      // Track if element has ever intersected
      if (isCurrentlyIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
      
      // Call intersection callback
      if (onIntersect) {
        onIntersect(intersectionEntry);
      }
      
      // Call enter/exit callbacks
      if (isCurrentlyIntersecting && !wasIntersectingRef.current && onEnter) {
        onEnter(intersectionEntry);
      } else if (!isCurrentlyIntersecting && wasIntersectingRef.current && onExit) {
        onExit(intersectionEntry);
      }
      
      wasIntersectingRef.current = isCurrentlyIntersecting;
      
      // Unobserve if triggerOnce and has intersected
      if (triggerOnce && isCurrentlyIntersecting && observerRef.current) {
        observerRef.current.unobserve(intersectionEntry.target);
      }
    },
    [onIntersect, onEnter, onExit, triggerOnce, hasIntersected]
  );

  const observe = useCallback(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    observerRef.current.observe(element);
  }, [elementRef, enabled, handleIntersection, root, rootMargin, threshold]);

  const unobserve = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    observe();
    
    return () => {
      unobserve();
    };
  }, [observe, unobserve]);

  return {
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
    hasIntersected,
    intersectionRatio,
    entry,
    observe,
    unobserve,
  };
}

/**
 * Hook for observing multiple elements
 * 
 * @param elementsRef Array of refs to observe
 * @param options Intersection observer options
 * @returns Map of intersection results by element
 */
export function useMultipleIntersectionObserver(
  elementsRef: React.RefObject<Element>[],
  options: UseIntersectionObserverOptions = {}
) {
  const [intersections, setIntersections] = useState<Map<Element, IntersectionResult>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    enabled = true,
    onIntersect,
    onEnter,
    onExit,
  } = options;

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setIntersections(prev => {
        const newMap = new Map(prev);
        
        entries.forEach(entry => {
          const element = entry.target;
          const currentData = newMap.get(element) || {
            isIntersecting: false,
            hasIntersected: false,
            intersectionRatio: 0,
            entry: null,
            observe: () => {},
            unobserve: () => {},
          };
          
          const isCurrentlyIntersecting = entry.isIntersecting;
          const hasEverIntersected = currentData.hasIntersected || isCurrentlyIntersecting;
          
          newMap.set(element, {
            ...currentData,
            isIntersecting: triggerOnce ? hasEverIntersected : isCurrentlyIntersecting,
            hasIntersected: hasEverIntersected,
            intersectionRatio: entry.intersectionRatio,
            entry,
          });
          
          // Call callbacks
          if (onIntersect) onIntersect(entry);
          if (isCurrentlyIntersecting && !currentData.isIntersecting && onEnter) onEnter(entry);
          if (!isCurrentlyIntersecting && currentData.isIntersecting && onExit) onExit(entry);
          
          // Unobserve if triggerOnce
          if (triggerOnce && isCurrentlyIntersecting && observerRef.current) {
            observerRef.current.unobserve(element);
          }
        });
        
        return newMap;
      });
    },
    [onIntersect, onEnter, onExit, triggerOnce]
  );

  useEffect(() => {
    if (!enabled) return;

    const elements = elementsRef
      .map(ref => ref.current)
      .filter((element): element is Element => element !== null);

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    elements.forEach(element => {
      observerRef.current!.observe(element);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementsRef, enabled, handleIntersection, root, rootMargin, threshold]);

  return intersections;
}

/**
 * Hook for lazy loading with intersection observer
 * 
 * @param elementRef Ref to the element to lazy load
 * @param options Intersection observer options
 * @returns Loading state and trigger function
 */
export function useLazyLoad(
  elementRef: React.RefObject<Element>,
  options: UseIntersectionObserverOptions & {
    /**
     * Whether to load immediately without waiting for intersection
     * @default false
     */
    loadImmediately?: boolean;
  } = {}
) {
  const { loadImmediately = false, ...intersectionOptions } = options;
  const [hasLoaded, setHasLoaded] = useState(loadImmediately);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isIntersecting } = useIntersectionObserver(elementRef, {
    ...intersectionOptions,
    triggerOnce: true,
    onEnter: () => {
      if (!hasLoaded) {
        setIsLoading(true);
        setHasLoaded(true);
      }
    },
  });

  const finishLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (loadImmediately) {
      setHasLoaded(true);
    }
  }, [loadImmediately]);

  return {
    shouldLoad: hasLoaded,
    isLoading,
    hasIntersected: isIntersecting,
    finishLoading,
  };
}

/**
 * Hook for scroll-triggered animations
 * 
 * @param elementRef Ref to the element to animate
 * @param options Animation and intersection options
 * @returns Animation state
 */
export function useScrollAnimation(
  elementRef: React.RefObject<Element>,
  options: UseIntersectionObserverOptions & {
    /**
     * Animation delay in milliseconds
     * @default 0
     */
    delay?: number;
    /**
     * Animation duration in milliseconds
     * @default 600
     */
    duration?: number;
    /**
     * Whether to animate out when leaving viewport
     * @default false
     */
    animateOut?: boolean;
  } = {}
) {
  const {
    delay = 0,
    duration = 600,
    animateOut = false,
    ...intersectionOptions
  } = options;
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const { isIntersecting } = useIntersectionObserver(elementRef, {
    ...intersectionOptions,
    onEnter: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        setIsAnimating(true);
        setHasAnimated(true);
      }, delay);
    },
    onExit: () => {
      if (animateOut) {
        setIsAnimating(false);
      }
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    hasAnimated,
    shouldAnimate: isAnimating || (hasAnimated && !animateOut),
    isIntersecting,
  };
}

/**
 * Hook for progressive image loading
 * 
 * @param imageRef Ref to the image element
 * @param src Image source URL
 * @param options Intersection and loading options
 * @returns Image loading state
 */
export function useProgressiveImage(
  imageRef: React.RefObject<HTMLImageElement>,
  src: string,
  options: UseIntersectionObserverOptions & {
    /**
     * Placeholder image source
     */
    placeholder?: string;
    /**
     * Whether to use blur effect during loading
     * @default true
     */
    useBlur?: boolean;
  } = {}
) {
  const { placeholder, useBlur = true, ...intersectionOptions } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');

  const { isIntersecting } = useIntersectionObserver(imageRef, {
    ...intersectionOptions,
    triggerOnce: true,
  });

  useEffect(() => {
    if (!isIntersecting || isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    img.src = src;
  }, [isIntersecting, src, isLoaded, isLoading]);

  return {
    src: currentSrc,
    isLoaded,
    isLoading,
    error,
    shouldBlur: useBlur && !isLoaded,
    hasIntersected: isIntersecting,
  };
}

export default useIntersectionObserver;