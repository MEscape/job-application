import * as THREE from "three";

export const cameraPositions = {
    IDLE: {
        position: new THREE.Vector3(2, 2.5, -4),
        target: new THREE.Vector3(0.865, 2.6, 1.35)
    },
    DESK: {
        position: new THREE.Vector3(1, 2.8, -1),
        target: new THREE.Vector3(0.865, 2.6, 1.35)
    },
    MONITOR_ZOOM: {
        position: new THREE.Vector3(1.1, 2.6, 0.72),
        target: new THREE.Vector3(0.52, 2.6, 1.93)
    }
};

export const cameraDurations = {
    DESK_MOVEMENT: 2000,
    MONITOR_ZOOM: 1500,
    RETURNING_HOME: 2000
};

export const roomBounds = {
    minX: -4.5,
    maxX: 4.5,
    minY: 0.5,
    maxY: 6.5,
    minZ: -4.5,
    maxZ: 4.5
}

export const canvasConfig = {
    camera: {
        position: cameraPositions.IDLE.position,
        fov: 60,
        near: 0.1,
        far: 1000
    },
    shadows: {
        type: THREE.PCFSoftShadowMap,
        enabled: true
    },
    gl: {
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: 'high-performance' as const,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false
    },
    dpr: [1, 2] as [number, number],
    frameloop: 'always' as const
}