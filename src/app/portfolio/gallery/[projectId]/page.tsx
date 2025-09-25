'use client';

import {useParams, useRouter} from 'next/navigation';
import { LavaBackground } from '@/features/portfolio/components/shared/LavaBackground';
import { HolographicFilmStrip } from '@/features/portfolio/components/Gallery/HolographicFilmStrip';

const projectsData = require('@/features/portfolio/data/projects.json');

export default function GalleryPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    
    const project = projectsData.find((p: any) => p.id === projectId);

    const handleBackClick = () => {
        router.back();
    };

    if (!project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
                    <p className="text-gray-400 mb-8">The requested project gallery could not be found.</p>
                    <button 
                        onClick={handleBackClick}
                        className="px-8 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white bg-transparent hover:bg-gray-800/50 rounded-md transition-all duration-300 backdrop-blur-sm"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Check if project has images
    if (!project.images || project.images.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
                    <p className="text-gray-400 mb-8">This project has no images to display.</p>
                    <button 
                        onClick={handleBackClick}
                        className="px-8 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white bg-transparent hover:bg-gray-800/50 rounded-md transition-all duration-300 backdrop-blur-sm"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
            <LavaBackground>
                {/* Gallery - Full Screen */}
                <div className="h-screen">
                    <HolographicFilmStrip
                        images={project.images}
                        projectTitle={project.title}
                        onBackClick={handleBackClick}
                    />
                </div>
            </LavaBackground>
        </div>
    );
}