import React from "react";
import { ImageIcon, Star, Heart, Trash2, Search, Grid3X3, List, Filter } from "lucide-react";

export const PhotosApp: React.FC = () => (
    <div className="h-full bg-white flex flex-col">

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Library</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>2,847 photos</span>
                    <span>•</span>
                    <span>156 videos</span>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search photos" 
                        className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm w-64"
                    />
                </div>
                <button className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100">
                    <Filter className="w-4 h-4" />
                </button>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button className="p-1 rounded bg-white shadow-sm">
                        <Grid3X3 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="p-1 rounded text-gray-500">
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar and Main Content */}
        <div className="flex-1 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700">
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">All Photos</span>
                            <span className="ml-auto text-xs bg-blue-200 px-2 py-1 rounded-full">3,003</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <Heart className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Favorites</span>
                            <span className="ml-auto text-xs text-gray-500">47</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <Star className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Recently Added</span>
                            <span className="ml-auto text-xs text-gray-500">23</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <Trash2 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Recently Deleted</span>
                            <span className="ml-auto text-xs text-gray-500">12</span>
                        </div>
                    </div>
                </div>
                
                <div className="px-4 pb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Albums</h3>
                    <div className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded"></div>
                            <span className="text-sm text-gray-700">Vacation 2024</span>
                            <span className="ml-auto text-xs text-gray-500">156</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-blue-400 rounded"></div>
                            <span className="text-sm text-gray-700">Family</span>
                            <span className="ml-auto text-xs text-gray-500">89</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded"></div>
                            <span className="text-sm text-gray-700">Work Events</span>
                            <span className="ml-auto text-xs text-gray-500">34</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {/* December 2024 */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">December 2024</h2>
                            <span className="text-sm text-gray-500">47 items</span>
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                            {Array.from({ length: 16 }, (_, i) => (
                                <div key={i} className="aspect-square bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-105 transition-all cursor-pointer group relative overflow-hidden">
                                    <ImageIcon className="w-6 h-6 text-white opacity-70 group-hover:opacity-90" />
                                    {i === 3 && (
                                        <Heart className="absolute top-1 right-1 w-3 h-3 text-red-400 fill-current" />
                                    )}
                                    {i === 7 && (
                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">4:32</div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* November 2024 */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">November 2024</h2>
                            <span className="text-sm text-gray-500">89 items</span>
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                            {Array.from({ length: 24 }, (_, i) => (
                                <div key={i} className="aspect-square bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 rounded-lg flex items-center justify-center hover:scale-105 transition-all cursor-pointer group relative overflow-hidden">
                                    <ImageIcon className="w-6 h-6 text-white opacity-70 group-hover:opacity-90" />
                                    {i === 5 && (
                                        <Star className="absolute top-1 right-1 w-3 h-3 text-yellow-400 fill-current" />
                                    )}
                                    {i === 12 && (
                                        <Heart className="absolute top-1 right-1 w-3 h-3 text-red-400 fill-current" />
                                    )}
                                    {i === 18 && (
                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">2:15</div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* October 2024 */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">October 2024</h2>
                            <span className="text-sm text-gray-500">134 items</span>
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                            {Array.from({ length: 32 }, (_, i) => (
                                <div key={i} className="aspect-square bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-105 transition-all cursor-pointer group relative overflow-hidden">
                                    <ImageIcon className="w-6 h-6 text-white opacity-70 group-hover:opacity-90" />
                                    {i === 8 && (
                                        <Heart className="absolute top-1 right-1 w-3 h-3 text-red-400 fill-current" />
                                    )}
                                    {i === 15 && (
                                        <Star className="absolute top-1 right-1 w-3 h-3 text-yellow-400 fill-current" />
                                    )}
                                    {i === 23 && (
                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">1:47</div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
