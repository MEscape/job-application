"use client"

import { Activity, Clock, User, FileText, Settings, Shield, Search, Filter } from "lucide-react"
import { useState } from "react"

export default function AdminActivityPage() {
    const [searchTerm, setSearchTerm] = useState("")
    
    // Mock activity data
    const activities = [
        { 
            id: 1, 
            type: "user_login", 
            user: "John Doe", 
            action: "User logged in", 
            timestamp: "2024-01-15 14:30:25", 
            ip: "192.168.1.100",
            details: "Successful login from Chrome browser"
        },
        { 
            id: 2, 
            type: "file_upload", 
            user: "Jane Smith", 
            action: "File uploaded", 
            timestamp: "2024-01-15 14:25:10", 
            ip: "192.168.1.101",
            details: "project-proposal.pdf (2.4 MB)"
        },
        { 
            id: 3, 
            type: "user_created", 
            user: "Admin", 
            action: "New user created", 
            timestamp: "2024-01-15 14:20:45", 
            ip: "192.168.1.1",
            details: "Created user: alice@example.com"
        },
        { 
            id: 4, 
            type: "settings_changed", 
            user: "Bob Johnson", 
            action: "Settings modified", 
            timestamp: "2024-01-15 14:15:30", 
            ip: "192.168.1.102",
            details: "Updated notification preferences"
        },
        { 
            id: 5, 
            type: "file_download", 
            user: "Alice Brown", 
            action: "File downloaded", 
            timestamp: "2024-01-15 14:10:15", 
            ip: "192.168.1.103",
            details: "user-manual.docx"
        },
        { 
            id: 6, 
            type: "user_logout", 
            user: "John Doe", 
            action: "User logged out", 
            timestamp: "2024-01-15 14:05:00", 
            ip: "192.168.1.100",
            details: "Session ended normally"
        },
        { 
            id: 7, 
            type: "security_alert", 
            user: "System", 
            action: "Security alert", 
            timestamp: "2024-01-15 14:00:45", 
            ip: "Unknown",
            details: "Failed login attempt detected"
        },
    ]

    const filteredActivities = activities.filter(activity => 
        activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_login': return <User className="w-4 h-4 text-green-400" />
            case 'user_logout': return <User className="w-4 h-4 text-gray-400" />
            case 'user_created': return <User className="w-4 h-4 text-blue-400" />
            case 'file_upload': return <FileText className="w-4 h-4 text-purple-400" />
            case 'file_download': return <FileText className="w-4 h-4 text-orange-400" />
            case 'settings_changed': return <Settings className="w-4 h-4 text-yellow-400" />
            case 'security_alert': return <Shield className="w-4 h-4 text-red-400" />
            default: return <Activity className="w-4 h-4 text-white/60" />
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'user_login': return 'bg-green-500/20 border-green-500/30'
            case 'user_logout': return 'bg-gray-500/20 border-gray-500/30'
            case 'user_created': return 'bg-blue-500/20 border-blue-500/30'
            case 'file_upload': return 'bg-purple-500/20 border-purple-500/30'
            case 'file_download': return 'bg-orange-500/20 border-orange-500/30'
            case 'settings_changed': return 'bg-yellow-500/20 border-yellow-500/30'
            case 'security_alert': return 'bg-red-500/20 border-red-500/30'
            default: return 'bg-white/10 border-white/20'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Activity Log</h1>
                    <p className="text-white/60 mt-1">Monitor system activities and user actions</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20">
                        <Clock className="w-4 h-4" />
                        <span>Real-time</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                </button>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="space-y-4">
                    {filteredActivities.map((activity, index) => (
                        <div key={activity.id} className="flex items-start space-x-4">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                {index < filteredActivities.length - 1 && (
                                    <div className="w-0.5 h-8 bg-white/10 mt-2"></div>
                                )}
                            </div>
                            
                            {/* Activity content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-white font-medium">{activity.action}</p>
                                        <span className="text-white/60 text-sm">by {activity.user}</span>
                                    </div>
                                    <span className="text-white/40 text-sm">{activity.timestamp}</span>
                                </div>
                                <p className="text-white/70 text-sm mt-1">{activity.details}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-white/40 text-xs">IP: {activity.ip}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <Activity className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{activities.length}</p>
                            <p className="text-white/60 text-sm">Total Activities</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{activities.filter(a => a.type.includes('user')).length}</p>
                            <p className="text-white/60 text-sm">User Activities</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-purple-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{activities.filter(a => a.type.includes('file')).length}</p>
                            <p className="text-white/60 text-sm">File Activities</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <Shield className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{activities.filter(a => a.type === 'security_alert').length}</p>
                            <p className="text-white/60 text-sm">Security Alerts</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}