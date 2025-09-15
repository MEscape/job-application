"use client"

import { motion } from "framer-motion"
import { ActivityStats, UserOnlineStatus, ActivityLogs } from "@/features/admin/components/activity"

export default function ActivityPage() {
    return (
        <div className="min-h-screen space-y-8 lg:space-y-12">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="space-y-6"
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                        System Activity
                    </h1>
                    <p className="text-slate-400 text-base lg:text-lg">
                        Monitor real-time system performance, user activity, and comprehensive analytics
                    </p>
                </motion.div>
            </motion.div>

            {/* Activity Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <ActivityStats />
            </motion.div>

            {/* User Online Status Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <UserOnlineStatus />
            </motion.div>

            {/* Activity Logs Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
            >
                <ActivityLogs />
            </motion.div>
        </div>
    )
}