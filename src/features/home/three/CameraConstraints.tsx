import { useFrame, useThree } from '@react-three/fiber';
import {roomBounds} from "@/features/home/config/canvas.config";

interface CameraConstraintsProps {
    enabled: boolean;
}

export function CameraConstraints({ enabled }: CameraConstraintsProps) {
    const { camera } = useThree();

    useFrame(() => {
        if (!enabled) return;

        const pos = camera.position;
        pos.x = Math.max(roomBounds.minX, Math.min(roomBounds.maxX, pos.x));
        pos.y = Math.max(roomBounds.minY, Math.min(roomBounds.maxY, pos.y));
        pos.z = Math.max(roomBounds.minZ, Math.min(roomBounds.maxZ, pos.z));
    });

    return null;
}
