import React from "react";

export function SceneLighting() {
    return (
        <>
            <ambientLight intensity={0.3} color="#f5f5f5" />

            <directionalLight
                position={[-8, 10, -6]}
                intensity={2.5}
                color="#fff8e1"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={30}
                shadow-camera-left={-12}
                shadow-camera-right={12}
                shadow-camera-top={12}
                shadow-camera-bottom={-12}
                shadow-bias={-0.0005}
            />

            <spotLight
                position={[3.5, 5, -2]}
                angle={Math.PI / 6}
                penumbra={0.3}
                intensity={1.5}
                color="#fff5e6"
                castShadow
                target-position={[2.5, 3.5, -1]}
            />

            <pointLight
                position={[2.8, 4, -1.2]} // Light near monitor
                intensity={0.8}
                color="#e0f7ff"
                distance={4}
                decay={2}
            />
        </>
    );
};