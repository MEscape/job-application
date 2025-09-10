import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OSBootAnimationProps {
    isVisible: boolean;
}

export const OSBootAnimation: React.FC<OSBootAnimationProps> = ({ isVisible }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            return;
        }

        const progressTimer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressTimer);
                    return 100;
                }
                return Math.min(prev + 0.8 + Math.random() * 1.2, 100);
            });
        }, 100);

        return () => {
            clearInterval(progressTimer);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="absolute inset-0 z-50"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ marginBottom: 16 }}
            >
                <svg
                    width="70"
                    height="70"
                    viewBox="0 0 24 24"
                    style={{ display: 'block', fill: 'white' }}
                >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98 1.2 1.75 1.8 3.85 1.5 5.95-.25 1.8-1.2 3.5-2.35 4.73z M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                style={{
                    width: '256px',
                    height: '4px',
                    backgroundColor: '#d1d5db',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <motion.div
                    style={{
                        height: '100%',
                        backgroundColor: '#4b5563',
                        borderRadius: '9999px',
                        transformOrigin: 'left'
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: 0.2, ease: "linear" }}
                />
            </motion.div>
        </motion.div>
    );
};
