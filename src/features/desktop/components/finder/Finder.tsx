import React from 'react';
import { useFinderStore } from "../../hooks/useFinderStore";
import { FinderSidebar } from "./FinderSidebar";
import { FinderToolbar } from "./FinderToolbar"
import { motion } from 'framer-motion';
import { FinderBreadcrumb } from './FinderBreadcrumb';
import { FinderContent } from './FinderContent';
import { FinderErrorBoundary } from './FinderErrorBoundary';

interface FinderProps {
    initialPath?: string;
}

export const Finder: React.FC<FinderProps> = ({ initialPath }) => {
    const {
        sidebarVisible,
        navigateTo,
    } = useFinderStore();

    // Navigate to initial path when component mounts
    React.useEffect(() => {
        if (initialPath) {
            navigateTo(initialPath);
        }
    }, [initialPath, navigateTo]);

    return (
        <div className="flex flex-col h-full">
            <FinderToolbar />

            <motion.div 
                className="flex flex-1 overflow-hidden"
                animate={{ gap: sidebarVisible ? "0px" : "0px" }}
                transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 35
                }}
            >
                <motion.div
                    animate={{ 
                        width: sidebarVisible ? 256 : 0,
                        opacity: sidebarVisible ? 1 : 0
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 35,
                        opacity: { 
                            duration: sidebarVisible ? 0.3 : 0.1,
                            delay: sidebarVisible ? 0.1 : 0
                        }
                    }}
                    className={`
                        overflow-hidden
                        md:relative md:block
                        fixed inset-y-0 left-0 z-50
                    `}
                >
                    <div className="w-64 h-full">
                        <FinderSidebar sidebarVisible={sidebarVisible} />
                    </div>
                </motion.div>

                <motion.div 
                    className="flex flex-col flex-1 overflow-hidden"
                    animate={{ 
                        x: 0
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 35
                    }}
                >
                    <FinderBreadcrumb />
                    <FinderErrorBoundary>
                        <FinderContent />
                    </FinderErrorBoundary>
                </motion.div>
            </motion.div>
        </div>
    )
}