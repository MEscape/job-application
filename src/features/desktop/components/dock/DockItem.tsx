"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { DockAppState } from '@/features/desktop/hooks/useDock';
import { DOCK_ITEM_SIZE, RUNNING_INDICATOR_SIZE } from '@/features/desktop/constants/dock';

interface DockItemProps {
    app: DockAppState;
    onClick: (app: DockAppState) => void;
    index: number;
    hoveredIndex: number | null;
    onHover: (index: number | null) => void;
}

export const DockItem: React.FC<DockItemProps> = ({
  app,
  onClick,
  index,
  hoveredIndex,
  onHover
}) => {
    const { icon: Icon, title, gradient, windowInfo } = app;
    const { isRunning, isFocused } = windowInfo;
    const isHovered = hoveredIndex === index;

    // Calculate magnification effect based on distance from hovered item
    const getMagnification = () => {
        if (hoveredIndex === null) return 1;
        const distance = Math.abs(index - hoveredIndex);
        if (distance === 0) return 1.3; // Main hovered item
        if (distance === 1) return 1.2; // Adjacent items
        if (distance === 2) return 1.1; // Second adjacent items
        return 1; // All other items
    };

    const magnification = getMagnification();

    return (
        <div className="relative flex flex-col items-center">
            {/* App Icon */}
            <motion.button
                initial={{ scale: 0, y: 100, opacity: 0 }}
                animate={{
                    scale: magnification,
                    y: isHovered ? -12 : 0,
                    opacity: 1,
                    transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                    }
                }}
                whileTap={{
                    scale: magnification * 0.9,
                    transition: {
                        duration: 0.1,
                        type: "spring",
                        stiffness: 500
                    }
                }}
                onClick={() => onClick(app)}
                onMouseEnter={() => onHover(index)}
                onMouseLeave={() => onHover(null)}
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                style={{
                    width: DOCK_ITEM_SIZE,
                    height: DOCK_ITEM_SIZE,
                    transformOrigin: 'bottom center'
                }}
                title={title}
                aria-label={`${title} - ${app.clickAction}`}
            >
                {/* Enhanced Shadow */}
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                        boxShadow: isFocused
                            ? '0 0 0 3px rgba(59, 130, 246, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)'
                            : isHovered
                                ? '0 12px 30px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)'
                                : '0 6px 15px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: { duration: 0.2 }
                    }}
                    style={{ pointerEvents: 'none' }}
                />

                {/* App Background with Realistic Gradient */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl`}
                    style={{
                        background: gradient.includes('gray')
                            ? 'linear-gradient(135deg, #6B7280 0%, #374151 50%, #1F2937 100%)'
                            : gradient.includes('blue')
                                ? 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)'
                                : gradient.includes('orange')
                                    ? 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
                                    : gradient.includes('pink')
                                        ? 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #DB2777 100%)'
                                        : gradient.includes('yellow')
                                            ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)'
                                            : gradient.includes('purple')
                                                ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)'
                                                : 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)'
                    }}
                />

                {/* Realistic Glass Layers */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-black/10" />

                {/* Inner Border for Depth */}
                <div className="absolute inset-0.5 rounded-2xl border border-white/30" />
                <div className="absolute inset-0 rounded-2xl border border-white/10" />

                {/* Icon with Enhanced Effects */}
                <motion.div
                    className="relative z-10 w-full h-full flex items-center justify-center"
                    animate={{
                        scale: isHovered ? 1.1 : 1,
                        transition: { duration: 0.2 }
                    }}
                >
                    <Icon
                        className="w-8 h-8 text-white"
                        style={{
                            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6))',
                        }}
                    />
                </motion.div>

                {/* Hover Glow Effect */}
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                        background: isHovered
                            ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%)'
                            : 'transparent',
                        transition: { duration: 0.3 }
                    }}
                    style={{ pointerEvents: 'none' }}
                />
            </motion.button>

            {/* Enhanced Running Indicator */}
            {isRunning && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        y: magnification > 1 ? -4 : 0,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }
                    }}
                    exit={{
                        scale: 0,
                        opacity: 0,
                        transition: { duration: 0.15 }
                    }}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                    style={{ transformOrigin: 'center' }}
                >
                    <div
                        className="bg-white rounded-full relative"
                        style={{
                            width: RUNNING_INDICATOR_SIZE + 2,
                            height: RUNNING_INDICATOR_SIZE + 2,
                            boxShadow: `
                                0 2px 4px rgba(0, 0, 0, 0.3),
                                inset 0 1px 0 rgba(255, 255, 255, 0.9),
                                inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                                0 0 0 1px rgba(0, 0, 0, 0.1)
                            `
                        }}
                    >
                        {/* Inner highlight */}
                        <div
                            className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white to-gray-100"
                        />
                    </div>
                </motion.div>
            )}

            {/* Tooltip */}
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    y: isHovered ? -10 : 10,
                    scale: isHovered ? 1 : 0.8,
                    transition: {
                        duration: 0.2,
                    }
                }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-none"
            >
                <div
                    className="px-3 py-1.5 rounded-lg text-white text-sm font-medium whitespace-nowrap"
                    style={{
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    {title}
                    <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid rgba(0, 0, 0, 0.85)'
                        }}
                    />
                </div>
            </motion.div>
        </div>
    );
};