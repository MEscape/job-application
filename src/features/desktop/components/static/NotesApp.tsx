import React from "react";
import { Search, Share, Trash2, Edit3 } from "lucide-react";

export const NotesApp: React.FC = () => (
    <div className="h-full bg-yellow-50 flex flex-col">

        <div className="flex-1 flex">
            {/* Sidebar */}
            <div className="w-80 bg-yellow-100 border-r border-yellow-200 flex flex-col">
                {/* Search bar */}
                <div className="p-4 border-b border-yellow-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search notes" 
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        />
                    </div>
                </div>

                {/* Notes list */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-2 space-y-1">
                        <div className="bg-yellow-200 rounded-lg p-3 cursor-pointer border-l-4 border-yellow-500">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-yellow-900 text-sm">Meeting Notes</h3>
                                <span className="text-xs text-yellow-600">2:30 PM</span>
                            </div>
                            <p className="text-xs text-yellow-700 mb-2">Today</p>
                            <p className="text-xs text-yellow-600 line-clamp-2">Discuss project timeline and next steps for the upcoming release...</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 cursor-pointer hover:bg-yellow-50 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-yellow-900 text-sm">Shopping List</h3>
                                <span className="text-xs text-yellow-600">Yesterday</span>
                            </div>
                            <p className="text-xs text-yellow-700 mb-2">Dec 20</p>
                            <p className="text-xs text-yellow-600 line-clamp-2">Milk, Bread, Eggs, Apples, Chicken breast...</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 cursor-pointer hover:bg-yellow-50 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-yellow-900 text-sm">Project Ideas</h3>
                                <span className="text-xs text-yellow-600">Dec 18</span>
                            </div>
                            <p className="text-xs text-yellow-700 mb-2">3 days ago</p>
                            <p className="text-xs text-yellow-600 line-clamp-2">New features for the desktop app, including better window management...</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 cursor-pointer hover:bg-yellow-50 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-yellow-900 text-sm">Travel Plans</h3>
                                <span className="text-xs text-yellow-600">Dec 15</span>
                            </div>
                            <p className="text-xs text-yellow-700 mb-2">1 week ago</p>
                            <p className="text-xs text-yellow-600 line-clamp-2">Summer vacation itinerary and booking details...</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Note header */}
                <div className="bg-white border-b border-yellow-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-yellow-900 mb-1">Meeting Notes</h1>
                        <p className="text-sm text-yellow-600">Today at 2:30 PM • Edited 5 minutes ago</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="text-yellow-600 hover:text-yellow-800 transition-colors p-2 rounded-lg hover:bg-yellow-100">
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-800 transition-colors p-2 rounded-lg hover:bg-yellow-100">
                            <Share className="w-4 h-4" />
                        </button>
                        <button className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {/* Note content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-yellow max-w-none">
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-yellow-800 mb-3 border-b border-yellow-200 pb-2">📋 Attendees</h3>
                                <ul className="text-yellow-700 space-y-2 ml-4">
                                    <li className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>John Smith (Project Manager)</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>Sarah Johnson (UI/UX Designer)</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>Mike Chen (Senior Developer)</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>Lisa Wang (QA Engineer)</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-yellow-800 mb-3 border-b border-yellow-200 pb-2">📝 Agenda</h3>
                                <ol className="text-yellow-700 space-y-2 ml-4">
                                    <li className="flex items-start space-x-2">
                                        <span className="text-yellow-500 font-medium">1.</span>
                                        <span>Project timeline review and milestone assessment</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-yellow-500 font-medium">2.</span>
                                        <span>Design mockup feedback and iteration planning</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-yellow-500 font-medium">3.</span>
                                        <span>Technical implementation discussion and architecture review</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-yellow-500 font-medium">4.</span>
                                        <span>Resource allocation and team responsibilities</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-yellow-500 font-medium">5.</span>
                                        <span>Next steps and upcoming deadlines</span>
                                    </li>
                                </ol>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800 mb-3 border-b border-yellow-200 pb-2">✅ Action Items</h3>
                                <ul className="text-yellow-700 space-y-3 ml-4">
                                    <li className="flex items-start space-x-3">
                                        <input type="checkbox" className="mt-1 text-yellow-500 rounded" />
                                        <div>
                                            <span className="font-medium">Update project timeline</span>
                                            <span className="text-yellow-600 text-sm ml-2">(John - Due: Dec 23)</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <input type="checkbox" className="mt-1 text-yellow-500 rounded" />
                                        <div>
                                            <span className="font-medium">Revise design mockups based on feedback</span>
                                            <span className="text-yellow-600 text-sm ml-2">(Sarah - Due: Dec 25)</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <input type="checkbox" className="mt-1 text-yellow-500 rounded" defaultChecked />
                                        <div>
                                            <span className="font-medium line-through text-yellow-500">Set up development environment</span>
                                            <span className="text-yellow-600 text-sm ml-2">(Mike - Completed)</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <input type="checkbox" className="mt-1 text-yellow-500 rounded" />
                                        <div>
                                            <span className="font-medium">Conduct user testing sessions</span>
                                            <span className="text-yellow-600 text-sm ml-2">(Lisa - Due: Dec 27)</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <input type="checkbox" className="mt-1 text-yellow-500 rounded" />
                                        <div>
                                            <span className="font-medium">Schedule follow-up meeting</span>
                                            <span className="text-yellow-600 text-sm ml-2">(All - Due: Dec 22)</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);