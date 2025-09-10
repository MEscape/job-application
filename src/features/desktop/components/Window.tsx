"use client"

import {AnimatePresence, motion, PanInfo} from "framer-motion";
import React, {useCallback, useEffect, useRef, useState } from "react";
import {Maximize2, Minus, X, Minimize2} from "lucide-react";
import {Position, TITLE_BAR_HEIGHT} from "@/features/desktop/constants/window";
import {
    calculateDragConstraints,
    calculateSnapPosition,
    DragConstraints
} from "@/features/desktop/utils/windowPositioning";
import {WindowState} from "@/features/desktop/stores/windowStore";

interface WindowProps {
    window: WindowState;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onMaximize: (id: string) => void;
    onFocus: (id: string) => void;
    onPositionChange: (id: string, position: Position) => void;
    onToggleFullscreen?: (id: string) => void;
    children?: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
                                           window,
                                           children,
                                           onClose,
                                           onMinimize,
                                           onMaximize,
                                           onFocus,
                                           onPositionChange,
                                           onToggleFullscreen
                                       }) => {
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [dragConstraints, setDragConstraints] = useState<DragConstraints>({
        left: 0, right: 0, top: 0, bottom: 0
    });
    const windowRef = useRef<HTMLDivElement>(null);

    // Memoized constraint calculation
    const updateDragConstraints = useCallback(() => {
        const constraints = calculateDragConstraints(window.size);
        setDragConstraints(constraints);
    }, [window.size]);

    useEffect(() => {
        updateDragConstraints();
        if (typeof globalThis.window !== 'undefined') {
            const handleResize = () => updateDragConstraints();
            globalThis.window.addEventListener('resize', handleResize);
            return () => globalThis.window.removeEventListener('resize', handleResize);
        }
    }, [updateDragConstraints]);

    // Event handlers with proper typing
    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => onClose(window.id), 300);
    }, [window.id, onClose]);

    const handleMinimize = useCallback(() => {
        onMinimize(window.id);
    }, [window.id, onMinimize]);

    const handleMaximize = useCallback(() => {
        if (onToggleFullscreen) {
            onToggleFullscreen(window.id);
        } else {
            onMaximize(window.id);
        }
    }, [onMaximize, onToggleFullscreen, window.id]);

    const handleFocus = useCallback(() => {
        onFocus(window.id);
    }, [window.id, onFocus]);

    const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const newPosition = calculateSnapPosition(window.position, info.offset, window.size);
        onPositionChange(window.id, newPosition);
    }, [window.id, window.position, window.size, onPositionChange]);

    // Minimize animation
    if (window.isMinimized) {
        return (
            <motion.div
                initial={{ scale: 1, y: 0 }}
                animate={{ scale: 0.1, y: 500 }}
                transition={{ duration: 0.3 }}
                className="absolute pointer-events-none"
                style={{
                    left: window.position.x,
                    top: window.position.y,
                    width: window.size.width,
                    height: window.size.height,
                    zIndex: window.zIndex
                }}
            >
                <div className="w-full h-full bg-white bg-opacity-20 backdrop-blur-md rounded-lg" />
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            {!isClosing && (
                <motion.div
                    ref={windowRef}
                    drag={!window.isMaximized && !window.isFullscreen}
                    dragMomentum={false}
                    dragConstraints={dragConstraints}
                    dragElastic={0}
                    onDragEnd={handleDragEnd}
                    onMouseDown={handleFocus}
                    onTouchStart={handleFocus}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: (window.isMaximized || window.isFullscreen) ? 0 : window.position.x,
                        y: (window.isMaximized || window.isFullscreen) ? 0 : window.position.y,
                        width: (window.isMaximized || window.isFullscreen) ? '100vw' : window.size.width,
                        height: (window.isMaximized || window.isFullscreen) ? '100vh' : window.size.height
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.8,
                        transition: { duration: 0.2 }
                    }}
                    whileDrag={{
                        scale: 1.02,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                    className="absolute select-none cursor-move"
                    style={{
                        zIndex: window.zIndex,
                        left: (window.isMaximized || window.isFullscreen) ? 0 : undefined,
                        top: (window.isMaximized || window.isFullscreen) ? 0 : undefined,
                    }}
                >
                    <div className={`bg-white bg-opacity-20 backdrop-blur-md shadow-2xl border border-white border-opacity-20 overflow-hidden h-full flex flex-col ${
                        window.isFullscreen ? 'rounded-none' : 'rounded-lg'
                    }`}>
                        {/* Title Bar */}
                        {true && (
                        <div
                            className="bg-gradient-to-r from-gray-100 to-gray-200 bg-opacity-40 backdrop-blur-sm border-b border-white border-opacity-20 flex items-center px-4 relative cursor-move"
                            style={{
                                height: TITLE_BAR_HEIGHT,
                                pointerEvents: 'all'
                            }}
                        >
                            {/* Traffic Light Controls */}
                            <div className="flex space-x-2 z-10">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleClose}
                                    className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center group hover:bg-red-600 transition-colors"
                                    aria-label="Close window"
                                >
                                    <X className="w-2 h-2 text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMinimize}
                                    className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center group hover:bg-yellow-600 transition-colors"
                                    aria-label="Minimize window"
                                >
                                    <Minus className="w-2 h-2 text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMaximize}
                                    className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center group hover:bg-green-600 transition-colors"
                                    aria-label={window.isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {window.isFullscreen ? (
                                        <Minimize2 className="w-2 h-2 text-green-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <Maximize2 className="w-2 h-2 text-green-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </motion.button>
                            </div>

                            {/* Title */}
                            <div
                                className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-800 pointer-events-none"
                            >
                                {window.title}
                            </div>
                        </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-auto cursor-default">
                            {children || window.content}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};