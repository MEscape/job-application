"use client"

import { motion } from "framer-motion"
import { BaseCard } from "@/features/shared/components"
import { Activity, Users, Clock, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface ActivityStatsData {
    totalActivities: number
    activeUsers: number
    avgSessionTime: string
    dailyGrowth: number
}

export function ActivityStats() {
    const [stats, setStats] = useState<ActivityStatsData>({
        totalActivities: 0,
        activeUsers: 0,
        avgSessionTime: "0m",
        dailyGrowth: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/activity/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Failed to fetch activity stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    const statCards = [
        {
            title: "Total Activities",
            value: loading ? "..." : stats.totalActivities.toLocaleString(),
            icon: Activity,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Active Users",
            value: loading ? "..." : stats.activeUsers.toString(),
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500/10"
        },
        {
            title: "Avg Session Time",
            value: loading ? "..." : stats.avgSessionTime,
            icon: Clock,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-500/10"
        },
        {
            title: "Daily Growth",
            value: loading ? "..." : `${stats.dailyGrowth > 0 ? '+' : ''}${stats.dailyGrowth}%`,
            icon: TrendingUp,
            color: stats.dailyGrowth >= 0 ? "from-emerald-500 to-emerald-600" : "from-red-500 to-red-600",
            bgColor: stats.dailyGrowth >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
                const Icon = card.icon
                return (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/60 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">
                                        {card.title}
                                    </p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                    <Icon className={`w-6 h-6 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}