import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HolographicMaterial } from "./HolographicMaterial";

interface FilmStripImageProps {
  imageUrl: string;
  originalPosition: [number, number, number];
  index: number;
  isSelected: boolean;
  isGalleryMode: boolean;
  onImageClick: (index: number) => void;
  onHover: (index: number | null) => void;
  isHovered: boolean;
}

export const FilmStripImage: React.FC<FilmStripImageProps> = ({
                                                         imageUrl,
                                                         originalPosition,
                                                         index,
                                                         isSelected,
                                                         isGalleryMode,
                                                         onImageClick,
                                                         onHover,
                                                         isHovered
                                                       }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1); // Default to square

  // Animation targets
  const stripPosition = originalPosition;
  const stripRotation: [number, number, number] = [0, 0, 0];

  const galleryPosition: [number, number, number] = [0, 0, 3];
  const galleryScale: [number, number, number] = [2.8, 2.8, 1];
  const galleryRotation: [number, number, number] = [0, 0, 0];

  // Load texture and calculate aspect ratio
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
        imageUrl,
        (loadedTexture) => {
          loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
          loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          
          // Calculate aspect ratio from the loaded image
          const image = loadedTexture.image;
          if (image && image.width && image.height) {
            const ratio = image.width / image.height;
            setAspectRatio(ratio);
          }
          
          setTexture(loadedTexture);
        },
        undefined,
        () => {
          // Better fallback texture - blue holographic style
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 512;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Create blue holographic gradient
            const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
            gradient.addColorStop(0, "#00ccff");
            gradient.addColorStop(0.3, "#0080ff");
            gradient.addColorStop(0.7, "#0040cc");
            gradient.addColorStop(1, "#002080");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);

            // Add holographic pattern
            ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            for (let i = 0; i < 10; i++) {
              ctx.beginPath();
              ctx.moveTo(0, i * 51.2);
              ctx.lineTo(512, i * 51.2);
              ctx.stroke();
            }

            // Add some noise pattern
            const imageData = ctx.getImageData(0, 0, 512, 512);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const noise = Math.random() * 0.1;
              data[i] *= (1 + noise);     // R
              data[i + 1] *= (1 + noise); // G
              data[i + 2] *= (1 + noise); // B
            }
            ctx.putImageData(imageData, 0, 0);
          }
          const fallbackTexture = new THREE.CanvasTexture(canvas);
          setTexture(fallbackTexture);
          setAspectRatio(1); // Fallback is square
        }
    );
  }, [imageUrl]);

  // Calculate geometry dimensions based on aspect ratio
  const getGeometryDimensions = (): [number, number] => {
    const maxWidth = 1.5;
    const maxHeight = 1.5;
    
    if (aspectRatio > 1) {
      // Landscape: width is constrained
      return [maxWidth, maxWidth / aspectRatio];
    } else {
      // Portrait or square: height is constrained
      return [maxHeight * aspectRatio, maxHeight];
    }
  };

  // Animation frame
  useFrame((state, delta) => {
    if (!meshRef.current || !texture) return;

    const mesh = meshRef.current;

    if (isSelected && isGalleryMode) {
      // Animate to gallery position
      const lerpSpeed = 4.0 * delta;

      // Position
      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, galleryPosition[0], lerpSpeed);
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, galleryPosition[1], lerpSpeed);
      mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, galleryPosition[2], lerpSpeed);

      // Scale
      mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, galleryScale[0], lerpSpeed);
      mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, galleryScale[1], lerpSpeed);
      mesh.scale.z = THREE.MathUtils.lerp(mesh.scale.z, galleryScale[2], lerpSpeed);

      // Rotation
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, galleryRotation[0], lerpSpeed);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, galleryRotation[1], lerpSpeed);
      mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, galleryRotation[2], lerpSpeed);

    } else {
      // Animate back to strip position
      const lerpSpeed = 3.0 * delta;

      // Base position with floating animation
      const floatOffset = Math.sin(state.clock.elapsedTime + index) * 0.1;
      const targetY = stripPosition[1] + floatOffset;

      // Position
      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, stripPosition[0], lerpSpeed);
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, lerpSpeed);
      mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, stripPosition[2], lerpSpeed);

      // Scale with hover effect
      const hoverScale = isHovered ? 1.15 : 1.0;
      mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, hoverScale, delta * 8);
      mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, hoverScale, delta * 8);
      mesh.scale.z = THREE.MathUtils.lerp(mesh.scale.z, 1.0, delta * 8);

      // Rotation
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, stripRotation[0], lerpSpeed);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, stripRotation[1], lerpSpeed);
      mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, stripRotation[2], lerpSpeed);
    }
  });

  if (!texture) return null;

  // Calculate hologram strength based on gallery mode and selection
  const hologramStrength = (isGalleryMode && isSelected) ? 0.15 : 1.0;
  
  // Get the proper dimensions for this image's aspect ratio
  const [planeWidth, planeHeight] = getGeometryDimensions();

  return (
      <mesh
          ref={meshRef}
          position={originalPosition}
          onClick={() => onImageClick(index)}
          onPointerEnter={() => onHover(index)}
          onPointerLeave={() => onHover(null)}
      >
        <planeGeometry args={[planeWidth, planeHeight, 32, 32]} />
        <HolographicMaterial
            texture={texture}
            glow={isHovered ? 2.5 : 1.5}
            opacity={0.85}
            isActive={isSelected}
            hologramStrength={hologramStrength}
        />
      </mesh>
  );
};