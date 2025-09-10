import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useFinderStore } from '../../hooks/useFinderStore';

export const FinderErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { error, resetToRoot } = useFinderStore();

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center justify-center text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Something went wrong
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        {error}
                    </p>
                    
                    <button
                        onClick={resetToRoot}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset to Home
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};