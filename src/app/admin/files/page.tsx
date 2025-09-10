"use client"

import { FileText, Upload, Search, Filter, Download, Trash2, Eye, MoreVertical } from "lucide-react"
import { useState } from "react"

export default function AdminFilesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    
    // Mock file data
    const files = [
        { id: 1, name: "project-proposal.pdf", size: "2.4 MB", type: "PDF", uploadedBy: "John Doe", uploadDate: "2024-01-15", downloads: 12 },
        { id: 2, name: "user-manual.docx", size: "1.8 MB", type: "Document", uploadedBy: "Jane Smith", uploadDate: "2024-01-14", downloads: 8 },
        { id: 3, name: "presentation.pptx", size: "5.2 MB", type: "Presentation", uploadedBy: "Bob Johnson", uploadDate: "2024-01-13", downloads: 15 },
        { id: 4, name: "data-export.xlsx", size: "3.1 MB", type: "Spreadsheet", uploadedBy: "Alice Brown", uploadDate: "2024-01-12", downloads: 6 },
        { id: 5, name: "system-backup.zip", size: "45.7 MB", type: "Archive", uploadedBy: "System", uploadDate: "2024-01-11", downloads: 2 },
    ]

    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getFileIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf': return '📄'
            case 'document': return '📝'
            case 'presentation': return '📊'
            case 'spreadsheet': return '📈'
            case 'archive': return '🗜️'
            default: return '📁'
        }
    }

    const totalSize = files.reduce((acc, file) => {
        const size = parseFloat(file.size.split(' ')[0])
        return acc + size
    }, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Files</h1>
                    <p className="text-white/60 mt-1">Manage uploaded files and documents</p>
                </div>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search files..."
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

            {/* Files Table */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="text-left py-4 px-6 text-white/80 font-medium">File</th>
                                <th className="text-left py-4 px-6 text-white/80 font-medium">Size</th>
                                <th className="text-left py-4 px-6 text-white/80 font-medium">Uploaded By</th>
                                <th className="text-left py-4 px-6 text-white/80 font-medium">Upload Date</th>
                                <th className="text-left py-4 px-6 text-white/80 font-medium">Downloads</th>
                                <th className="text-right py-4 px-6 text-white/80 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFiles.map((file) => (
                                <tr key={file.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                                            <div>
                                                <p className="text-white font-medium">{file.name}</p>
                                                <p className="text-white/60 text-sm">{file.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-white/70">{file.size}</td>
                                    <td className="py-4 px-6 text-white/70">{file.uploadedBy}</td>
                                    <td className="py-4 px-6 text-white/70">{file.uploadDate}</td>
                                    <td className="py-4 px-6">
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                                            {file.downloads}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="text-white/60 hover:text-white transition-colors p-1">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="text-white/60 hover:text-white transition-colors p-1">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button className="text-white/60 hover:text-red-400 transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="text-white/60 hover:text-white transition-colors p-1">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{files.length}</p>
                            <p className="text-white/60 text-sm">Total Files</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">MB</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalSize.toFixed(1)}</p>
                            <p className="text-white/60 text-sm">Total Size (MB)</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <Download className="w-8 h-8 text-purple-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">{files.reduce((acc, file) => acc + file.downloads, 0)}</p>
                            <p className="text-white/60 text-sm">Total Downloads</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                        <Upload className="w-8 h-8 text-orange-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">5</p>
                            <p className="text-white/60 text-sm">Today&#39;s Uploads</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}