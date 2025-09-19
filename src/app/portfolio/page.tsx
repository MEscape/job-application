'use client';

import { Hero } from '@/features/portfolio/components/Hero/Hero';
import { ProjectTimeline } from '@/features/portfolio/components/Projects/ProjectTimeline';
import { FooterCTA } from '@/features/portfolio/components/Footer/FooterCTA';

const projectsData = require('@/features/portfolio/data/projects.json');

import '@/features/portfolio/styles/portfolio.css';
import '@/features/portfolio/styles/glass-morphism.css';

export default function PortfolioPage() {
    return (
        <div className="portfolio-page min-h-screen" data-portfolio-section>
            <Hero className="bg-gradient-to-br from-gray-900 via-black to-gray-900 transition" />
            <ProjectTimeline projects={projectsData} className="transition" />
            <FooterCTA className="transition" />
        </div>
    )
}