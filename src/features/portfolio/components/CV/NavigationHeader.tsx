import {motion} from "framer-motion";
import React from "react";
import {Code, User} from "lucide-react";
import { ScrollReveal } from "../shared/ScrollReveal";

interface NavigationHeaderProps {
    handleViewChange: (view: "journey" | "skills") => void;
    activeView: string;
}

export const NavigationHeader = ({handleViewChange, activeView}: NavigationHeaderProps) => {
    return (
        <div className="relative z-10 py-16">
            <div className="container mx-auto px-6">
                <ScrollReveal direction="up">
                    <motion.div
                        className="flex items-center justify-center mb-16"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="relative">
                            {/* Glass morphism container */}
                            <div className="relative backdrop-blur-xl bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 border border-slate-700/50 rounded-2xl p-1.5 shadow-2xl">
                                {/* Atmospheric glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10 rounded-2xl blur-xl" />

                                {/* Toggle buttons container */}
                                <div className="relative flex items-center space-x-2">
                                    {/* Journey Button */}
                                    <motion.button
                                        onClick={() => handleViewChange('journey')}
                                        className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-700 ease-out group overflow-hidden ${
                                            activeView === 'journey'
                                                ? 'text-white'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Active background */}
                                        {activeView === 'journey' && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-blue-500/20 rounded-xl border border-blue-500/30"
                                                layoutId="activeToggle"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                                            />
                                        )}

                                        {/* Hover background */}
                                        <div className="absolute inset-0 bg-slate-700/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Content */}
                                        <div className="relative flex items-center space-x-3">
                                            <div className={`p-1.5 rounded-lg transition-all duration-500 ${
                                                activeView === 'journey'
                                                    ? 'bg-blue-500/20 text-blue-300'
                                                    : 'bg-slate-700/40 text-slate-400 group-hover:bg-slate-600/40'
                                            }`}>
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-sm tracking-wide">Journey</span>
                                        </div>

                                        {/* Shimmer effect on hover */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
                                        </div>
                                    </motion.button>

                                    {/* Skills Button */}
                                    <motion.button
                                        onClick={() => handleViewChange('skills')}
                                        className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-700 ease-out group overflow-hidden ${
                                            activeView === 'skills'
                                                ? 'text-white'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Active background */}
                                        {activeView === 'skills' && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-purple-500/20 rounded-xl border border-purple-500/30 w-full"
                                                layoutId="activeToggle"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                                            />
                                        )}

                                        {/* Hover background */}
                                        <div className="absolute inset-0 bg-slate-700/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Content */}
                                        <div className="relative flex items-center space-x-3">
                                            <div className={`p-1.5 rounded-lg transition-all duration-500 ${
                                                activeView === 'skills'
                                                    ? 'bg-purple-500/20 text-purple-300'
                                                    : 'bg-slate-700/40 text-slate-400 group-hover:bg-slate-600/40'
                                            }`}>
                                                <Code className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-sm tracking-wide">Skills</span>
                                        </div>

                                        {/* Shimmer effect on hover */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
                                        </div>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Floating particles */}
                            {Array.from({ length: 4 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={`absolute w-1 h-1 rounded-full ${
                                        activeView === 'journey' ? 'bg-blue-400/40' : 'bg-purple-400/40'
                                    }`}
                                    animate={{
                                        y: [0, -30, 0],
                                        opacity: [0.2, 0.8, 0.2],
                                        scale: [0.5, 1.2, 0.5]
                                    }}
                                    transition={{
                                        duration: 4 + i * 0.5,
                                        repeat: Infinity,
                                        delay: i * 1.5,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        left: `${20 + i * 15}%`,
                                        top: `${-10 - i * 5}px`
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </ScrollReveal>
            </div>
        </div>
    )
}