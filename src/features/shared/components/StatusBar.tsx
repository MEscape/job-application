'use client'

import React from "react"
import { Coffee, Wifi, Volume2, Battery } from "lucide-react"

interface StatusBarProps {
    time: string
    size?: "sm" | "md" | "lg"
}

const sizeClasses = {
    sm: {
        container: "h-6 text-xs px-2",
        icon: "w-3 h-3",
    },
    md: {
        container: "h-8 text-sm px-3",
        icon: "w-4 h-4",
    },
    lg: {
        container: "h-10 text-base px-4",
        icon: "w-5 h-5",
    },
}

export function StatusBar({ time, size = "sm" }: StatusBarProps) {
    const s = sizeClasses[size]

    return (
        <div
            className={`absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-md flex items-center justify-between border-b border-white/10 text-white/80 font-medium z-20 ${s.container}`}
        >
            <div className="flex items-center space-x-2">
                <Coffee className={s.icon} />
                <span>System</span>
            </div>
            <div className="flex items-center space-x-2">
                <Wifi className={s.icon} />
                <Volume2 className={s.icon} />
                <Battery className={s.icon} />
                <span>{time}</span>
            </div>
        </div>
    )
}
