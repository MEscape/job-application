import { motion } from 'framer-motion';
import React from 'react';
import { useFinderStore } from '../../hooks/useFinderStore';

export const FinderBreadcrumb: React.FC = () => {
    const {
        currentPath,
        navigateTo
    } = useFinderStore();

    const getBreadcrumbSegments = () => {
        if (!currentPath || currentPath === '/') {
        return [{ name: 'Home', path: '/' }];
        }

        const segments = currentPath.split('/').filter(Boolean);
        const breadcrumbs = [{ name: 'Home', path: '/' }];

        let currentSegmentPath = '';
        segments.forEach((segment) => {
        currentSegmentPath += `/${segment}`;
        breadcrumbs.push({
            name: segment,
            path: currentSegmentPath
        });
        });

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbSegments();

    // Show breadcrumb only on desktop (<768px = Tailwind md breakpoint)
    if (globalThis.window.innerWidth < 768) {
        const currentFolder = breadcrumbs[breadcrumbs.length - 1];

        return (
            <div className="px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900">{currentFolder.name}</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-b border-gray-200">
            <nav aria-label="Breadcrumb navigation">
                <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        
                        return (
                            <li key={crumb.path} className="flex items-center">
                                {!isLast ? (
                                    <>
                                        <motion.button
                                            className="text-blue-600 hover:underline transition-colors cursor-pointer font-bold"
                                            onClick={() => navigateTo(crumb.path)}
                                            aria-label={`Navigate to ${crumb.name}`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            {crumb.name}
                                        </motion.button>
                                        <span className="mx-2 text-gray-400" aria-hidden="true">
                                            <svg width="6" height="10" viewBox="0 0 6 10" fill="currentColor">
                                                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </>
                                ) : (
                                    <motion.span 
                                        className="text-gray-900 font-medium" 
                                        aria-current="page"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {crumb.name}
                                    </motion.span>
                                )}
                            </li>
                        )
                    })}
                </ol>
            </nav>
        </div>
    )
}