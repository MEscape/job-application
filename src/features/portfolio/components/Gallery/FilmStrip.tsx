import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FilmStripImage } from "./FilmStripImage";

interface FilmStripProps {
  images: string[];
  isGalleryMode: boolean;
  selectedImage: number | null;
  onImageClick: (index: number) => void;
}

export const FilmStrip: React.FC<FilmStripProps> = ({
                                               images,
                                               isGalleryMode,
                                               selectedImage,
                                               onImageClick
                                             }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  // Rotation animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      if (!isGalleryMode) {
        groupRef.current.rotation.y += delta * 0.15;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
      } else {
        // Gradually stop rotation in gallery mode
        const targetRotY = 0;
        const targetRotX = 0;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 2);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 2);
      }
    }
  });

  const imagePositions = useMemo<[number, number, number][]>(() => {
    return images.map((_, index) => {
      const angle = (index / images.length) * Math.PI * 2;
      const radius = 3.2;
      return [
        Math.cos(angle) * radius,
        (index - images.length / 2) * 0.25,
        Math.sin(angle) * radius,
      ];
    });
  }, [images]);

  // Create particle positions
  const particlePositions = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, []);

  return (
      <group ref={groupRef}>
        {images.map((imageUrl, index) => (
            <FilmStripImage
                key={index}
                imageUrl={imageUrl}
                originalPosition={imagePositions[index]}
                index={index}
                isSelected={selectedImage === index}
                isGalleryMode={isGalleryMode}
                onImageClick={onImageClick}
                onHover={setHoveredImage}
                isHovered={hoveredImage === index}
            />
        ))}

        {/* Holographic particles - blue theme */}
        <points>
          <bufferGeometry>
            <bufferAttribute
                attach="attributes-position"
                args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
              color="#00ccff"
              size={0.02}
              transparent
              opacity={isGalleryMode ? 0.1 : 0.5}
          />
        </points>
      </group>
  );
};