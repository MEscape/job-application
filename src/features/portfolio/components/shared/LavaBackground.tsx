'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LavaBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  height?: string;
}

const BLOB_OPACITY = {
  main: 0.7,
  aura: 0.6,
  base: 1,
};

export const LavaBackground: React.FC<LavaBackgroundProps> = ({ children, className = "", height = "min-h-screen" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [lavaSubstances] = useState(() => {
    const substances: Array<{
      id: number;
      baseX: number;
      baseY: number;
      currentX: number;
      currentY: number;
      size: number;
      scaleX: number;
      scaleY: number;
      color: string;
      speed: number;
      phase: number;
      morphSpeed: number;
    }> = [];
    const count = 8;
    
    const cols = 4;
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      // Calculate base position with even spacing
      const x = 12.5 + (col * 25) + (Math.random() - 0.5) * 15;
      const y = 25 + (row * 50) + (Math.random() - 0.5) * 30;
      
      substances.push({
        id: i,
        baseX: x,
        baseY: y,
        currentX: x,
        currentY: y,
        size: 600 + Math.random() * 400,
        scaleX: 0.8 + Math.random() * 0.4,
        scaleY: 0.6 + Math.random() * 0.6,
        color: i % 3 === 0 ? 'purple' : i % 3 === 1 ? 'blue' : 'indigo',
        speed: 0.05 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        morphSpeed: 0.03 + Math.random() * 0.03
      });
    }
    
    return substances;
  });

  // Maus-Tracking relativ zum Container
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Nur updaten wenn Maus über Container ist
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          setMousePosition({ x, y });
          setIsMouseMoving(true);
          
          if (mouseTimeoutRef.current) {
            clearTimeout(mouseTimeoutRef.current);
          }
          mouseTimeoutRef.current = setTimeout(() => {
            setIsMouseMoving(false);
          }, 200);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        setIsMouseMoving(false);
      });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => {});
      }
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  // Blob-Tracking System
  const [blobPositions, setBlobPositions] = useState(() => 
    lavaSubstances.map(substance => ({
      id: substance.id,
      x: substance.baseX,
      y: substance.baseY,
      isTracked: false
    }))
  );

  // Animation Update
  useEffect(() => {
    if (!isClient) return;
    
    let animationId: number;
    
    const updateBlobs = () => {
      const time = Date.now() * 0.0002;

      const newPositions = lavaSubstances.map((substance, index) => {
        const baseOffsetX = Math.sin(time * substance.speed + substance.phase) * 8;
        const baseOffsetY = Math.cos(time * substance.speed * 0.6 + substance.phase) * 12;
        
        let targetX = substance.baseX + baseOffsetX;
        let targetY = substance.baseY + baseOffsetY;
        
        let isCurrentlyTracked = false;
        if (isMouseMoving) {
          const distanceX = mousePosition.x - targetX;
          const distanceY = mousePosition.y - targetY;
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          if (distance < 60) {
            const influence = Math.max(0, (60 - distance) / 60) * 0.5;
            targetX += distanceX * influence;
            targetY += distanceY * influence;
            isCurrentlyTracked = true;
          }
        }
        
        const currentPos = blobPositions[index];
        const smoothX = currentPos.x + (targetX - currentPos.x) * 0.08;
        const smoothY = currentPos.y + (targetY - currentPos.y) * 0.08;
        
        return {
          id: substance.id,
          x: Math.max(5, Math.min(95, smoothX)),
          y: Math.max(5, Math.min(95, smoothY)),
          isTracked: isCurrentlyTracked
        };
      });
      
      setBlobPositions(newPositions);
      
      animationId = requestAnimationFrame(updateBlobs);
    };

    animationId = requestAnimationFrame(updateBlobs);
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mousePosition.x, mousePosition.y, isMouseMoving, blobPositions, lavaSubstances, isClient]);

  // Farb-Klassen
  const getColorClasses = (color: string) => {
    const baseClasses = "absolute rounded-full";
    switch(color) {
      case 'purple':
        return `${baseClasses} bg-gradient-to-br from-purple-600/6 via-purple-500/3 to-transparent`;
      case 'blue':
        return `${baseClasses} bg-gradient-to-br from-blue-600/6 via-blue-500/3 to-transparent`;
      case 'indigo':
        return `${baseClasses} bg-gradient-to-br from-indigo-600/6 via-indigo-500/3 to-transparent`;
      default:
        return `${baseClasses} bg-gradient-to-br from-purple-600/6 via-purple-500/3 to-transparent`;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${height} ${className}`}
    >
      {/* Lava Blobs Container */}
      <div className="absolute inset-0 pointer-events-none">
        {!isClient && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-indigo-900/10" />
        )}
        {isClient && (
          <>
            {/* Lava-Blobs */}
            {blobPositions.map((position, index) => {
              const substance = lavaSubstances[index];
              return (
                <div
                  key={substance.id}
                  className={`${getColorClasses(substance.color)} ${
                    position.isTracked ? 'ring-2 ring-white/20' : ''
                  }`}
                  style={{
                    width: `${substance.size}px`,
                    height: `${substance.size}px`,
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(45px)',
                    borderRadius: '40% 60% 70% 30%',
                    opacity: BLOB_OPACITY.base,
                  }}
                />
              );
            })}
        
            {/* Glow-Layer */}
            {blobPositions.map((position, index) => {
              const substance = lavaSubstances[index];
              return (
                <div
                  key={`glow-${substance.id}`}
                  className={getColorClasses(substance.color)}
                  style={{
                    width: `${substance.size * 1.8}px`,
                    height: `${substance.size * 1.8}px`,
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(80px)',
                    opacity: BLOB_OPACITY.main,
                  }}
                />
              );
            })}
            
            {/* Aura-Layer -> first three */}
            {blobPositions.slice(0, 3).map((position, index) => {
              const substance = lavaSubstances[index];
              return (
                <div
                  key={`aura-${substance.id}`}
                  className={getColorClasses(substance.color)}
                  style={{
                    width: `${substance.size * 2.5}px`,
                    height: `${substance.size * 2.5}px`,
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(120px)',
                    opacity: BLOB_OPACITY.aura,
                  }}
                />
              );
            })}
          </>
        )}
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};