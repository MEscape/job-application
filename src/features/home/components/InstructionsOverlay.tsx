'use client'

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScene } from "@/features/home/stores/hooks";

export function InstructionsOverlay() {
    const scene = useScene();
    const [isLoadingComplete, setIsLoadingComplete] = useState(false);

    // Check if loading overlay is still visible by looking for iframe
    useEffect(() => {
        const checkLoadingComplete = () => {
            const iframe = document.querySelector('#monitor-iframe');
            if (iframe) {
                // Add a small delay to ensure loading overlay has faded out
                setTimeout(() => setIsLoadingComplete(true), 1000);
                return true;
            }
            return false;
        };

        if (checkLoadingComplete()) return;

        const observer = new MutationObserver(() => {
            checkLoadingComplete();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    const getInstructionContent = () => {
        if (scene.isAnimating) {
            return (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3"
                >
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse shadow-lg" />
                    <span className="font-medium">Animating...</span>
                </motion.div>
            );
        }

        if (scene.canMoveToDesk) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3"
                >
                    <span>Press</span>
                    <kbd className="bg-gradient-to-r from-gray-700 to-gray-600 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-mono border border-gray-500 shadow-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-200">
                        Tab
                    </kbd>
                    <span>to sit at desk</span>
                    <span className="text-blue-300 font-medium">• Free look mode</span>
                </motion.div>
            );
        }

        if (scene.canReturnHome) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3"
                >
                    <span>Press</span>
                    <kbd className="bg-gradient-to-r from-gray-700 to-gray-600 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-mono border border-gray-500 shadow-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-200">
                        Esc
                    </kbd>
                    <span>to leave desk</span>
                    <span className="text-purple-300 font-medium">• Work mode</span>
                </motion.div>
            );
        }

        return null;
    };

    const content = getInstructionContent();
    if (!content || !isLoadingComplete) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white bg-black/70 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 shadow-2xl z-10 hover:bg-black/80 transition-all duration-300 max-w-xs sm:max-w-none"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl pointer-events-none" />
                <div className="text-xs sm:text-sm font-medium relative z-10">{content}</div>
            </motion.div>
        </AnimatePresence>
    );
}
