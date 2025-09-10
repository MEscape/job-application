import React from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Plus, Share, Bookmark, Shield } from "lucide-react";

export const BrowserApp: React.FC = () => (
    <div className="h-full bg-white flex flex-col">
        {/* Safari-style toolbar */}
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center px-4 py-2">
                <div className="flex items-center space-x-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex-1 mx-4">
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm">
                        <Shield className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-gray-700">https://www.apple.com</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                        <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                        <Share className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {/* Tab bar */}
            <div className="flex items-center px-4 pb-2">
                <div className="flex space-x-1">
                    <div className="bg-white border border-gray-200 border-b-0 px-4 py-2 rounded-t-lg text-sm font-medium text-gray-900 shadow-sm">
                        🍎 Apple
                    </div>
                    <div className="bg-gray-100 border border-gray-200 border-b-0 px-4 py-2 rounded-t-lg text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
                        📰 News
                    </div>
                    <button className="bg-gray-100 border border-gray-200 border-b-0 px-3 py-2 rounded-t-lg text-gray-600 hover:bg-gray-200">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
            <div className="bg-black text-white text-center py-16">
                <div className="mb-8">
                    <div className="text-6xl mb-4">🍎</div>
                    <h1 className="text-4xl font-light mb-2">iPhone 15 Pro</h1>
                    <p className="text-xl text-gray-300">Titanium. So strong. So light. So Pro.</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700">
                    Learn more
                </button>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-3xl">📱</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">iPhone</h3>
                        <p className="text-gray-600 text-sm">The most advanced iPhone ever.</p>
                    </div>

                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-3xl">💻</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Mac</h3>
                        <p className="text-gray-600 text-sm">Supercharged by M3 chip.</p>
                    </div>

                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-3xl">⌚</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Apple Watch</h3>
                        <p className="text-gray-600 text-sm">Your essential companion.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);