"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface BaseCardProps {
    title: string
    description?: string
    value?: string | number
    icon: LucideIcon
    href?: string
    color: string
    variant?: 'navigation' | 'stats'
    onClick?: () => void
    className?: string
}

// Modern color palette for consistency
const colorVariants = {
    blue: {
        gradient: 'from-blue-500/20 to-blue-600/20',
        icon: 'text-blue-400',
        iconBg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'shadow-blue-500/10'
    },
    green: {
        gradient: 'from-emerald-500/20 to-emerald-600/20',
        icon: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/10'
    },
    purple: {
        gradient: 'from-violet-500/20 to-violet-600/20',
        icon: 'text-violet-400',
        iconBg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        glow: 'shadow-violet-500/10'
    },
    orange: {
        gradient: 'from-amber-500/20 to-amber-600/20',
        icon: 'text-amber-400',
        iconBg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/10'
    }
}

export function BaseCard({ 
    title, 
    description, 
    value, 
    icon: Icon, 
    href, 
    color, 
    variant = 'navigation',
    onClick,
    className = ''
}: BaseCardProps) {
    // Determine color scheme based on color prop
    const getColorScheme = () => {
        if (color.includes('blue')) return colorVariants.blue
        if (color.includes('green') || color.includes('emerald')) return colorVariants.green
        if (color.includes('purple') || color.includes('violet')) return colorVariants.purple
        if (color.includes('orange') || color.includes('amber')) return colorVariants.orange
        return colorVariants.blue // fallback
    }

    const colorScheme = getColorScheme()

    const cardContent = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ 
                scale: 1.02, 
                y: -8,
                transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }}
            className={`
                h-full relative overflow-hidden
                bg-gradient-to-br from-slate-900/50 to-slate-800/30
                backdrop-blur-xl rounded-2xl 
                border border-slate-700/50
                p-6 lg:p-8
                hover:border-slate-600/60
                hover:shadow-2xl hover:${colorScheme.glow}
                transition-all duration-300 
                cursor-pointer group 
                ${className}
            `}
            onClick={onClick}
        >
            {/* Subtle gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <motion.div 
                        className={`
                            w-12 h-12 lg:w-14 lg:h-14 
                            ${colorScheme.iconBg}
                            rounded-xl flex items-center justify-center
                            border ${colorScheme.border}
                            group-hover:scale-110 group-hover:rotate-3
                            transition-all duration-300
                        `}
                        whileHover={{ rotate: 6 }}
                    >
                        <Icon className={`w-6 h-6 lg:w-7 lg:h-7 ${colorScheme.icon}`} />
                    </motion.div>
                    
                    {variant === 'navigation' && (
                        <motion.div 
                            className={`w-3 h-3 ${colorScheme.iconBg} rounded-full border ${colorScheme.border} opacity-60 group-hover:opacity-100`}
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </div>

                {variant === 'stats' ? (
                    <>
                        <h3 className="text-slate-400 text-sm lg:text-base font-medium mb-2">
                            {title}
                        </h3>
                        <motion.p
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="text-3xl lg:text-4xl font-bold text-white group-hover:text-slate-100"
                        >
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </motion.p>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 lg:mb-3 group-hover:text-slate-100 transition-colors duration-300">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-slate-400 text-sm lg:text-base leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                                {description}
                            </p>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    )

    if (href && variant === 'navigation') {
        return (
            <Link href={href}>
                {cardContent}
            </Link>
        )
    }

    return cardContent
}

export default BaseCard