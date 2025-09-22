import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

interface HolographicMaterialProps {
  texture: THREE.Texture;
  opacity?: number;
  glow?: number;
  isActive?: boolean;
  hologramStrength?: number;
}

export const HolographicMaterial: React.FC<HolographicMaterialProps> = ({
                                                                          texture,
                                                                          opacity = 1,
                                                                          glow = 1,
                                                                          isActive = false,
                                                                          hologramStrength = 1
                                                                        }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uGlow;
    uniform bool uIsActive;
    uniform float uHologramStrength;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vec4 textureColor = texture2D(uTexture, vUv);
      
      // Normalize view direction
      vec3 viewDirection = normalize(vViewPosition);
      
      // Handle both front and back faces correctly
      vec3 normal = normalize(vNormal);
      if (!gl_FrontFacing) {
        normal = -normal;
      }
      
      // Enhanced Fresnel effect for better rim lighting
      float fresnel = 1.0 - abs(dot(normal, viewDirection));
      fresnel = pow(fresnel, 1.5);
      
      // Pure holographic colors - more blue/cyan focused
      vec3 hologramColor1 = vec3(0.0, 0.8, 1.0); // Light blue
      vec3 hologramColor2 = vec3(0.0, 1.0, 0.8); // Cyan
      vec3 hologramColor3 = vec3(0.2, 0.6, 1.0); // Blue-cyan
      
      // Color shifting based on position and time
      float colorShift = sin(vPosition.y * 4.0 + uTime * 2.0) * 0.5 + 0.5;
      vec3 shiftedColor = mix(hologramColor1, hologramColor2, colorShift);
      shiftedColor = mix(shiftedColor, hologramColor3, sin(uTime * 1.2) * 0.5 + 0.5);
      
      // More pronounced scanlines
      float scanline1 = sin(vUv.y * 200.0 + uTime * 4.0) * 0.08 + 0.92;
      float scanline2 = sin(vUv.y * 120.0 - uTime * 3.0) * 0.05 + 0.95;
      float scanlines = scanline1 * scanline2;
      
      // Enhanced interference patterns
      float interference = sin(vUv.x * 80.0 + uTime * 1.5) * sin(vUv.y * 80.0 + uTime * 2.0) * 0.03 + 0.97;
      
      // Edge glow effect
      float edge = 1.0 - smoothstep(0.0, 0.1, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
      vec3 edgeGlow = shiftedColor * edge * 0.5;
      
      // Base texture with blue tint for hologram effect
      vec3 baseColor = textureColor.rgb;
      vec3 hologramTint = baseColor * vec3(0.7, 0.9, 1.2); // Blue tint
      
      // Holographic rim glow
      vec3 rimGlow = shiftedColor * fresnel * uGlow * 1.5;
      
      // Mix base and holographic effects based on hologram strength
      vec3 finalColor = mix(
        baseColor, 
        hologramTint * 0.4 + rimGlow + edgeGlow, 
        uHologramStrength
      );
      
      // Apply scanlines and interference more strongly, but reduce with hologram strength
      float effectStrength = mix(0.2, 1.0, uHologramStrength);
      finalColor *= mix(1.0, scanlines * interference, effectStrength * 0.8);
      
      // Enhanced active state glow
      if (uIsActive) {
        float pulse = sin(uTime * 6.0) * 0.3 + 0.7;
        finalColor += shiftedColor * 0.4 * pulse * uHologramStrength;
      }
      
      // More transparent alpha with stronger rim effect
      float baseAlpha = textureColor.a * uOpacity;
      float hologramAlpha = baseAlpha * (0.4 + fresnel * 0.6);
      float alpha = mix(baseAlpha, hologramAlpha, uHologramStrength);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uTime: { value: 0 },
    uOpacity: { value: opacity },
    uGlow: { value: glow },
    uIsActive: { value: isActive },
    uHologramStrength: { value: hologramStrength }
  }), [texture]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uOpacity.value = opacity;
      materialRef.current.uniforms.uGlow.value = glow;
      materialRef.current.uniforms.uIsActive.value = isActive;
      materialRef.current.uniforms.uHologramStrength.value = hologramStrength;
    }
  });

  return (
      <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          side={THREE.DoubleSide}
      />
  );
};