"use client"

import { useEffect, useState } from "react"
import { Search, Filter } from "lucide-react"
import { useUserManagementStore } from "@/features/admin/hooks/useUserManagementStore"
import { UserActionsDropdown } from "./UserActionsDropdown"
import { motion } from "framer-motion"

export function UserManagementTable() {
    const {
        filteredUsers,
        searchTerm,
        filters,
        isLoading,
        error,
        fetchUsers,
        setSearchTerm,
        setFilters,
        clearError
    } = useUserManagementStore()

    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const formatLastLogin = (lastLogin: Date | null | undefined) => {
        if (!lastLogin) return 'Never'
        return new Date(lastLogin).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getRoleColor = (isAdmin: boolean) => {
        return isAdmin 
            ? 'bg-red-500/20 text-red-300' 
            : 'bg-blue-500/20 text-blue-300'
    }

    const getStatusColor = (isActive: boolean) => {
        return isActive 
            ? 'bg-green-500/20 text-green-300' 
            : 'bg-gray-500/20 text-gray-300'
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <p className="text-red-300">Error: {error}</p>
                    <button 
                        onClick={clearError}
                        className="text-red-300 hover:text-red-200 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-4 py-3 rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 min-w-[100px]"
                >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                Role
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ role: e.target.value as any })}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="all" className="bg-slate-800 text-white">All Roles</option>
                                <option value="admin" className="bg-slate-800 text-white">Admin</option>
                                <option value="user" className="bg-slate-800 text-white">User</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ status: e.target.value as any })}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="all" className="bg-slate-800 text-white">All Status</option>
                                <option value="active" className="bg-slate-800 text-white">Active</option>
                                <option value="inactive" className="bg-slate-800 text-white">Inactive</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                Company
                            </label>
                            <input
                                type="text"
                                placeholder="Filter by company..."
                                value={filters.company || ''}
                                onChange={(e) => setFilters({ company: e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Users Table */}
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-600/30 rounded-xl relative overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden xl:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/30 border-b border-slate-600/30">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">User</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Role</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Status</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Last Login</th>
                                        <th className="text-center py-4 px-6 text-slate-300 font-medium w-20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-slate-400">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-slate-600/20 hover:bg-slate-700/20 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <span className="text-white font-medium text-sm">
                                                                {user.email.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{user.name || 'No name'}</p>
                                                            <p className="text-slate-400 text-sm">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.isAdmin)}`}>
                                                        {user.isAdmin ? 'Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-slate-400">{formatLastLogin(user.lastLogin)}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        <UserActionsDropdown user={user} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="xl:hidden space-y-4 p-4">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    No users found
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white font-medium text-sm">
                                                        {(user.name || user.email).charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.name || 'No name'}</p>
                                                    <p className="text-slate-400 text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                            <UserActionsDropdown user={user} />
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.isAdmin)}`}>
                                                {user.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        
                                        <div className="text-slate-400 text-sm">
                                            Last login: {formatLastLogin(user.lastLogin)}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}