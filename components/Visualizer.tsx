import React, { useRef, useMemo, MutableRefObject } from 'react';
// FIX: Removed `ThreeElements` from the import to resolve a module augmentation error.
import { Canvas, extend, useFrame, type MaterialProps } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { EffectComposer, Noise, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { WebGLRenderer } from 'three';
import { Vector2 } from 'three';
import type { VisualizerSettings } from '../types';

// GLSL Noise function by Stefan Gustavson
const glslNoise = `
  // 3D Classic Perlin noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }
`;

const WobblyMaterial = shaderMaterial(
  {
    uTime: 0,
    uDistortion: 0.4,
    uColorA: new THREE.Color('#ff0070'),
    uColorB: new THREE.Color('#007bff'),
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uDistortion;
    varying float vNoise;
    varying vec2 vUv;
    ${glslNoise}
    void main() {
      vUv = uv;
      float noise = snoise(position + uTime) * uDistortion;
      vec3 newPosition = position + normal * noise;
      vNoise = noise;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    varying float vNoise;
    ${glslNoise}
    void main() {
      float colorNoise = (snoise(vec3(vUv * 5.0, vNoise)) + 1.0) / 2.0;
      vec3 finalColor = mix(uColorA, uColorB, colorNoise);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ WobblyMaterial });

// Define a type for our material instance to get stronger type-safety
type WobblyMaterialImpl = THREE.ShaderMaterial & {
  uTime: number;
  uDistortion: number;
  uColorA: THREE.Color;
  uColorB: THREE.Color;
};

// FIX: Reverted to `declare global` to resolve a module augmentation error.
// The `declare module '@react-three/fiber'` approach, while modern, was causing
// an "Invalid module name" error, likely due to project configuration.
// Augmenting the global JSX namespace provides a compatible fallback.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      wobblyMaterial: MaterialProps & {
        uTime?: number;
        uDistortion?: number;
        uColorA?: THREE.Color | string | number;
        uColorB?: THREE.Color | string | number;
      };
    }
  }
}

const SceneContent: React.FC<{ settings: VisualizerSettings }> = ({ settings }) => {
  const materialRef = useRef<WobblyMaterialImpl>(null!);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime() * settings.motion;
      materialRef.current.uDistortion = settings.distortion;
    }
  });

  const colorA = useMemo(() => new THREE.Color(settings.colorA), [settings.colorA]);
  const colorB = useMemo(() => new THREE.Color(settings.colorB), [settings.colorB]);

  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 128, 128]} />
        <wobblyMaterial ref={materialRef} uColorA={colorA} uColorB={colorB} />
      </mesh>
      <EffectComposer>
        <Noise opacity={settings.grain} />
        <ChromaticAberration offset={new Vector2(settings.chromaticAberration, settings.chromaticAberration)} />
      </EffectComposer>
    </>
  );
};


interface VisualizerProps {
  settings: VisualizerSettings;
  setRendererRef: MutableRefObject<WebGLRenderer | null>;
}

const Visualizer: React.FC<VisualizerProps> = ({ settings, setRendererRef }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 50 }}
      gl={{ preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        setRendererRef.current = gl;
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <SceneContent settings={settings} />
    </Canvas>
  );
};

export default Visualizer;
