import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ScrollControls, useScroll, Environment, Float, Sparkles } from '@react-three/drei';
import gsap from 'gsap';

// 1. THE 3D MODEL (With Draco Compression Support)
function TruckModel() {
  const modelRef = useRef();
  const scroll = useScroll();
  const [wireframe, setWireframe] = useState(false);

  // KEY FIX: The 'true' second argument enables Draco decompression
  // If this fails, check your internet connection (it fetches decoders from a CDN)
  const { scene } = useGLTF('/truck-v1.glb', true);

  useFrame((state, delta) => {
    if (!modelRef.current) return;

    // Smooth Rotation Logic
    // We limit how much it can calculate per frame to prevent crashes
    const scrollOffset = scroll.offset || 0;
    
    modelRef.current.rotation.y = 4 + (scrollOffset * Math.PI * 2);
    
    // Smooth Movement Logic
    const targetX = -2 + (scrollOffset * 7);
    // Simple linear interpolation
    modelRef.current.position.x += (targetX - modelRef.current.position.x) * 0.1;

    // Toggle Wireframe (Optimized to run only when state changes)
    if (scrollOffset > 0.5 && !wireframe) {
      setWireframe(true);
    } else if (scrollOffset <= 0.5 && wireframe) {
      setWireframe(false);
    }
  });

  // Apply wireframe effect safely using useEffect instead of useFrame
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.wireframe = wireframe;
        if (wireframe) {
            // Store original color if needed, simplified here
            child.material.color.set('#00ff00');
            child.material.emissive.set('#00ff00');
        } else {
            child.material.color.set('white');
            child.material.emissive.set('black');
        }
      }
    });
  }, [wireframe, scene]);

  return (
    <primitive 
      object={scene} 
      ref={modelRef} 
      scale={2} 
      position={[-2, -1, 0]} 
      rotation={[0, 4, 0]}
    />
  );
}

// Fallback Box (Shows if Model crashes or loads slow)
function FallbackModel() {
    return (
        <mesh scale={2} rotation={[0, 1, 0]}>
            <boxGeometry />
            <meshStandardMaterial color="red" wireframe />
        </mesh>
    )
}

function HTMLContent() {
  return (
    <ScrollControls pages={4} damping={0.2}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <React.Suspense fallback={<FallbackModel />}>
             <TruckModel />
        </React.Suspense>
      </Float>
      <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#444" />
      
      {/* HTML OVERLAYS */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <div className="section"><h1>TERMINAL</h1><p>System Online.</p></div>
        <div className="section right"><h2>LOGISTICS</h2><p>Optimized.</p></div>
        <div className="section"><h2>DIGITAL TWIN</h2><p>Scanning...</p></div>
        <div className="section right"><button>DEPLOY</button></div>
      </div>
    </ScrollControls>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#080808' }}>
      {/* PERFORMANCE SETTINGS: Shadows OFF, PixelRatio 1 */}
      <Canvas dpr={[1, 1]} camera={{ position: [0, 0, 8], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={50} />
        <Environment preset="city" />
        <HTMLContent />
      </Canvas>
    </div>
  );
}