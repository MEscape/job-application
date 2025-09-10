import React from "react";
import { Camera, RotateCcw, Zap, Video, Settings, X } from "lucide-react";

export const CameraApp: React.FC = () => (
    <div className="h-full bg-black flex flex-col">

        {/* Camera viewport */}
        <div className="flex-1 relative overflow-hidden">
            {/* Simulated camera feed */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gray-700 bg-opacity-50 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Camera className="w-16 h-16 text-gray-300" />
                    </div>
                    <p className="text-xl font-medium mb-2">Camera Ready</p>
                </div>
            </div>

            {/* Top controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <button className="bg-black bg-opacity-60 text-white rounded-full p-3 backdrop-blur-sm hover:bg-opacity-80 transition-all">
                        <Zap className="w-5 h-5" />
                    </button>
                    <button className="bg-black bg-opacity-60 text-white rounded-full p-3 backdrop-blur-sm hover:bg-opacity-80 transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="bg-black bg-opacity-60 text-white rounded-full px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-medium">Photo</span>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button className="bg-black bg-opacity-60 text-white rounded-full p-3 backdrop-blur-sm hover:bg-opacity-80 transition-all">
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button className="bg-black bg-opacity-60 text-white rounded-full p-3 backdrop-blur-sm hover:bg-opacity-80 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                <div className="flex items-center space-x-12">
                    {/* Recent photo thumbnail */}
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center border-2 border-white border-opacity-30">
                        <span className="text-white text-xs">📸</span>
                    </div>
                    
                    {/* Capture button */}
                    <div className="relative">
                        <button className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 hover:scale-105 transition-transform shadow-lg">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
                            </div>
                        </button>
                    </div>
                    
                    {/* Video mode toggle */}
                    <button className="w-14 h-14 bg-black bg-opacity-60 rounded-xl flex items-center justify-center backdrop-blur-sm border-2 border-white border-opacity-30 hover:bg-opacity-80 transition-all">
                        <Video className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Mode selector */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-6 bg-black bg-opacity-60 rounded-full px-6 py-2 backdrop-blur-sm">
                    <span className="text-gray-400 text-sm">Video</span>
                    <span className="text-white text-sm font-medium">Photo</span>
                    <span className="text-gray-400 text-sm">Portrait</span>
                </div>
            </div>
        </div>
    </div>
);