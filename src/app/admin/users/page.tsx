"use client"

import { motion } from "framer-motion";
import { AddUserButton, UserManagementTable } from "@/features/admin/components";

export default function AdminUsersPage() {
    return (
        <div className="space-y-8 lg:space-y-10">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="space-y-6"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 xl:gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-2"
                    >
                        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-slate-400 text-base lg:text-lg">
                            Manage users, roles, and permissions across your application
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <AddUserButton />
                    </motion.div>
                </div>
            </motion.div>

            {/* User Management Table Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8"
            >
                <UserManagementTable />
            </motion.div>
        </div>
    )
}