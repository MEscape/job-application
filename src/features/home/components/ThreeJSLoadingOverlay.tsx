import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreeJSLoadingOverlayProps {
    minDisplayTime?: number;
    waitForIframe?: boolean;
}

export const ThreeJSLoadingOverlay: React.FC<ThreeJSLoadingOverlayProps> = ({
                                                                                minDisplayTime = 3500,
                                                                                waitForIframe = true,
                                                                            }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [iframeLoaded, setIframeLoaded] = useState(!waitForIframe);
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);

    useEffect(() => {
        setCurrentPhase(1);
        const finalTimer = setTimeout(() => setCurrentPhase(2), 1000);
        const minTimer = setTimeout(() => setMinTimeElapsed(true), minDisplayTime);

        return () => {
            clearTimeout(finalTimer);
            clearTimeout(minTimer);
        };
    }, [minDisplayTime]);

    useEffect(() => {
        if (!waitForIframe) return;

        const checkIframeLoaded = () => {
            const iframe = document.querySelector<HTMLIFrameElement>("#monitor-iframe");
            if (!iframe) return false;
            setIframeLoaded(true);
            return true;
        };

        if (checkIframeLoaded()) return;

        const timeoutId = setTimeout(() => {
            console.warn('Iframe loading timeout - proceeding without iframe');
            setIframeLoaded(true);
        }, 10000);

        const observer = new MutationObserver(() => {
            if (checkIframeLoaded()) {
                clearTimeout(timeoutId);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [waitForIframe]);

    useEffect(() => {
        if (minTimeElapsed && iframeLoaded && currentPhase >= 2) {
            setIsVisible(false);
        }
    }, [minTimeElapsed, iframeLoaded, currentPhase]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
                >
                    <div className="text-center">
                        {/* Main title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                            className="text-5xl sm:text-6xl md:text-7xl font-light text-white mb-3 tracking-tight"
                        >
                            playground
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                            className="text-lg sm:text-xl text-white/60 font-light tracking-wide mb-16"
                        >
                            by marvin eschenbach
                        </motion.p>

                        {/* Simple loading indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Spinner */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full mx-auto"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};