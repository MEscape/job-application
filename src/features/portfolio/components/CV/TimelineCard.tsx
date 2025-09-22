import {motion} from "framer-motion";
import React, { useState } from "react";
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
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [isHovered, setIsHovered] = useState(false);

    const startDate = formatDate(entry.start_date);
    const endDate = entry.end_date ? formatDate(entry.end_date) : (entry.duration || 'Present');

    // Check if there are details to show
    const hasDetails = Boolean(entry.notes || entry.description);
    const detailsText = entry.notes || entry.description || '';
    const shouldTruncate = hasDetails && detailsText.length > 150;
    const needsMoreButton = shouldTruncate;

    // Enhanced scroll animations
    const entryProgress = Math.max(0, Math.min(1, (scrollProgress - index * 0.09) / 0.22));
    const opacity = entryProgress;
    const translateX = isLeft ? (1 - entryProgress) * -60 : (1 - entryProgress) * 60;
    const scale = 0.85 + entryProgress * 0.15;

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
    };

    const { x, y } = mousePosition;

    // Enhanced shimmer system with purple-blue theme
    const createShimmer = (position: number, direction: 'horizontal' | 'vertical', intensity: number) => {
        if (intensity === 0) return 'transparent';
        const center = position * 100;
        const spread = 25;
        const glow = intensity * 0.8;

        const shimmerColor = type === 'education'
            ? `rgba(139, 92, 246, ${glow})` // Purple for education
            : `rgba(59, 130, 246, ${glow})`; // Blue for experience

        return direction === 'horizontal'
            ? `linear-gradient(to right, transparent ${Math.max(0, center - spread)}%, ${shimmerColor} ${center}%, transparent ${Math.min(100, center + spread)}%)`
            : `linear-gradient(to bottom, transparent ${Math.max(0, center - spread)}%, ${shimmerColor} ${center}%, transparent ${Math.min(100, center + spread)}%)`;
    };

    const getIntensity = (distance: number) => Math.max(0, (0.3 - distance) / 0.3);

    const topShimmer = createShimmer(x, 'horizontal', getIntensity(y));
    const bottomShimmer = createShimmer(x, 'horizontal', getIntensity(1 - y));
    const leftShimmer = createShimmer(y, 'vertical', getIntensity(x));
    const rightShimmer = createShimmer(y, 'vertical', getIntensity(1 - x));

    // Color schemes
    const colorScheme = type === 'education' ? {
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
    };

    return (
        <motion.div
            className={`relative flex items-start mb-8 ${isLeft ? 'justify-start' : 'justify-end'}`}
            style={{
                opacity,
                transform: `translateX(${translateX}px) scale(${scale})`,
            }}
        >
            <div className={`w-80 ${isLeft ? 'mr-8' : 'ml-8'}`}>
                <motion.div
                    className="relative"
                    whileHover={{
                        y: -8,
                        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                    }}
                >
                    <GlassMorphism variant="medium" intensity="high" className="cursor-pointer group overflow-hidden">
                        <div
                            className="relative p-6 transition-all duration-500"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={hasDetails ? onClick : undefined}
                        >
                            {/* Atmospheric glow effect */}
                            <div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                style={{
                                    background: `radial-gradient(600px circle at ${x * 100}% ${y * 100}%, ${colorScheme.glow}, transparent 40%)`,
                                }}
                            />

                            {/* Dynamic shimmer borders */}
                            <div
                                className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
                                style={{
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div className="absolute top-0 left-0 w-full h-px" style={{ background: topShimmer }} />
                                <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: bottomShimmer }} />
                                <div className="absolute top-0 left-0 w-px h-full" style={{ background: leftShimmer }} />
                                <div className="absolute top-0 right-0 w-px h-full" style={{ background: rightShimmer }} />
                            </div>

                            {/* Header */}
                            <div className="relative z-10 mb-5">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight tracking-tight">
                                            {entry.degree || entry.position}
                                        </h3>
                                        <p className="text-slate-300 font-medium text-base mb-3">
                                            {entry.institution || entry.company}
                                        </p>

                                        {/* Improved time duration layout */}
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Calendar className="w-4 h-4 shrink-0" />
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="font-medium whitespace-nowrap">{startDate}</span>
                                                {startDate && <span className="text-slate-500">–</span>}
                                                <span className="font-medium whitespace-nowrap">{endDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced type badge */}
                                    <motion.div
                                        className={`px-4 py-2.5 rounded-2xl backdrop-blur-md border shrink-0 bg-gradient-to-r ${colorScheme.gradient} ${colorScheme.border} ${colorScheme.hover} transition-all duration-300`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {type === 'education' ? (
                                                <GraduationCap className={`w-4 h-4 ${colorScheme.icon}`} />
                                            ) : (
                                                <Briefcase className={`w-4 h-4 ${colorScheme.icon}`} />
                                            )}
                                            <span className={`text-sm font-bold capitalize ${colorScheme.text}`}>
                                                {type}
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Improved Grade showcase */}
                            {entry.grade && (
                                <motion.div
                                    className="mb-5"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${colorScheme.gradeGradient} border ${colorScheme.gradeBorder} backdrop-blur-sm`}>
                                        <div className={`p-2 rounded-full ${colorScheme.gradeIcon}`}>
                                            {type === 'education' ? (
                                                <Trophy className={`w-4 h-4 ${colorScheme.icon}`} />
                                            ) : (
                                                <Award className={`w-4 h-4 ${colorScheme.icon}`} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {type === 'education' ? 'Academic Grade' : 'Performance Rating'}
                                                </span>
                                            </div>
                                            <span className={`${colorScheme.gradeText} font-bold text-lg`}>
                                                {entry.grade}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Description - only show if has details */}
                            {hasDetails && (
                                <div className="relative z-10 mb-5">
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {shouldTruncate && !isActive
                                            ? `${detailsText.substring(0, 120)}...`
                                            : detailsText
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Expand button - only show if has details */}
                            {needsMoreButton && (
                                <div className="flex justify-center relative z-10">
                                    <motion.button
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md border transition-all duration-400 bg-gradient-to-r ${colorScheme.gradient} ${colorScheme.border} ${colorScheme.hover}`}
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: `0 10px 40px ${colorScheme.glow}`,
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className={`text-xs font-semibold ${colorScheme.text} transition-colors`}>
                                            {isActive ? 'Show Less' : 'Show More'}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: isActive ? 180 : 0 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        >
                                            <ChevronDown size={14} className={`${colorScheme.icon} transition-colors`} />
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