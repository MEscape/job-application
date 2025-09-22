'use client';

import { Hero } from '@/features/portfolio/components/Hero/Hero';
import { CVSkillsSection } from '@/features/portfolio/components/CV/CVSkillsSection';
import { ProjectTimeline } from '@/features/portfolio/components/Projects/ProjectTimeline';
import { FooterCTA } from '@/features/portfolio/components/Footer/FooterCTA';

const projectsData = require('@/features/portfolio/data/projects.json');
const cvData = require('@/features/portfolio/data/cv.json');
const skillsData = require('@/features/portfolio/data/skills.json');

import '@/features/portfolio/styles/portfolio.css';
import '@/features/portfolio/styles/glass-morphism.css';
import { LavaBackground } from '@/features/portfolio/components/shared/LavaBackground';

export default function PortfolioPage() {
    return (
        <div className="portfolio-page min-h-screen" data-portfolio-section>
            <Hero className="bg-gradient-to-br from-gray-900 via-black to-gray-900 transition" />
            <LavaBackground className='transition'>
                <CVSkillsSection 
                    cvData={cvData} 
                    skillsData={skillsData} 
                />
                <ProjectTimeline projects={projectsData} />
            </LavaBackground>
            <FooterCTA className="transition" />
        </div>
    )
}