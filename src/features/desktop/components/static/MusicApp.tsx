import React from "react";
import { Play, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, MoreHorizontal } from "lucide-react";

export const MusicApp: React.FC = () => (
    <div className="h-full bg-white flex items-start justify-center p-4 pt-6">
            <div className="text-center text-gray-800 max-w-md w-full">
                {/* Album artwork */}
                <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border border-gray-200 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="w-36 h-36 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-xl flex items-center justify-center shadow-inner relative z-10">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                            <span className="text-4xl">🎵</span>
                        </div>
                    </div>
                </div>
                
                {/* Song info */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1 text-gray-900">Bohemian Rhapsody</h2>
                    <p className="text-lg text-gray-700 mb-1">Queen</p>
                    <p className="text-sm text-gray-500">A Night at the Opera</p>
                </div>
                
                {/* Progress bar */}
                <div className="w-full mb-6">
                    <div className="bg-gray-200 rounded-full h-2 mb-3 shadow-inner">
                        <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full h-2 w-1/3 shadow-sm relative">
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-400 rounded-full shadow-md"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>1:23</span>
                        <span>5:55</span>
                    </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                    <button className="text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-110 p-2">
                        <Shuffle className="w-6 h-6" />
                    </button>
                    <button className="text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-110 p-2">
                        <SkipBack className="w-7 h-7" />
                    </button>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 hover:from-blue-400 hover:to-purple-400 transition-all duration-200 hover:scale-105 shadow-lg">
                        <Play className="w-8 h-8 text-white ml-1" />
                    </button>
                    <button className="text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-110 p-2">
                        <SkipForward className="w-7 h-7" />
                    </button>
                    <button className="text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-110 p-2">
                        <Repeat className="w-6 h-6" />
                    </button>
                </div>

                {/* Bottom controls */}
                <div className="flex items-center justify-center space-x-8">
                    <button className="text-gray-600 hover:text-red-500 transition-all duration-200 hover:scale-110 p-2">
                        <Heart className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <Volume2 className="w-5 h-5 text-gray-600" />
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full h-1.5 w-3/4"></div>
                        </div>
                    </div>
                    <button className="text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-110 p-2">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>
    </div>
);