'use client'

import {Canvas} from "@react-three/fiber";
import React, {useCallback, useEffect} from "react";
import {canvasConfig} from "../config/canvas.config";
import { SceneLighting } from "./SceneLighting";
import {Room} from "./Room";
import {OrbitControls} from "./OrbitControls";
import {CameraConstraints} from "./CameraConstraints";
import {CameraAnimationController} from "./CameraAnimationController";
import {OfficeSet} from "./OfficeSet";
import {useSession} from "next-auth/react";
import {useScene} from "@/features/home/stores/hooks";

function Scene3D() {
    const { 
        animationPhase, 
        isControlsEnabled, 
        canMoveToDesk, 
        canReturnHome, 
        startAnimation, 
        completeAnimation 
    } = useScene();
    const { status } = useSession({ required: false });

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (['Tab', 'Escape'].includes(e.key)) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'Tab':
                if (canMoveToDesk) {
                    startAnimation('moving-to-desk');
                }
                break;
            case 'Escape':
                if (canReturnHome) {
                    startAnimation('returning-home');
                }
                break;
        }
    }, [startAnimation, canMoveToDesk, canReturnHome]);

    useEffect(() => {
        const controller = new AbortController();

        window.addEventListener('keydown', handleKeyDown, {
            signal: controller.signal
        });

        return () => controller.abort();
    }, [handleKeyDown]);
    
    useEffect(() => {
        if (status === "authenticated" && animationPhase === 'at-desk') {
            const timer = setTimeout(() => {
                startAnimation('zooming-to-monitor');
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [status, animationPhase, startAnimation]);


    return (
        <Canvas {...canvasConfig}>
            <SceneLighting />
            <Room />
            <OfficeSet />

            <CameraAnimationController
                phase={animationPhase}
                onAnimationComplete={completeAnimation}
            />

            <CameraConstraints enabled={isControlsEnabled} />
            <OrbitControls enabled={isControlsEnabled} />
        </Canvas>
    )
}

export default Scene3D;