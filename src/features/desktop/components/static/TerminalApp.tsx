import React from "react";

export const TerminalApp = () => {
    return (
        <div className="h-full bg-gray-900 text-green-400 font-mono overflow-hidden">
            <div className="h-full p-4 flex flex-col">
                <div className="mb-3 text-gray-300 text-sm">Last login: {new Date().toLocaleString()}</div>
                <div className="mb-4 flex items-center">
                    <span className="text-blue-400">user@desktop</span>
                    <span className="text-white mx-1">:</span>
                    <span className="text-purple-400">~</span>
                    <span className="text-white ml-1">$</span>
                    <span className="ml-2 bg-green-400 w-2 h-5 animate-pulse"></span>
                </div>
                <div className="text-gray-300 mb-2">Welcome to Terminal</div>
                <div className="text-green-400 mb-4">Type commands here...</div>
                <div className="text-gray-400 text-sm leading-relaxed">
                    <div className="mb-1">Available commands:</div>
                    <div className="ml-2">
                        <div>• <span className="text-yellow-400">ls</span> - list files</div>
                        <div>• <span className="text-yellow-400">pwd</span> - print working directory</div>
                        <div>• <span className="text-yellow-400">clear</span> - clear screen</div>
                        <div>• <span className="text-yellow-400">help</span> - show this help</div>
                    </div>
                </div>
                <div className="flex-1"></div>
                <div className="text-gray-500 text-xs">
                    Terminal v1.0 - macOS Style
                </div>
            </div>
        </div>
    );
}