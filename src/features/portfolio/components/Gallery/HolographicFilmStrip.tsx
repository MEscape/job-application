import React, { useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {GalleryNavigation} from "@/features/portfolio/components/Gallery/GalleryNavigation";
import {FilmStrip} from "@/features/portfolio/components/Gallery/FilmStrip";
import {GalleryOverlay} from "@/features/portfolio/components/Gallery/GalleryOverlay";

interface HolographicFilmStripProps {
  images?: string[];
  onImageClick?: (index: number) => void;
  projectTitle?: string;
  onBackClick?: () => void;
}

export const HolographicFilmStrip: React.FC<HolographicFilmStripProps> = ({
                                                                            images = [],
                                                                            onImageClick,
                                                                            projectTitle = "Gallery",
                                                                            onBackClick
                                                                   }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isGalleryMode, setIsGalleryMode] = useState<boolean>(false);

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setIsGalleryMode(true);
    onImageClick?.(index);
  };

  const handleNavigate = (index: number) => {
    if (index === -1) {
      setIsGalleryMode(false);
      setSelectedImage(null);
    } else {
      setSelectedImage(index);
      onImageClick?.(index);
    }
  };

  // Generate sample images if none provided
  const sampleImages = useMemo(() => {
    if (images && images.length > 0) return images;

    return Array.from({ length: 6 }, () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Create blue-based holographic sample textures
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, "#00aaff");
        gradient.addColorStop(0.4, "#0066cc");
        gradient.addColorStop(0.8, "#003399");
        gradient.addColorStop(1, "#001166");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Add holographic pattern
        ctx.strokeStyle = "rgba(0, 204, 255, 0.4)";
        ctx.lineWidth = 1;
        for (let j = 0; j < 15; j++) {
          ctx.beginPath();
          ctx.moveTo(0, j * 34);
          ctx.lineTo(512, j * 34);
          ctx.stroke();
        }

        // Add some geometric shapes
        ctx.fillStyle = `rgba(0, 255, 255, 0.2)`;
        for (let k = 0; k < 8; k++) {
          ctx.beginPath();
          ctx.arc(
              Math.random() * 512,
              Math.random() * 512,
              Math.random() * 30 + 10,
              0,
              Math.PI * 2
          );
          ctx.fill();
        }
      }
      return canvas.toDataURL();
    });
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isGalleryMode || selectedImage === null) return;

      switch (event.key) {
        case 'ArrowLeft':
          if (selectedImage > 0) handleNavigate(selectedImage - 1);
          break;
        case 'ArrowRight':
          if (selectedImage < sampleImages.length - 1) handleNavigate(selectedImage + 1);
          break;
        case 'Escape':
          handleNavigate(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGalleryMode, selectedImage, sampleImages.length]);

  return (
      <div className="w-full h-screen bg-transparent relative">
        <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            style={{ background: "transparent" }}
            gl={{ alpha: true, antialias: true }}
        >
          {/* Enhanced Lighting for holographic effect */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.2} color="#00ccff" />
          <pointLight position={[-10, -10, 10]} intensity={0.8} color="#0080ff" />
          <pointLight position={[0, 0, -10]} intensity={0.6} color="#ffffff" />

          {/* Film Strip */}
          <FilmStrip
              images={sampleImages}
              isGalleryMode={isGalleryMode}
              selectedImage={selectedImage}
              onImageClick={handleImageClick}
          />

          {/* Gallery Navigation */}
          {isGalleryMode && selectedImage !== null && (
              <GalleryNavigation
                  currentIndex={selectedImage}
                  totalImages={sampleImages.length}
                  onNavigate={handleNavigate}
              />
          )}
        </Canvas>

        <GalleryOverlay
            isGalleryMode={isGalleryMode}
            onBackClick={onBackClick}
            projectTitle={projectTitle}
            selectedImage={selectedImage}
            sampleImages={sampleImages}
        />
      </div>
  );
};
