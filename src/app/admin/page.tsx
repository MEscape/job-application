"use client"

import {QuickStats, UserLocationMap} from "@/features/admin/components"
import { dashboardCards } from "@/features/admin/constants/cards"
import { BaseCard } from "@/features/shared/components"
import { motion } from "framer-motion"

export default function AdminPage() {
    return (
        <div className="space-y-8 lg:space-y-12">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-center space-y-4"
            >
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent"
                >
                    Admin Dashboard
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-slate-400 text-base lg:text-xl max-w-2xl mx-auto"
                >
                    Monitor and manage your application with powerful admin tools
                </motion.p>
            </motion.div>

            {/* Quick Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <QuickStats />
            </motion.div>

            {/* User Locations Map Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="space-y-6"
            >
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="text-xl lg:text-2xl font-semibold text-white mb-6"
                >
                    User Locations
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8"
                >
                    <UserLocationMap height="500px" />
                </motion.div>
            </motion.div>

            {/* Navigation Cards Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6"
            >
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-xl lg:text-2xl font-semibold text-white mb-6"
                >
                    Quick Actions
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {dashboardCards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                                duration: 0.6, 
                                delay: 0.6 + (index * 0.1),
                                ease: "easeOut"
                            }}
                            whileHover={{ y: -5 }}
                            className="transform-gpu"
                        >
                            <BaseCard {...card} variant="navigation" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}