'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Database, Smartphone, Cloud, Wrench, Globe } from 'lucide-react';
import {TechCarousel} from "./TechCarousel";

interface Skill {
  name: string;
  level: number;
  category: string;
  experience: string;
}

interface SkillItem {
  name: string;
  level: number;
  experience: string;
  logo?: string;
}

interface SkillCategory {
  category: string;
  description: string;
  items: SkillItem[];
}

interface Language {
  name: string;
  level: string;
}

interface SkillsSectionProps {
  skills: SkillCategory[];
  languages: Language[];
  className?: string;
}

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('frontend') || name.includes('ui') || name.includes('web')) return Code;
  if (name.includes('backend') || name.includes('database')) return Database;
  if (name.includes('mobile')) return Smartphone;
  if (name.includes('cloud') || name.includes('devops') || name.includes('aws')) return Cloud;
  if (name.includes('tools')) return Wrench;
  return Globe;
};

export default function SkillsSection({ skills, languages, className = '' }: SkillsSectionProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Collect all technologies with logos for carousel
  const allTechnologies = skills.flatMap(category =>
      category.items
          .filter(item => item.logo)
          .map(item => ({
            name: item.name,
            logo: item.logo!,
            category: category.category
          }))
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  // Transform skills data structure
  const flatSkills: Skill[] = skills.flatMap(category =>
      category.items.map(item => ({
        name: item.name,
        level: item.level,
        category: category.category,
        experience: item.experience
      }))
  );

  const getExperienceLevel = (level: number) => {
    if (level >= 90) return { label: 'Expert', gradient: 'from-blue-400 to-purple-400' };
    if (level >= 75) return { label: 'Advanced', gradient: 'from-purple-400 to-violet-400' };
    if (level >= 60) return { label: 'Intermediate', gradient: 'from-violet-400 to-indigo-400' };
    if (level >= 40) return { label: 'Proficient', gradient: 'from-indigo-400 to-blue-400' };
    return { label: 'Learning', gradient: 'from-slate-400 to-gray-400' };
  };

  const languagesWithFlags = languages.map(lang => ({
    ...lang,
    flag: lang.name === 'German' ? '🇩🇪' :
        lang.name === 'English' ? '🇺🇸' :
            lang.name === 'French' ? '🇫🇷' : '🌐'
  }));

  return (
      <div
          className={`relative space-y-16 ${className}`}
          ref={containerRef}
          onMouseMove={handleMouseMove}
      >
        <TechCarousel technologies={allTechnologies} />

        {/* Skills Section - Flat Layout */}
        <div className="relative">
          <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center space-x-3 px-6 pt-3">
              <Code className="w-5 h-5 text-slate-400" />
              <h3 className="text-xl font-bold text-white tracking-wide">Skills & Expertise</h3>
            </div>
          </motion.div>

          {/* All Skills in One Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {flatSkills.map((skill, index) => {
              const experienceLevel = getExperienceLevel(skill.level);
              const Icon = getCategoryIcon(skill.category);

              return (
                  <motion.div
                      key={skill.name}
                      className="group cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.02 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => setSelectedSkill(skill)}
                  >
                    <div className="relative p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-slate-800/20 to-slate-900/40 border border-slate-700/30 group-hover:border-slate-600/50 transition-all duration-300 overflow-hidden">
                      {/* Atmospheric glow */}
                      <motion.div
                          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `radial-gradient(300px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(139, 92, 246, 0.1), transparent 40%)`
                          }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/30">
                              <Icon className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                              <h5 className="text-white font-semibold text-sm">{skill.name}</h5>
                              <p className="text-slate-400 text-xs">{skill.category}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${experienceLevel.gradient} text-white font-medium shrink-0`}>
                        {experienceLevel.label}
                      </span>
                        </div>

                        <p className="text-slate-400 text-xs mb-4 leading-relaxed line-clamp-2">{skill.experience}</p>

                        <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                          <motion.div
                              className={`h-full bg-gradient-to-r ${experienceLevel.gradient} rounded-full`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              transition={{ duration: 1, delay: index * 0.05 }}
                              viewport={{ once: true }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </div>
        </div>

        {/* Languages Section */}
        <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 px-6 pt-3">
              <Globe className="w-5 h-5 text-slate-400" />
              <h3 className="text-xl font-bold text-white tracking-wide">Languages</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {languagesWithFlags.map((language, index) => (
                <motion.div
                    key={language.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -2, scale: 1.05 }}
                >
                  <div className="p-4 rounded-xl backdrop-blur-sm bg-gradient-to-br from-slate-800/20 to-slate-900/40 border border-slate-700/30 text-center hover:border-slate-600/50 transition-all duration-300">
                    <div className="text-2xl mb-2">{language.flag}</div>
                    <h4 className="text-white font-medium text-sm mb-1">{language.name}</h4>
                    <p className="text-slate-400 text-xs">{language.level}</p>
                  </div>
                </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skill Detail Modal */}
        <AnimatePresence>
          {selectedSkill && (
              <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedSkill(null)}
              >
                <motion.div
                    className="relative max-w-md w-full glass-dark backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
                      <button
                          onClick={() => setSelectedSkill(null)}
                          className="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700/60 flex items-center justify-center transition-colors"
                      >
                        <span className="text-slate-400 text-lg hover:text-white">×</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-slate-400 text-sm block mb-1">Category</span>
                        <p className="text-white">{selectedSkill.category}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 text-sm block mb-2">Experience Level</span>
                        <span className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${getExperienceLevel(selectedSkill.level).gradient} text-white text-sm font-medium`}>
                      {getExperienceLevel(selectedSkill.level).label}
                    </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-sm block mb-2">Details</span>
                        <p className="text-white text-sm leading-relaxed">{selectedSkill.experience}</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400 text-sm">Proficiency</span>
                          <span className="text-white text-sm font-medium">{selectedSkill.level}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
                          <motion.div
                              className={`h-full bg-gradient-to-r ${getExperienceLevel(selectedSkill.level).gradient} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${selectedSkill.level}%` }}
                              transition={{ duration: 1.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}