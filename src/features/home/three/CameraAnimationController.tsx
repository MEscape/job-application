import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { cameraDurations, cameraPositions } from "@/features/home/config/canvas.config";
import {AnimationPhase} from "@/features/home/stores/sceneStore";

interface CameraAnimationControllerProps {
    phase: AnimationPhase;
    onAnimationComplete: () => void;
}

interface AnimationState {
    startPosition: THREE.Vector3;
    startTarget: THREE.Vector3;
    targetPosition: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    progress: number;
    duration: number;
    startTime: number;
    isAnimating: boolean;
}

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function CameraAnimationController({ phase, onAnimationComplete }: CameraAnimationControllerProps) {
    const { camera } = useThree();
    const router = useRouter();
    const animationRef = useRef<AnimationState>({
        startPosition: new THREE.Vector3(),
        startTarget: new THREE.Vector3(),
        targetPosition: new THREE.Vector3(),
        targetLookAt: new THREE.Vector3(),
        progress: 0,
        duration: 0,
        startTime: 0,
        isAnimating: false,
    });

    const getCurrentTarget = useCallback(function getCurrentTargetFn(): THREE.Vector3 {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        return camera.position.clone().add(direction.multiplyScalar(5));
    }, [camera]);

    const startAnimation = useCallback(function startAnimationFn(targetPhase: AnimationPhase) {
        const animation = animationRef.current;

        animation.startPosition.copy(camera.position);
        animation.startTarget.copy(getCurrentTarget());
        animation.progress = 0;
        animation.startTime = Date.now();
        animation.isAnimating = true;

        switch (targetPhase) {
            case 'moving-to-desk':
                animation.targetPosition.copy(cameraPositions.DESK.position);
                animation.targetLookAt.copy(cameraPositions.DESK.target);
                animation.duration = cameraDurations.DESK_MOVEMENT;
                break;

            case 'zooming-to-monitor':
                animation.targetPosition.copy(cameraPositions.MONITOR_ZOOM.position);
                animation.targetLookAt.copy(cameraPositions.MONITOR_ZOOM.target);
                animation.duration = cameraDurations.MONITOR_ZOOM;
                break;

            case 'returning-home':
                animation.targetPosition.copy(cameraPositions.IDLE.position);
                animation.targetLookAt.copy(cameraPositions.IDLE.target);
                animation.duration = cameraDurations.RETURNING_HOME;
                break;
        }
    }, [camera.position, getCurrentTarget]);

    useEffect(() => {
        if (phase === 'moving-to-desk' || phase === 'zooming-to-monitor' || phase === 'returning-home') {
            startAnimation(phase);
        }
    }, [phase, startAnimation]);

    useFrame(() => {
        const animation = animationRef.current;

        if (!animation.isAnimating) return;

        const elapsed = Date.now() - animation.startTime;
        const rawProgress = Math.min(elapsed / animation.duration, 1);
        const easedProgress = easeInOutCubic(rawProgress);

        const currentPosition = new THREE.Vector3().lerpVectors(
            animation.startPosition,
            animation.targetPosition,
            easedProgress
        );

        const currentTarget = new THREE.Vector3().lerpVectors(
            animation.startTarget,
            animation.targetLookAt,
            easedProgress
        );

        camera.position.copy(currentPosition);
        camera.lookAt(currentTarget);

        if (rawProgress >= 1) {
            animation.isAnimating = false;

            if (phase === 'zooming-to-monitor') {
                router.prefetch('/desktop');

                const sceneElement = document.querySelector('canvas');
                if (sceneElement) {
                    sceneElement.style.transition = 'opacity 300ms ease-out';
                    sceneElement.style.opacity = '0';

                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            router.push('/desktop');
                        }, 300);
                    });
                } else {
                    setTimeout(() => router.push('/desktop'), 100);
                }
            } else {
                onAnimationComplete();
            }
        }
    });

    return null;
}
