import { Folder, ChevronLeft, ChevronRight, Search, Grid3X3, List, MoreHorizontal } from "lucide-react";
import React from "react";

export const DocumentsApp: React.FC = () => (
    <div className="h-full bg-gray-50 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            className="pl-9 pr-4 py-1.5 bg-gray-100 border-0 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Search Documents"
                        />
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar and main content */}
        <div className="flex flex-1">
            {/* Sidebar */}
            <div className="w-48 bg-gray-100 border-r border-gray-200 p-3">
                <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Favorites</div>
                    <div className="flex items-center space-x-2 px-2 py-1.5 text-sm text-blue-600 bg-blue-100 rounded">
                        <Folder className="w-4 h-4" />
                        <span>Documents</span>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded">
                        <span className="text-blue-500">📁</span>
                        <span>Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded">
                        <span className="text-purple-500">📁</span>
                        <span>Downloads</span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 bg-white">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-lg font-semibold text-gray-900">Documents</h1>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* File list */}
                    <div className="space-y-1">
                        {[
                            { name: "Project Proposal.pdf", date: "Today at 2:34 PM", size: "2.4 MB", icon: "📄", color: "text-red-500" },
                            { name: "Meeting Notes", date: "Yesterday at 4:15 PM", size: "—", icon: "📁", color: "text-blue-500" },
                            { name: "Budget 2024.xlsx", date: "Dec 15 at 10:22 AM", size: "1.2 MB", icon: "📊", color: "text-green-500" },
                            { name: "Design Assets", date: "Dec 14 at 3:45 PM", size: "—", icon: "📁", color: "text-purple-500" },
                            { name: "Contract Draft.docx", date: "Dec 12 at 9:18 AM", size: "890 KB", icon: "📝", color: "text-blue-600" },
                            { name: "Presentation.pptx", date: "Dec 10 at 1:30 PM", size: "5.2 MB", icon: "📊", color: "text-orange-500" },
                            { name: "Research Notes.txt", date: "Dec 8 at 11:45 AM", size: "45 KB", icon: "📝", color: "text-gray-500" },
                        ].map((file, i) => (
                            <div key={i} className="flex items-center px-3 py-2 hover:bg-blue-50 rounded-md cursor-pointer group">
                                <div className="flex-1 flex items-center min-w-0">
                                    <span className={`text-lg mr-3 ${file.color}`}>{file.icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                                        <div className="text-xs text-gray-500">{file.date}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-4">{file.size}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);