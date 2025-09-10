"use client"

import Scene3D from "@/features/home/three/Scene3D";
import {InstructionsOverlay, ThreeJSLoadingOverlay} from "@/features/home/components";

export default function Page() {
    return (
        <div className="w-full h-screen bg-black">
            <div className="absolute inset-0 z-10">
                <Scene3D />
            </div>
            <ThreeJSLoadingOverlay minDisplayTime={2500} waitForIframe={true} />
            <InstructionsOverlay />
        </div>
    )
}