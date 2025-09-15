"use client"

import { motion } from "framer-motion"
import { BaseCard } from "@/features/shared/components"
import { Users, Wifi, WifiOff, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface OnlineUser {
    id: string
    name: string
    email: string
    lastActivity: string
    isOnline: boolean
    sessionDuration: string
}

interface OnlineStatusData {
    onlineUsers: OnlineUser[]
    totalOnline: number
    totalOffline: number
    peakHours: { hour: number; count: number }[]
}

export function UserOnlineStatus() {
    const [data, setData] = useState<OnlineStatusData>({
        onlineUsers: [],
        totalOnline: 0,
        totalOffline: 0,
        peakHours: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOnlineStatus = async () => {
            try {
                const response = await fetch('/api/admin/activity/online-status')
                if (response.ok) {
                    const result = await response.json()
                    setData(result)
                }
            } catch (error) {
                console.error('Failed to fetch online status:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOnlineStatus()
        // Refresh every 10 seconds for real-time updates
        const interval = setInterval(fetchOnlineStatus, 10000)
        return () => clearInterval(interval)
    }, [])

    const maxPeakCount = Math.max(...data.peakHours.map(h => h.count), 1)

    return (
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-1 xl:grid-cols-2 lg:gap-6">
            {/* Online Users List */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/60 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Online Users
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-400">
                                <Wifi className="w-4 h-4" />
                                {data.totalOnline} Online
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                                <WifiOff className="w-4 h-4" />
                                {data.totalOffline} Offline
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">
                                Loading online users...
                            </div>
                        ) : data.onlineUsers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                No users currently online
                            </div>
                        ) : (
                            data.onlineUsers.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-slate-400'}`} />
                                        <div>
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-slate-400 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="text-slate-300 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {user.sessionDuration}
                                        </p>
                                        <p className="text-slate-400">
                                            {user.lastActivity}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Peak Hours Chart */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full"
            >
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/60 hover:shadow-2xl transition-all duration-300 h-full">
                    <h3 className="text-xl font-semibold text-white mb-6">
                        Peak Activity Hours (24h)
                    </h3>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {data.peakHours.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                No peak activity data available
                            </div>
                        ) : (
                            data.peakHours.map((hour, index) => {
                                const percentage = (hour.count / maxPeakCount) * 100
                                return (
                                    <motion.div
                                        key={hour.hour}
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.02 }}
                                        className="flex items-center gap-3 min-w-0"
                                    >
                                        <span className="text-slate-400 text-sm w-12 flex-shrink-0">
                                            {hour.hour.toString().padStart(2, '0')}:00
                                        </span>
                                        <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden min-w-0">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, delay: index * 0.02 }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-white text-sm w-10 text-right flex-shrink-0">
                                            {hour.count}
                                        </span>
                                    </motion.div>
                                )
                            })
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}