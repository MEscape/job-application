import React, { useState } from 'react';
import { Text } from "@react-three/drei";

interface GalleryNavigationProps {
    currentIndex: number;
    totalImages: number;
    onNavigate: (index: number) => void;
}

export const GalleryNavigation: React.FC<GalleryNavigationProps> = ({
                                                                        currentIndex,
                                                                        totalImages,
                                                                        onNavigate,
                                                                    }) => {
    const [hoveredButton, setHoveredButton] = useState<"prev" | "next" | "close" | null>(null);

    return (
        <group>
            {/* Previous button */}
            {currentIndex > 0 && (
                <mesh
                    position={[-4, 0, 2]}
                    onClick={() => onNavigate(currentIndex - 1)}
                    onPointerEnter={() => setHoveredButton('prev')}
                    onPointerLeave={() => setHoveredButton(null)}
                >
                    <planeGeometry args={[0.8, 0.8]} />
                    <meshStandardMaterial
                        color={hoveredButton === 'prev' ? "#666666" : "#006666"} // darker grey on hover
                        transparent
                        opacity={0.8}
                        emissive={hoveredButton === 'prev' ? "#333333" : "#000000"} // subtle darker emissive
                    />
                    <Text
                        position={[0, 0, 0.01]}
                        fontSize={0.4}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        ←
                    </Text>
                </mesh>
            )}

            {/* Next button */}
            {currentIndex < totalImages - 1 && (
                <mesh
                    position={[4, 0, 2]}
                    onClick={() => onNavigate(currentIndex + 1)}
                    onPointerEnter={() => setHoveredButton('next')}
                    onPointerLeave={() => setHoveredButton(null)}
                >
                    <planeGeometry args={[0.8, 0.8]} />
                    <meshStandardMaterial
                        color={hoveredButton === 'next' ? "#666666" : "#006666"} // darker grey on hover
                        transparent
                        opacity={0.8}
                        emissive={hoveredButton === 'next' ? "#333333" : "#000000"} // subtle darker emissive
                    />
                    <Text
                        position={[0, 0, 0.01]}
                        fontSize={0.4}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        →
                    </Text>
                </mesh>
            )}
        </group>
    );
};
