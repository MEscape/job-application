"use client"

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Plus, Share, Bookmark, Shield, X } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface BrowserProps {
  initialUrl?: string;
  className?: string;
}

export const Browser: React.FC<BrowserProps> = ({ 
  initialUrl = "/portfolio", 
  className = "" 
}) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "1",
      title: "Portfolio",
      url: initialUrl,
      favicon: "🎨"
    }
  ]);
  
  const [activeTabId, setActiveTabId] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const handleNavigation = useCallback((direction: 'back' | 'forward' | 'refresh') => {
    if (direction === 'refresh') {
      setIsLoading(true);
      // Force iframe reload by changing key
      setIframeKey(prev => prev + 1);
    }
    // For now, just refresh functionality
  }, []);

  const addNewTab = useCallback(() => {
    const newTabId = Date.now().toString();
    const newTab: Tab = {
      id: newTabId,
      title: "Portfolio",
      url: "/portfolio",
      favicon: "🎨"
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
        // URL is always /portfolio - no need to change currentUrl
      }
      return newTabs;
    });
  }, [tabs.length, activeTabId]);

  return (
    <div className={`h-full bg-white flex flex-col ${className}`}>
      {/* Safari-style toolbar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center space-x-1">
            <button 
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
              onClick={() => handleNavigation('back')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
              onClick={() => handleNavigation('forward')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
              onClick={() => handleNavigation('refresh')}
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm">
              <Shield className="w-4 h-4 text-green-500 mr-2" />
              <input
                type="text"
                value="/portfolio"
                readOnly
                className="flex-1 outline-none text-gray-700 bg-transparent cursor-default"
                placeholder="/portfolio"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Tab bar */}
        <div className="flex items-center px-4 pb-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`group flex items-center border border-gray-200 border-b-0 px-4 py-2 rounded-t-lg text-sm cursor-pointer transition-colors ${
                  tab.id === activeTabId
                    ? 'bg-white font-medium text-gray-900 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setActiveTabId(tab.id);
                  // URL is always /portfolio - no need to change currentUrl
                }}
              >
                <span className="mr-2">{tab.favicon}</span>
                <span className="max-w-32 truncate">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    className="ml-2 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-300 rounded transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button 
              className="bg-gray-100 border border-gray-200 border-b-0 px-3 py-2 rounded-t-lg text-gray-600 hover:bg-gray-200 transition-colors"
              onClick={addNewTab}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content area with iframe */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-spin border-t-gray-600"></div>
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          src="/portfolio"
          className="w-full h-full border-0"
          title="Portfolio"
          onLoad={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
        />
      </div>
    </div>
  );
};