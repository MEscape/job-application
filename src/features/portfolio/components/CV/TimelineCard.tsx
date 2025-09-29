import {motion} from "framer-motion";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {GlassMorphism} from "@/features/portfolio/components/shared/GlassMorphism";
import {Briefcase, Calendar, ChevronDown, GraduationCap, Award, Trophy} from "lucide-react";

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

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';

    if (dateStr.includes('-') && dateStr.length === 7) {
        const [year, month] = dateStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    if (dateStr.includes('-') && dateStr.length === 10) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    return dateStr;
};

export const TimelineCard = ({
                                 entry,
                                 type,
                                 index,
                                 isActive,
                                 onClick,
                                 side,
                                 scrollProgress
                             }: {
    entry: CVEntry;
    type: 'education' | 'experience';
    index: number;
    isActive: boolean;
    onClick: () => void;
    side: 'left' | 'right';
    scrollProgress: number;
}) => {
    const isLeft = side === 'left';
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Mobile detection with SSR safety
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const startDate = formatDate(entry.start_date);
    const endDate = entry.end_date ? formatDate(entry.end_date) : (entry.duration || 'Present');

    // Check if there are details to show
    const hasDetails = Boolean(entry.notes || entry.description);
    const detailsText = entry.notes || entry.description || '';
    const shouldTruncate = hasDetails && detailsText.length > 150;
    const needsMoreButton = shouldTruncate;

    // Enhanced scroll animations - simplified for mobile
    const entryProgress = Math.max(0, Math.min(1, (scrollProgress - index * 0.09) / 0.22));
    const opacity = entryProgress;
    const translateX = isLeft ? (1 - entryProgress) * -40 : (1 - entryProgress) * 40; // Reduced movement
    const scale = 0.9 + entryProgress * 0.1; // Reduced scale change

    // Optimized mouse handlers
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    // Simplified shimmer system - only for desktop
    const createSimpleShimmer = useCallback((intensity: number) => {
        if (intensity === 0) return 'transparent';
        const shimmerColor = type === 'education'
            ? `rgba(139, 92, 246, ${intensity * 0.3})` // Purple for education
            : `rgba(59, 130, 246, ${intensity * 0.3})`; // Blue for experience
        
        return `linear-gradient(45deg, transparent 30%, ${shimmerColor} 50%, transparent 70%)`;
    }, [type]);

    // Memoized color schemes
    const colorScheme = useMemo(() => type === 'education' ? {
        gradient: 'from-violet-500/10 via-purple-500/8 to-indigo-500/10',
        border: 'border-violet-400/40',
        text: 'text-violet-300',
        icon: 'text-violet-400',
        accent: 'from-violet-400 to-purple-400',
        hover: 'hover:border-violet-400/60',
        glow: 'rgba(139, 92, 246, 0.15)',
        gradeGradient: 'from-violet-500/15 to-purple-500/15',
        gradeBorder: 'border-violet-400/50',
        gradeIcon: 'bg-violet-400/20',
        gradeText: 'text-violet-300'
    } : {
        gradient: 'from-blue-500/10 via-indigo-500/8 to-cyan-500/10',
        border: 'border-blue-400/40',
        text: 'text-blue-300',
        icon: 'text-blue-400',
        accent: 'from-blue-400 to-indigo-400',
        hover: 'hover:border-blue-400/60',
        glow: 'rgba(59, 130, 246, 0.15)',
        gradeGradient: 'from-blue-500/15 to-indigo-500/15',
        gradeBorder: 'border-blue-400/50',
        gradeIcon: 'bg-blue-400/20',
        gradeText: 'text-blue-300'
    }, [type]);

    return (
        <motion.div
            className={`relative flex items-start mb-6 sm:mb-8 ${isLeft ? 'justify-start' : 'justify-end'} 
                       sm:${isLeft ? 'justify-start' : 'justify-end'}`}
            style={{
                opacity,
                transform: `translateX(${translateX}px) scale(${scale})`,
            }}
        >
            {/* Responsive card width */}
            <div className={`w-full max-w-sm sm:w-80 ${isLeft ? 'mr-0 sm:mr-8' : 'ml-0 sm:ml-8'}`}>
                <motion.div
                    className="relative"
                    whileHover={{
                        y: isMobile ? -4 : -8, // Reduced movement on mobile
                        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                    }}
                >
                    <GlassMorphism variant="medium" intensity="high" className="cursor-pointer group overflow-hidden">
                        <div
                            className="relative p-4 sm:p-6 transition-all duration-500"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={hasDetails ? onClick : undefined}
                        >
                            {/* Simplified atmospheric glow effect - desktop only */}
                            <div
                                className="hidden sm:block absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                style={{
                                    background: `radial-gradient(400px circle at 50% 50%, ${colorScheme.glow}, transparent 40%)`,
                                }}
                            />

                            {/* Simplified shimmer borders - desktop only */}
                            <div
                                className="hidden sm:block absolute inset-0 rounded-xl pointer-events-none overflow-hidden opacity-0 hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: isHovered ? createSimpleShimmer(0.5) : 'transparent'
                                }}
                            />

                            {/* Header - responsive layout */}
                            <div className="relative z-10 mb-4 sm:mb-5">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight tracking-tight">
                                            {entry.degree || entry.position}
                                        </h3>
                                        <p className="text-slate-300 font-medium text-sm sm:text-base mb-3">
                                            {entry.institution || entry.company}
                                        </p>

                                        {/* Improved time duration layout - responsive */}
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="font-medium whitespace-nowrap">{startDate}</span>
                                                {startDate && <span className="text-slate-500">–</span>}
                                                <span className="font-medium whitespace-nowrap">{endDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced type badge - responsive */}
                                    <motion.div
                                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl backdrop-blur-md border shrink-0 bg-gradient-to-r ${colorScheme.gradient} ${colorScheme.border} ${colorScheme.hover} transition-all duration-300 self-start`}
                                        whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                                    >
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            {type === 'education' ? (
                                                <GraduationCap className={`w-3 h-3 sm:w-4 sm:h-4 ${colorScheme.icon}`} />
                                            ) : (
                                                <Briefcase className={`w-3 h-3 sm:w-4 sm:h-4 ${colorScheme.icon}`} />
                                            )}
                                            <span className={`text-xs sm:text-sm font-bold capitalize ${colorScheme.text}`}>
                                                {type}
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Improved Grade showcase - responsive */}
                            {entry.grade && (
                                <motion.div
                                    className="mb-4 sm:mb-5"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${colorScheme.gradeGradient} border ${colorScheme.gradeBorder} backdrop-blur-sm`}>
                                        <div className={`p-1.5 sm:p-2 rounded-full ${colorScheme.gradeIcon}`}>
                                            {type === 'education' ? (
                                                <Trophy className={`w-3 h-3 sm:w-4 sm:h-4 ${colorScheme.icon}`} />
                                            ) : (
                                                <Award className={`w-3 h-3 sm:w-4 sm:h-4 ${colorScheme.icon}`} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {type === 'education' ? 'Academic Grade' : 'Performance Rating'}
                                                </span>
                                            </div>
                                            <span className={`${colorScheme.gradeText} font-bold text-base sm:text-lg`}>
                                                {entry.grade}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Description - responsive text and only show if has details */}
                            {hasDetails && (
                                <div className="relative z-10 mb-4 sm:mb-5">
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {shouldTruncate && !isActive
                                            ? `${detailsText.substring(0, 100)}...`
                                            : detailsText
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Expand button - responsive and only show if has details */}
                            {needsMoreButton && (
                                <div className="flex justify-center relative z-10">
                                    <motion.button
                                        className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full backdrop-blur-md border transition-all duration-400 bg-gradient-to-r ${colorScheme.gradient} ${colorScheme.border} ${colorScheme.hover} touch-manipulation`}
                                        whileHover={{
                                            scale: isMobile ? 1.02 : 1.05,
                                            boxShadow: isMobile ? 'none' : `0 10px 40px ${colorScheme.glow}`,
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className={`text-xs font-semibold ${colorScheme.text} transition-colors`}>
                                            {isActive ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: isActive ? 180 : 0 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        >
                                            <ChevronDown size={12} className={`${colorScheme.icon} transition-colors`} />
                                        </motion.div>
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </GlassMorphism>
                </motion.div>
            </div>
        </motion.div>
    );
};