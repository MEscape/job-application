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