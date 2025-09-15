"use client"

import { motion } from "framer-motion"
import { Search, Filter, Eye, User, Shield, FileText, Navigation } from "lucide-react"
import { useEffect, useState } from "react"
import { Pagination } from "@/features/admin/components/Pagination"

interface ActivityLog {
    id: string
    userId: string
    userName: string
    userEmail: string
    action: string
    resource: string
    timestamp: string
    success: boolean
}

interface ActivityLogsData {
    logs: ActivityLog[]
    total: number
    page: number
    totalPages: number
}

type FilterType = 'all' | 'login' | 'admin' | 'file' | 'navigation'

export function ActivityLogs() {
    const [data, setData] = useState<ActivityLogsData>({
        logs: [],
        total: 0,
        page: 1,
        totalPages: 1
    })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState<FilterType>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [showFilters, setShowFilters] = useState(false)

    const fetchLogs = async (page = 1, search = '', filterType = 'all') => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
                filter: filterType
            })
            
            const response = await fetch(`/api/admin/activity/logs?${params}`)
            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (error) {
            console.error('Failed to fetch activity logs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs(currentPage, searchTerm, filter)
    }, [currentPage, searchTerm, filter])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter)
        setCurrentPage(1)
    }



    const filterOptions = [
        { value: 'all', label: 'All Activities', icon: Eye },
        { value: 'login', label: 'Login Attempts', icon: User },
        { value: 'admin', label: 'Admin Actions', icon: Shield },
        { value: 'file', label: 'File Operations', icon: FileText },
        { value: 'navigation', label: 'Navigation', icon: Navigation }
    ]

    return (
        <motion.div className="space-y-6">
            {/* Search and Filters */}
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                 <div className="relative flex-1 max-w-full sm:max-w-md">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                     <input
                         type="text"
                         placeholder="Search activities..."
                         value={searchTerm}
                         onChange={handleSearch}
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
                                 Action
                             </label>
                             <select
                                 value={filter}
                                 onChange={(e) => handleFilterChange(e.target.value as FilterType)}
                                 className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                 style={{ colorScheme: 'dark' }}
                             >
                                 {filterOptions.map(option => (
                                     <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                                         {option.label}
                                     </option>
                                 ))}
                             </select>
                         </div>
                     </div>
                 </motion.div>
             )}

            {/* Activity Logs Table */}
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-600/30 rounded-xl relative overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/30 border-b border-slate-600/30">
                            <tr>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">User</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Action</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Resource</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Time</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            <p className="text-slate-400 text-sm">Loading activity logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                data.logs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-600/20 hover:bg-slate-700/20 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white font-medium text-sm">
                                                        {(log.userName || log.userEmail || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{log.userName || 'Unknown User'}</p>
                                                    <p className="text-slate-400 text-sm">{log.userEmail || 'No email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                log.action.includes('LOGIN') ? 'bg-blue-500/20 text-blue-400' :
                                                log.action.includes('ADMIN') ? 'bg-purple-500/20 text-purple-400' :
                                                log.action.includes('FILE') ? 'bg-green-500/20 text-green-400' :
                                                log.action.includes('NAVIGATE') ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-slate-500/20 text-slate-400'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-400">{log.resource || 'N/A'}</td>
                                        <td className="py-4 px-6 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {log.success ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Table */}
                <div className="xl:hidden space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-700 rounded w-24 mb-1"></div>
                                            <div className="h-3 bg-slate-700 rounded w-32"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-700 rounded w-20"></div>
                                        <div className="h-3 bg-slate-700 rounded w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : data.logs.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No activity logs found
                        </div>
                    ) : (
                        data.logs.map((log) => (
                            <div key={log.id} className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-medium text-sm">
                                            {(log.userName || log.userEmail || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{log.userName || 'Unknown User'}</p>
                                        <p className="text-slate-400 text-sm">{log.userEmail || 'No email'}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {log.success ? 'Success' : 'Failed'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 mb-1">Action</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            log.action.includes('LOGIN') ? 'bg-blue-500/20 text-blue-400' :
                                            log.action.includes('ADMIN') ? 'bg-purple-500/20 text-purple-400' :
                                            log.action.includes('FILE') ? 'bg-green-500/20 text-green-400' :
                                            log.action.includes('NAVIGATE') ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-slate-500/20 text-slate-400'
                                        }`}>
                                            {log.action}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">Resource</p>
                                        <p className="text-slate-300">{log.resource || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-slate-500 mb-1">Timestamp</p>
                                        <p className="text-slate-300">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={data.totalPages}
                    totalItems={data.total}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                    isLoading={loading}
                />
            </div>
        </motion.div>
    )
}