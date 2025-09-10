import {OrbitControls as ThreeOrbitControls} from "@react-three/drei/core/OrbitControls";
import * as THREE from "three";
import { cameraPositions } from '@/features/home/config/canvas.config'

interface OrbitControlsProps {
    enabled: boolean
}

export function OrbitControls({ enabled }: OrbitControlsProps) {
    return (
        <ThreeOrbitControls
            enabled={enabled}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            // Vertical angle constraints (prevent looking through floor/ceiling)
            maxPolarAngle={Math.PI * 0.85} // Almost horizontal, but not through floor
            minPolarAngle={Math.PI * 0.15} // Almost horizontal, but not through ceiling
            // Distance constraints (keep camera inside room bounds)
            maxDistance={6} // Reduced to prevent hitting walls
            minDistance={1.5} // Minimum comfortable distance
            // Target constraints (keep look-at target within room bounds)
            target={cameraPositions.IDLE.target} // Look at center of room at reasonable height
            // Camera position constraints
            enableDamping={true}
            dampingFactor={0.08} // Slightly more damping for smoother movement
            // Prevent camera from going outside room bounds
            maxAzimuthAngle={Math.PI} // Limit horizontal rotation if needed
            minAzimuthAngle={-Math.PI}
            // Additional constraints
            screenSpacePanning={false} // Prevent weird panning behavior
            mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            }}
        />
    );
}
