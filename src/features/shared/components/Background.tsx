import React from 'react';

interface BackgroundProps {
    children: React.ReactNode;
}

export function Background({ children }: BackgroundProps) {
    return (
        <div 
            className="relative min-h-screen overflow-hidden bg-black"
        >

            <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-950 via-purple-900 to-pink-900" />
            <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 animate-pulse" style={{animationDuration: '8s'}} />
            <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-transparent via-black/5 to-black/20" />
            <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
                                     radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%), 
                                     radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.1) 0%, transparent 50%)`
                }}
            />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}} />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s', animationDelay: '2s'}} />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s', animationDelay: '4s'}} />
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30" />

            <div className="relative z-10 min-h-screen backdrop-blur-[1px]">
                {children}
            </div>
        </div>
    );
}