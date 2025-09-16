"use client"

import { motion } from "framer-motion"
import { Search, Filter, Eye, User, Shield, FileText, Navigation, Check, X, CheckCircle, Clock, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Pagination } from "@/features/admin/components/Pagination"
import { ConfirmationModal } from "./ConfirmationModal"

interface ActivityLog {
    id: string
    userId: string
    userName: string
    userEmail: string
    action: string
    resource: string
    timestamp: string
    success: boolean
    isRead: boolean
    readBy: {
        id: string
        name: string
        email: string
    } | null
    readAt: string | null
}

interface ActivityLogsData {
    logs: ActivityLog[]
    total: number
    page: number
    totalPages: number
}

type FilterType = 'all' | 'login' | 'admin' | 'file' | 'navigation' | 'unread' | 'read'

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
    const [selectedLogs, setSelectedLogs] = useState<string[]>([])
    const [markingAsRead, setMarkingAsRead] = useState(false)
    const [deletingLogs, setDeletingLogs] = useState(false)
    const [showDeleteFilters, setShowDeleteFilters] = useState(false)
    const [deleteFilters, setDeleteFilters] = useState({
        startDate: '',
        endDate: '',
        onlyRead: true
    })
    const [showBulkActions, setShowBulkActions] = useState(false)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        message: string
        onConfirm: () => void
        type?: 'danger' | 'warning' | 'info'
        isLoading?: boolean
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {} })

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



    const markAsRead = async (activityIds: string[], markAsRead = true) => {
        setMarkingAsRead(true)
        try {
            const response = await fetch('/api/admin/activity/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activityIds,
                    markAsRead
                })
            })
            
            if (response.ok) {
                // Refresh the logs
                await fetchLogs(currentPage, searchTerm, filter)
                setSelectedLogs([])
            }
        } catch (error) {
            console.error('Failed to mark activities as read:', error)
        } finally {
            setMarkingAsRead(false)
        }
    }

    const toggleLogReadStatus = async (logId: string, currentStatus: boolean) => {
        await markAsRead([logId], !currentStatus)
    }

    const performBulkOperation = async (operation: 'mark_read' | 'mark_unread') => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }))
        try {
            const endpoint = '/api/admin/activity/bulk'
            
            const body = {
                markAsRead: operation === 'mark_read',
                filters: {
                    search: searchTerm,
                    filter,
                    readStatus: operation === 'mark_read' ? 'unread' : 'read'
                }
            }
            
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })
            
            if (response.ok) {
                await response.json()
                // Reset to page 1 after bulk operations to ensure we see updated data
                setCurrentPage(1)
                await fetchLogs(1, searchTerm, filter)
                setSelectedLogs([])
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })
            } else {
                console.error('Failed to perform bulk operation')
            }
        } catch (error) {
            console.error('Error performing bulk operation:', error)
        }
    }
    
    const markAllUnreadAsRead = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Mark All Unread as Read',
            message: 'This will mark ALL unread activities across all pages as read. This action cannot be undone.',
            onConfirm: () => performBulkOperation('mark_read'),
            type: 'info'
        })
    }
    
    const markAllAsUnread = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Mark All as Unread',
            message: 'This will mark ALL read activities across all pages as unread. This action cannot be undone.',
            onConfirm: () => performBulkOperation('mark_unread'),
            type: 'warning'
        })
    }

    const deleteLogs = (logIds: string[]) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Selected Activities',
            message: `Are you sure you want to delete ${logIds.length} activity log${logIds.length > 1 ? 's' : ''}? This action cannot be undone.`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }))
                try {
                    const response = await fetch('/api/admin/activity', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            logIds
                        })
                    })

                    if (response.ok) {
                        const result = await response.json()
                        // If we deleted items and current page is now empty, go to previous page
                        const newPage = data.logs.length <= logIds.length && currentPage > 1 ? currentPage - 1 : currentPage
                        await fetchLogs(newPage, searchTerm, filter)
                        if (newPage !== currentPage) {
                            setCurrentPage(newPage)
                        }
                        setSelectedLogs([])
                        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })
                    } else {
                        console.error('Failed to delete logs')
                    }
                } catch (error) {
                    console.error('Error deleting logs:', error)
                }
            },
            type: 'danger'
        })
    }

    const deleteWithFilters = () => {
        if (!deleteFilters.startDate || !deleteFilters.endDate) {
            setConfirmModal({
                isOpen: true,
                title: 'Missing Date Range',
                message: 'Please select both start and end dates before proceeding.',
                onConfirm: () => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} }),
                type: 'warning'
            })
            return
        }

        const confirmMessage = `Delete ${deleteFilters.onlyRead ? 'read' : 'all'} activities from ${deleteFilters.startDate} to ${deleteFilters.endDate}? This action cannot be undone.`
        setConfirmModal({
            isOpen: true,
            title: 'Delete Activities by Date Range',
            message: confirmMessage,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }))
                try {
                    const response = await fetch('/api/admin/activity/bulk', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            filters: {
                                startDate: deleteFilters.startDate,
                                endDate: deleteFilters.endDate,
                                readStatus: deleteFilters.onlyRead ? 'read' : 'all'
                            }
                        })
                    })

                    if (response.ok) {
                        const result = await response.json()
                        // Reset to page 1 after bulk delete to ensure we see remaining data
                        setCurrentPage(1)
                        await fetchLogs(1, searchTerm, filter)
                        setShowDeleteFilters(false)
                        setDeleteFilters({ startDate: '', endDate: '', onlyRead: true })
                        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })
                    } else {
                        const errorData = await response.json()
                        console.error('Failed to delete logs:', errorData)
                        setConfirmModal({
                            isOpen: true,
                            title: 'Delete Failed',
                            message: errorData.error || 'Failed to delete activities. Please try again.',
                            onConfirm: () => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} }),
                            type: 'danger'
                        })
                    }
                } catch (error) {
                    console.error('Error deleting logs:', error)
                    setConfirmModal({
                        isOpen: true,
                        title: 'Delete Failed',
                        message: 'An error occurred while deleting activities. Please try again.',
                        onConfirm: () => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} }),
                        type: 'danger'
                    })
                }
            },
            type: 'danger'
        })
    }

    const handleSelectLog = (logId: string) => {
        setSelectedLogs(prev => 
            prev.includes(logId) 
                ? prev.filter(id => id !== logId)
                : [...prev, logId]
        )
    }

    const handleSelectAll = () => {
        if (selectedLogs.length === data.logs.length) {
            setSelectedLogs([])
        } else {
            setSelectedLogs(data.logs.map(log => log.id))
        }
    }

    const filterOptions = [
        { value: 'all', label: 'All Activities', icon: Eye },
        { value: 'unread', label: 'Unread', icon: X },
        { value: 'read', label: 'Read', icon: CheckCircle },
        { value: 'login', label: 'Login Attempts', icon: User },
        { value: 'admin', label: 'Admin Actions', icon: Shield },
        { value: 'file', label: 'File Operations', icon: FileText },
        { value: 'navigation', label: 'Navigation', icon: Navigation }
    ]

    return (
        <motion.div className="space-y-6">
            {/* Search, Filters and Actions */}
             <div className="flex flex-col gap-4">
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
                     <div className="flex gap-2">
                         <button 
                             onClick={() => setShowFilters(!showFilters)}
                             className="flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-4 py-3 rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 min-w-[100px]"
                         >
                             <Filter className="w-4 h-4" />
                             <span className="hidden sm:inline">Filter</span>
                         </button>
                         <button 
                             onClick={() => setShowBulkActions(!showBulkActions)}
                             className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 border min-w-[120px] ${
                                 showBulkActions 
                                     ? 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50 text-blue-300'
                                     : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/50 hover:border-slate-500/50 text-white'
                             }`}
                         >
                             <Check className="w-4 h-4" />
                             <span className="hidden sm:inline">Bulk Actions</span>
                         </button>
                         <button 
                             onClick={() => setShowDeleteFilters(!showDeleteFilters)}
                             className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 border min-w-[100px] ${
                                 showDeleteFilters
                                     ? 'bg-red-600/20 hover:bg-red-600/30 border-red-500/50 text-red-300'
                                     : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/50 hover:border-slate-500/50 text-red-300 hover:text-red-200'
                             }`}
                         >
                             <Trash2 className="w-4 h-4" />
                             <span className="hidden sm:inline">Delete</span>
                         </button>
                     </div>
                 </div>
             </div>

             {/* Bulk Actions Panel */}
             {showBulkActions && (
                 <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6"
                 >
                     <h3 className="text-slate-300 font-medium mb-4 flex items-center gap-2">
                         Bulk Mark Actions
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         <button
                             onClick={markAllUnreadAsRead}
                             disabled={markingAsRead}
                             className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-green-300 hover:text-green-200 px-4 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 justify-center"
                         >
                             <Check className="w-4 h-4" />
                             Mark All Unread as Read
                         </button>
                         <button
                             onClick={markAllAsUnread}
                             disabled={markingAsRead}
                             className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-orange-300 hover:text-orange-200 px-4 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 justify-center"
                         >
                             <X className="w-4 h-4" />
                             Mark All as Unread
                         </button>
                     </div>
                 </motion.div>
             )}

             {/* Selected Items Actions */}
             {selectedLogs.length > 0 && (
                 <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 backdrop-blur-xl"
                 >
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                             <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                             <span className="text-slate-300 font-medium">
                                 {selectedLogs.length} {selectedLogs.length === 1 ? 'activity' : 'activities'} selected
                             </span>
                         </div>
                         <div className="flex flex-wrap gap-2">
                             <button
                                 onClick={() => markAsRead(selectedLogs, true)}
                                 disabled={markingAsRead}
                                 className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-green-500/50 text-green-300 hover:text-green-200 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                             >
                                 <Check className="w-4 h-4" />
                                 Mark Read
                             </button>
                             <button
                                 onClick={() => markAsRead(selectedLogs, false)}
                                 disabled={markingAsRead}
                                 className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-orange-500/50 text-orange-300 hover:text-orange-200 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                             >
                                 <X className="w-4 h-4" />
                                 Mark Unread
                             </button>
                             <button
                                 onClick={() => deleteLogs(selectedLogs)}
                                 disabled={deletingLogs}
                                 className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-red-500/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                             >
                                 <Trash2 className="w-4 h-4" />
                                 {deletingLogs ? 'Deleting...' : 'Delete'}
                             </button>
                         </div>
                     </div>
                 </motion.div>
             )}

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

             {/* Time-based Delete Panel */}
             {showDeleteFilters && (
                 <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6"
                 >
                     <h3 className="text-slate-300 font-medium mb-4 flex items-center gap-2">
                         Time-based Activity Deletion
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         <div>
                             <label className="block text-slate-300 text-sm font-medium mb-2">
                                 Start Date
                             </label>
                             <input
                                 type="date"
                                 value={deleteFilters.startDate}
                                 onChange={(e) => setDeleteFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                 className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                                 style={{ colorScheme: 'dark' }}
                             />
                         </div>
                         <div>
                             <label className="block text-slate-300 text-sm font-medium mb-2">
                                 End Date
                             </label>
                             <input
                                 type="date"
                                 value={deleteFilters.endDate}
                                 onChange={(e) => setDeleteFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                 className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                                 style={{ colorScheme: 'dark' }}
                             />
                         </div>
                         <div>
                             <label className="block text-slate-300 text-sm font-medium mb-2">
                                 Options
                             </label>
                             <label className="flex items-center gap-2 text-slate-300">
                                 <input
                                     type="checkbox"
                                     checked={deleteFilters.onlyRead}
                                     onChange={(e) => setDeleteFilters(prev => ({ ...prev, onlyRead: e.target.checked }))}
                                     className="rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500 focus:ring-offset-slate-800"
                                 />
                                 Only delete read activities
                             </label>
                         </div>
                     </div>
                     <div className="flex gap-3 mt-6">
                         <button
                             onClick={deleteWithFilters}
                             disabled={deletingLogs || !deleteFilters.startDate || !deleteFilters.endDate}
                             className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-red-500/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             <Trash2 className="w-4 h-4" />
                             {deletingLogs ? 'Deleting...' : 'Delete Activities'}
                         </button>
                         <button
                             onClick={() => setShowDeleteFilters(false)}
                             className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-slate-200 px-4 py-2 rounded-lg transition-all duration-200"
                         >
                             <X className="w-4 h-4" />
                             Cancel
                         </button>
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
                                <th className="text-left py-4 px-6 text-slate-300 font-medium w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedLogs.length === data.logs.length && data.logs.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                                    />
                                </th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">User</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Action</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Resource</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Time</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Status</th>
                                <th className="text-left py-4 px-6 text-slate-300 font-medium">Read Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            <p className="text-slate-400 text-sm">Loading activity logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-400">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                data.logs.map((log) => (
                                    <tr 
                                         key={log.id} 
                                         className={`border-b border-slate-600/20 hover:bg-slate-700/20 transition-colors ${
                                         !log.isRead 
                                             ? 'bg-blue-500/5'
                                             : ''
                                     }`}
                                     >
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedLogs.includes(log.id)}
                                                onChange={() => handleSelectLog(log.id)}
                                                className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                                            />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
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
                                            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-400">{log.resource || 'N/A'}</td>
                                        <td className="py-4 px-6 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                                                log.success 
                                                    ? 'bg-slate-700/50 text-slate-300 border-slate-600/50' 
                                                    : 'bg-red-900/20 text-red-300 border-red-500/30'
                                            }`}>
                                                {log.success ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleLogReadStatus(log.id, log.isRead)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                                        log.isRead 
                                                            ? 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50' 
                                                            : 'bg-blue-900/20 text-blue-300 border-blue-500/30 hover:bg-blue-900/30'
                                                    }`}
                                                    title={log.isRead ? 'Mark as unread' : 'Mark as read'}
                                                >
                                                    {log.isRead ? (
                                                        <>
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            <span>Read</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>New</span>
                                                        </>
                                                    )}
                                                </button>
                                                {log.isRead && log.readBy && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span>by {log.readBy.name}</span>
                                                    </div>
                                                )}
                                            </div>
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
                                <div key={i} className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 animate-pulse">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-slate-700/50 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-700/50 rounded w-24 mb-1"></div>
                                            <div className="h-3 bg-slate-700/50 rounded w-32"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-700/50 rounded w-20"></div>
                                        <div className="h-3 bg-slate-700/50 rounded w-16"></div>
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
                            <div 
                                 key={log.id} 
                                 className={`bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 space-y-3 hover:bg-slate-700/20 transition-colors ${
                                     !log.isRead 
                                         ? 'border-l-4 border-blue-500'
                                         : ''
                                 }`}
                             >
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedLogs.includes(log.id)}
                                        onChange={() => handleSelectLog(log.id)}
                                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
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
                                    <div>
                                        <p className="text-slate-500 mb-2">Read Status</p>
                                        <button
                                            onClick={() => toggleLogReadStatus(log.id, log.isRead)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                                log.isRead 
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 animate-pulse'
                                            }`}
                                            title={log.isRead ? 'Mark as unread' : 'Mark as read'}
                                        >
                                            {log.isRead ? (
                                                <>
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    <span>Read</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>New</span>
                                                </>
                                            )}
                                        </button>
                                        {log.isRead && log.readBy && (
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>by {log.readBy.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
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
            
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                type={confirmModal.type}
                isLoading={confirmModal.isLoading}
            />
        </motion.div>
    )
}