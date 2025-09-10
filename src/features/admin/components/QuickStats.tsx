"use client"

import React, { useEffect } from 'react'
import { Users, FileText, Activity, TrendingUp } from 'lucide-react'
import { useQuickStatsStore } from '@/features/admin/hooks/useQuickStatsStore'
import { BaseCard } from '@/features/shared/components'
import { motion } from 'framer-motion'

export function QuickStats() {
    const { stats, isLoading, error, fetchStats, clearError } = useQuickStatsStore()

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const statItems = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10',
            borderColor: 'border-blue-500/30'
        },
        {
            title: 'Total Files',
            value: stats?.totalFiles || 0,
            icon: FileText,
            color: 'text-emerald-400',
            bgColor: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10',
            borderColor: 'border-emerald-500/30'
        },
        {
            title: 'Active Users',
            value: stats?.activeUsers || 0,
            icon: Activity,
            color: 'text-purple-400',
            bgColor: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10',
            borderColor: 'border-purple-500/30'
        },
        {
            title: 'System Activity',
            value: `${stats?.systemActivity || 0}%`,
            icon: TrendingUp,
            color: 'text-amber-400',
            bgColor: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
            borderColor: 'border-amber-500/30'
        }
    ]

    if (error) {
        return (
            <div className="bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-500/20 p-4 lg:p-6">
                <div className="text-red-400 text-sm mb-2">Error loading stats</div>
                <div className="text-red-300 text-xs mb-3">{error}</div>
                <button
                    onClick={() => {
                        clearError()
                        fetchStats()
                    }}
                    className="text-red-400 hover:text-red-300 text-xs underline"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 lg:p-6">
                        <div className="animate-pulse">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 rounded-xl mb-3 lg:mb-4"></div>
                            <div className="h-3 lg:h-4 bg-white/10 rounded mb-2"></div>
                            <div className="h-6 lg:h-8 bg-white/10 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {statItems.map((item, index) => (
                <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                >
                    <BaseCard
                        title={item.title}
                        value={item.value}
                        icon={item.icon}
                        color={item.color.includes('blue') ? 'blue' : 
                               item.color.includes('emerald') ? 'emerald' : 
                               item.color.includes('purple') ? 'purple' : 'amber'}
                        variant="stats"
                    />
                </motion.div>
            ))}
        </div>
    )
}