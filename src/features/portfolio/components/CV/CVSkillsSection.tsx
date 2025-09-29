'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CVTimeline } from './CVTimeline';
import SkillsSection from './SkillsSection';
import { NavigationHeader } from "./NavigationHeader";

interface CVEntry {
  degree?: string;
  position?: string;
  institution?: string;
  company?: string;
  type?: string;
  start_date: string;
  end_date?: string;
  duration?: string;
  grade?: string;
  notes?: string;
  description?: string;
}

interface Skill {
  name: string;
  level: number;
  experience: string;
}

interface SkillCategory {
  category: string;
  description: string;
  items: Skill[];
}

interface Language {
  name: string;
  level: string;
}

interface CVData {
  education: CVEntry[];
  experience: CVEntry[];
}

interface SkillsData {
  skills: SkillCategory[];
  languages: Language[];
}

interface CVSkillsSectionProps {
  cvData: CVData;
  skillsData: SkillsData;
  className?: string;
}

export function CVSkillsSection({ cvData, skillsData, className = '' }: CVSkillsSectionProps) {
  const [activeView, setActiveView] = useState<'journey' | 'skills'>('journey');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewChange = (view: 'journey' | 'skills') => {
    if (view !== activeView) {
      setActiveView(view);
    }
  };

  return (
    <section className={`relative overflow-hidden ${className}`}>
      <NavigationHeader handleViewChange={handleViewChange} activeView={activeView} />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative min-h-[400px] sm:min-h-[600px] pb-8 sm:pb-16">
          <AnimatePresence mode="wait">
            {activeView === 'journey' ? (
                <motion.div
                    key="journey"
                    initial={{ opacity: 0, x: isMobile ? -15 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isMobile ? 15 : 30 }}
                    transition={{ duration: isMobile ? 0.4 : 0.6, ease: "easeOut" }}
                    className="py-4 sm:py-8"
                >
                  <CVTimeline
                      education={cvData.education}
                      experience={cvData.experience}
                  />
                </motion.div>
            ) : (
                <motion.div
                    key="skills"
                    initial={{ opacity: 0, x: isMobile ? 15 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isMobile ? -15 : -30 }}
                    transition={{ duration: isMobile ? 0.4 : 0.6, ease: "easeOut" }}
                    className="py-4 sm:py-8"
                >
                  <SkillsSection
                      skills={skillsData.skills}
                      languages={skillsData.languages}
                  />
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}