import React from "react";
import { Search, Wifi, Bluetooth, Monitor, Volume2, Shield, Users, Globe, Palette, Moon, Bell, Battery, Keyboard, Mouse, Printer, HardDrive, Zap } from "lucide-react";

export const SettingsApp: React.FC = () => {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-white">
        {/* Personal Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">Personal</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Users & Groups</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Appearance</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Desktop & Screen Saver</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Notifications</span>
            </div>
          </div>
        </div>

        {/* Hardware Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">Hardware</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Displays</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                <Battery className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Energy Saver</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                <Keyboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Keyboard</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mb-2">
                <Mouse className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Mouse</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-2">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Sound</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Printers & Scanners</span>
            </div>
          </div>
        </div>

        {/* Internet & Wireless Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">Internet & Wireless</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Network</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                <Bluetooth className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Bluetooth</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Sharing</span>
            </div>
          </div>
        </div>

        {/* System Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">System</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Security & Privacy</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Startup Disk</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Software Update</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};