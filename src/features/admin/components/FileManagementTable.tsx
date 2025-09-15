"use client"

import React, { useEffect, useState } from "react"
import { useFileManagementStore } from "../hooks/useFileManagementStore"
import { Filter, Search, Folder, FileText, Image, Video, Music, Archive, File } from "lucide-react"
import { motion } from "framer-motion"
import { Pagination } from "./Pagination"
import { FileActionsDropdown } from "./FileActionsDropdown"
import { PathInput } from "./PathInput"

const fileTypes = ['FOLDER', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'ARCHIVE', 'CODE', 'TEXT', 'OTHER']

const getFileIcon = (type: string) => {
    switch (type) {
        case 'FOLDER': return <Folder className="w-4 h-4" />
        case 'PDF': return <FileText className="w-4 h-4" />
        case 'DOCUMENT': return <FileText className="w-4 h-4" />
        case 'IMAGE': return <Image className="w-4 h-4" />
        case 'VIDEO': return <Video className="w-4 h-4" />
        case 'AUDIO': return <Music className="w-4 h-4" />
        case 'ARCHIVE': return <Archive className="w-4 h-4" />
        default: return <File className="w-4 h-4" />
    }
}

const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return 'N/A'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const formatDate = (date?: string | Date): string => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusColor = (isReal: boolean) => {
    return isReal 
        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
        : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
}

export function FileManagementTable() {
    const { 
        filteredFiles,
        searchTerm,
        error,
        isLoading, 
        filters,
        currentPage,
        totalPages,
        totalFiles,
        clearError,
        setSearchTerm,
        setFilters,
        setPage,
        fetchFiles
    } = useFileManagementStore()

    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

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
                        placeholder="Search files..."
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
                                Type
                            </label>
                            <select
                                value={filters.type || 'all'}
                                onChange={(e) => setFilters({ type: e.target.value === 'all' ? undefined : e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="all" className="bg-slate-800 text-white">All Types</option>
                                {fileTypes.map(type => (
                                    <option key={type} value={type} className="bg-slate-800 text-white">
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                Status
                            </label>
                            <select
                                value={filters.isReal || 'all'}
                                onChange={(e) => setFilters({ isReal: e.target.value === 'all' ? undefined : e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="all" className="bg-slate-800 text-white">All Files</option>
                                <option value="real" className="bg-slate-800 text-white">Real Files</option>
                                <option value="fake" className="bg-slate-800 text-white">Fake Files</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                Parent Path
                            </label>
                            <PathInput
                                value={filters.parentPath || ''}
                                onChange={(value) => setFilters({ parentPath: value || undefined })}
                                placeholder="Filter by path..."
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Files Table */}
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-600/30 rounded-xl relative overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <React.Fragment key="file-list">
                        {/* Desktop Table */}
                        <div className="hidden xl:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/30 border-b border-slate-600/30">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">File</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Type</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Size</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Status</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Path</th>
                                        <th className="text-left py-4 px-6 text-slate-300 font-medium">Modified</th>
                                        <th className="text-center py-4 px-6 text-slate-300 font-medium w-20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-slate-400">
                                                No files found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredFiles.map((file, index) => (
                                            <tr key={index} className="border-b border-slate-600/20 hover:bg-slate-700/20 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center text-white">
                                                            {getFileIcon(file.type)}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium truncate max-w-[200px]" title={file.name}>
                                                                {file.name}
                                                            </p>
                                                            {file.user && (
                                                                <p className="text-slate-400 text-sm">
                                                                    by {file.user.name || file.user.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                        {file.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-slate-300">
                                                    {formatFileSize(file.size)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(file.isReal)}`}>
                                                        {file.isReal ? 'Real' : 'Fake'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-slate-400 truncate max-w-[150px]" title={file.parentPath || '/'}>
                                                    {file.parentPath || '/'}
                                                </td>
                                                <td className="py-4 px-6 text-slate-400">
                                                    {formatDate(file.updatedAt)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        <FileActionsDropdown file={file} />
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
                            {filteredFiles.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    No files found
                                </div>
                            ) : (
                                filteredFiles.map((file, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center text-white">
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-white font-medium truncate" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                    {file.user && (
                                                        <p className="text-slate-400 text-sm">
                                                            by {file.user.name || file.user.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <FileActionsDropdown file={file} />
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                {file.type}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(file.isReal)}`}>
                                                {file.isReal ? 'Real' : 'Fake'}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-400">Size: </span>
                                                <span className="text-slate-300">{formatFileSize(file.size)}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Modified: </span>
                                                <span className="text-slate-300">{formatDate(file.updatedAt)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-slate-400 text-sm">
                                            <span>Path: </span>
                                            <span className="text-slate-300" title={file.parentPath || '/'}>
                                                {file.parentPath || '/'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </React.Fragment>
                )}
                
                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalFiles}
                    onPageChange={setPage}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}