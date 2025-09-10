'use client'

import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { useScene } from '@/features/home/stores/hooks';
import IframeManager from './IframeManager';
import {FBXLoader} from "three-stdlib";
import {Html} from "@react-three/drei";
import type {IframeViewType} from "@/features/shared/hooks";

function MonitorOverlay() {
    const { animationPhase } = useScene();

    const monitorContent = useMemo(() => {
        const isLocked = animationPhase !== 'at-desk';
        const isZooming = animationPhase === 'zooming-to-monitor';

        if (isZooming) {
            return {
                view: 'loading' as IframeViewType,
                interactive: false,
            };
        }

        if (isLocked) {
            return {
                view: 'lock' as IframeViewType,
                interactive: false,
            };
        }

        return {
            view: 'login' as IframeViewType,
            interactive: true,
            showLoadingScreen: false
        };
    }, [animationPhase]);

    const monitorStyle = {
        width: '800px',
        height: '480px',
        borderRadius: '6px',
        border: '1px solid rgba(0, 0, 0, 0.43)',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden' as const,
        position: 'relative' as const,
        cursor: status === "authenticated"
        && animationPhase === 'at-desk' ? 'pointer' : 'default',
        transformOrigin: 'center center',
        WebkitFontSmoothing: 'antialiased' as const,
        imageRendering: 'auto' as const,
    }

    const iframeStyle = {
        width: '100%',
        height: '100%',
        border: 'none',
        pointerEvents: monitorContent.interactive ? 'auto' as const : 'none' as const,
        imageRendering: 'auto' as const,
        WebkitBackfaceVisibility: 'hidden' as const,
        backfaceVisibility: 'hidden' as const,
        willChange: 'transform',
        WebkitTransform: 'translateZ(0)' as const,
        transform: 'translateZ(0)',
    }

    return (
        <Html
            position={[0.87, 2.6, 1.36]}
            rotation={[0, Math.PI - 0.525, 0]}
            distanceFactor={0.8}
            transform
            center
            occlude="blending"
            style={{
                pointerEvents: 'auto',
                imageRendering: 'auto',
                userSelect: 'none',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                willChange: 'transform',
            }}
        >
            <div style={monitorStyle}>
                <IframeManager
                    view={monitorContent.view}
                    interactive={monitorContent.interactive}
                    style={iframeStyle}
                />
            </div>
        </Html>
    )
}

export function OfficeSet() {
    const fbx = useLoader(FBXLoader, '/models/office.fbx');

    const modelProps = {
        object: fbx,
        position: [2.5, 0, -2] as [number, number, number],
        scale: [0.005, 0.005, 0.005] as [number, number, number],
        rotation: [0, Math.PI / 3, 0] as [number, number, number]
    }

    return (
        <group>
            <primitive {...modelProps} />
            <MonitorOverlay />
        </group>
    )
}