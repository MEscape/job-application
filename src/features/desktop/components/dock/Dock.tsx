"use client"

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDock } from '@/features/desktop/hooks/useDock';
import { useDockAutoHide } from '@/features/desktop/hooks/useDockAutoHide';
import { DockItem } from './DockItem';
import { DOCK_HEIGHT, DOCK_GAP } from '@/features/desktop/constants/dock';

export const Dock: React.FC = () => {
    const { dockApps, handleDockAppClick, hoveredIndex, setHoveredIndex } = useDock();
    const { isVisible, shouldAutoHide, handleDockMouseEnter, handleDockMouseLeave } = useDockAutoHide();

    return (
        <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{
                y: isVisible ? 0 : 100,
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8,
                transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    duration: shouldAutoHide ? 0.3 : undefined,
                    delay: shouldAutoHide ? 0 : 0.1
                }
            }}
            style={{ 
                height: DOCK_HEIGHT,
                pointerEvents: isVisible ? 'auto' : 'none'
            }}
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${
                shouldAutoHide ? 'z-[9999]' : 'z-50'
            }`}
            onMouseEnter={handleDockMouseEnter}
            onMouseLeave={handleDockMouseLeave}
        >
            {/* Dock Container with Enhanced macOS Glass Effect */}
            <motion.div
                className="flex items-end px-6 py-4 rounded-3xl relative"
                style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 100%)',
                    backdropFilter: 'blur(60px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(60px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: `
                        0 20px 40px rgba(0, 0, 0, 0.15),
                        0 8px 16px rgba(0, 0, 0, 0.1),
                        0 0 0 1px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.4),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `
                }}
                whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
                onMouseEnter={() => setHoveredIndex(null)}
                onMouseLeave={() => setHoveredIndex(null)}
            >
                {/* Enhanced Inner Glow */}
                <div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                        background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }}
                />

                <div
                    className="flex items-end relative z-10"
                    style={{ gap: DOCK_GAP }}
                >
                    <AnimatePresence>
                        {dockApps.map((app, index) => (
                            <DockItem
                                key={app.id}
                                app={app}
                                onClick={handleDockAppClick}
                                index={index}
                                hoveredIndex={hoveredIndex}
                                onHover={setHoveredIndex}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Dock Reflection Effect */}
            <motion.div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1"
                style={{
                    width: '80%',
                    height: '20px',
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                    filter: 'blur(8px)',
                    borderRadius: '50%'
                }}
                animate={{
                    opacity: hoveredIndex !== null ? 0.8 : 0.4,
                    scale: hoveredIndex !== null ? 1.1 : 1,
                    transition: { duration: 0.3 }
                }}
            />
        </motion.div>
    );
};