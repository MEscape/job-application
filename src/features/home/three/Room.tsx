import React from "react";
import {Plane, useTexture} from "@react-three/drei";

export function Room() {
    const floorTextures = useTexture({
        map: '/textures/wood/WoodFloor048_1K-JPG_Color.jpg',
        normalMap: '/textures/wood/WoodFloor048_1K-JPG_NormalGL.jpg',
        roughnessMap: '/textures/wood/WoodFloor048_1K-JPG_Roughness.jpg',
    });

    const wallTextures = useTexture({
        map: '/textures/wall/Metal027_1K-JPG_Color.jpg',
        normalMap: '/textures/wall/Metal027_1K-JPG_NormalGL.jpg',
        roughnessMap: '/textures/wall/Metal027_1K-JPG_Roughness.jpg',
    });

    return (
        <>
            <Plane args={[10, 10]} rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
                <meshStandardMaterial {...floorTextures} />
            </Plane>

            <Plane args={[10, 10]} rotation-x={Math.PI / 2} position={[0, 7, 0]} receiveShadow>
                <meshStandardMaterial {...wallTextures} />
            </Plane>

            <Plane args={[10, 7]} position={[0, 3.5, -5]} receiveShadow>
                <meshStandardMaterial {...wallTextures} />
            </Plane>
            <Plane args={[10, 7]} rotation-y={Math.PI} position={[0, 3.5, 5]} receiveShadow>
                <meshStandardMaterial {...wallTextures} />
            </Plane>
            <Plane args={[10, 7]} rotation-y={Math.PI / 2} position={[-5, 3.5, 0]} receiveShadow>
                <meshStandardMaterial {...wallTextures} />
            </Plane>
            <Plane args={[10, 7]} rotation-y={-Math.PI / 2} position={[5, 3.5, 0]} receiveShadow>
                <meshStandardMaterial {...wallTextures} />
            </Plane>
        </>
    );
}