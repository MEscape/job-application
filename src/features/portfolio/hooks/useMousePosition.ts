'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface UseMousePositionOptions {
  /**
   * Whether to track mouse position
   * @default true
   */
  enabled?: boolean;
  /**
   * Throttle delay in milliseconds
   * @default 16
   */
  throttleMs?: number;
  /**
   * Whether to include velocity calculations
   * @default false
   */
  includeVelocity?: boolean;
  /**
   * Whether to track relative to a specific element
   * @default false
   */
  relative?: boolean;
  /**
   * Element to track relative to (if relative is true)
   */
  element?: HTMLElement | null;
  /**
   * Whether to normalize coordinates (0-1 range)
   * @default false
   */
  normalize?: boolean;
}

interface MousePositionWithVelocity extends MousePosition {
  velocityX: number;
  velocityY: number;
  speed: number;
  angle: number;
}

type MousePositionResult<T extends UseMousePositionOptions> = T['includeVelocity'] extends true
  ? MousePositionWithVelocity
  : MousePosition;

/**
 * Custom hook for tracking mouse position with various options
 * 
 * @param options Configuration options for mouse tracking
 * @returns Mouse position data with optional velocity information
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { x, y } = useMousePosition();
 * 
 * // With velocity tracking
 * const { x, y, velocityX, velocityY, speed } = useMousePosition({
 *   includeVelocity: true,
 *   throttleMs: 16
 * });
 * 
 * // Relative to an element
 * const elementRef = useRef<HTMLDivElement>(null);
 * const { x, y } = useMousePosition({
 *   relative: true,
 *   element: elementRef.current,
 *   normalize: true
 * });
 * ```
 */
export function useMousePosition<T extends UseMousePositionOptions>(
  options: T = {} as T
): MousePositionResult<T> {
  const {
    enabled = true,
    throttleMs = 16,
    includeVelocity = false,
    relative = false,
    element = null,
    normalize = false,
  } = options;

  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({
    velocityX: 0,
    velocityY: 0,
    speed: 0,
    angle: 0,
  });

  const lastPosition = useRef<MousePosition>({ x: 0, y: 0 });
  const lastTime = useRef<number>(Date.now());
  const throttleRef = useRef<number | null>(null);

  const calculateVelocity = useCallback(
    (newX: number, newY: number) => {
      const now = Date.now();
      const deltaTime = now - lastTime.current;
      
      if (deltaTime === 0) return;

      const deltaX = newX - lastPosition.current.x;
      const deltaY = newY - lastPosition.current.y;
      
      const velocityX = deltaX / deltaTime;
      const velocityY = deltaY / deltaTime;
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      setVelocity({ velocityX, velocityY, speed, angle });
      
      lastPosition.current = { x: newX, y: newY };
      lastTime.current = now;
    },
    []
  );

  const updatePosition = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      let x = event.clientX;
      let y = event.clientY;

      // Handle relative positioning
      if (relative && element) {
        const rect = element.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;

        // Normalize coordinates if requested
        if (normalize) {
          x = x / rect.width;
          y = y / rect.height;
        }
      } else if (normalize) {
        // Normalize to viewport if not relative
        x = x / window.innerWidth;
        y = y / window.innerHeight;
      }

      // Throttle updates
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }

      throttleRef.current = window.setTimeout(() => {
        setPosition({ x, y });
        
        if (includeVelocity) {
          calculateVelocity(x, y);
        }
      }, throttleMs);
    },
    [enabled, relative, element, normalize, throttleMs, includeVelocity, calculateVelocity]
  );

  useEffect(() => {
    if (!enabled) return;

    const targetElement = relative && element ? element : window;
    
    // Add event listener
    if (targetElement === window) {
      window.addEventListener('mousemove', updatePosition, { passive: true });
    } else {
      (targetElement as HTMLElement).addEventListener('mousemove', updatePosition, { passive: true });
    }

    // Cleanup function
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      
      if (targetElement === window) {
        window.removeEventListener('mousemove', updatePosition);
      } else {
        (targetElement as HTMLElement).removeEventListener('mousemove', updatePosition);
      }
    };
  }, [enabled, relative, element, updatePosition]);

  // Reset position when element changes
  useEffect(() => {
    if (relative && element) {
      setPosition({ x: 0, y: 0 });
      if (includeVelocity) {
        setVelocity({ velocityX: 0, velocityY: 0, speed: 0, angle: 0 });
        lastPosition.current = { x: 0, y: 0 };
        lastTime.current = Date.now();
      }
    }
  }, [element, relative, includeVelocity]);

  // Return appropriate data based on options
  if (includeVelocity) {
    return {
      ...position,
      ...velocity,
    } as MousePositionResult<T>;
  }

  return position as MousePositionResult<T>;
}

/**
 * Hook for tracking mouse position with smooth interpolation
 * 
 * @param options Configuration options
 * @returns Smoothed mouse position
 */
export function useSmoothMousePosition(options: UseMousePositionOptions & {
  /**
   * Smoothing factor (0-1, where 1 is no smoothing)
   * @default 0.1
   */
  smoothing?: number;
} = {}) {
  const { smoothing = 0.1, ...mouseOptions } = options;
  const rawPosition = useMousePosition(mouseOptions);
  const [smoothPosition, setSmoothPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    setSmoothPosition(prev => ({
      x: prev.x + (rawPosition.x - prev.x) * smoothing,
      y: prev.y + (rawPosition.y - prev.y) * smoothing,
    }));
    
    animationRef.current = requestAnimationFrame(animate);
  }, [rawPosition.x, rawPosition.y, smoothing]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return smoothPosition;
}

/**
 * Hook for tracking mouse position with debounced updates
 * 
 * @param delay Debounce delay in milliseconds
 * @param options Mouse position options
 * @returns Debounced mouse position
 */
export function useDebouncedMousePosition(
  delay: number = 100,
  options: UseMousePositionOptions = {}
) {
  const rawPosition = useMousePosition({ ...options, throttleMs: 0 });
  const [debouncedPosition, setDebouncedPosition] = useState<MousePosition>(rawPosition);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setDebouncedPosition(rawPosition);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [rawPosition.x, rawPosition.y, delay]);

  return debouncedPosition;
}

/**
 * Hook for tracking mouse position within a specific area
 * 
 * @param bounds Boundary rectangle
 * @param options Mouse position options
 * @returns Mouse position clamped to bounds
 */
export function useBoundedMousePosition(
  bounds: { x: number; y: number; width: number; height: number },
  options: UseMousePositionOptions = {}
) {
  const rawPosition = useMousePosition(options);
  
  const boundedPosition = {
    x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, rawPosition.x)),
    y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, rawPosition.y)),
  };

  return boundedPosition;
}

/**
 * Hook for tracking mouse distance from a point
 * 
 * @param target Target point
 * @param options Mouse position options
 * @returns Distance and angle from target
 */
export function useMouseDistance(
  target: MousePosition,
  options: UseMousePositionOptions = {}
) {
  const position = useMousePosition(options);
  
  const deltaX = position.x - target.x;
  const deltaY = position.y - target.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
  return {
    distance,
    angle,
    deltaX,
    deltaY,
    ...position,
  };
}

export default useMousePosition;