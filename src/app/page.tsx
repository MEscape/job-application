"use client"

import Scene3D from "@/components/three/Scene3D";

export default function ExperiencePage() {

    return (
        <div className="w-full h-screen overflow-hidden relative">
            {/* 3D Scene */}
            <div className="relative w-full h-screen bg-white">
                <Scene3D />
            </div>
        </div>
    )
}