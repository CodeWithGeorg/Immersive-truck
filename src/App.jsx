import React, { useRef, useLayoutEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ScrollControls, useScroll, Environment, Float, Sparkles } from '@react-three/drei';
import gsap from 'gsap';

// 1. THE 3D MODEL COMPONENT
// This handles loading the truck and animating it based on scroll
function TruckModel() {
  const modelRef = useRef();
  const scroll = useScroll();
  const [wireframe, setWireframe] = useState(false);

  // Try to load the truck. If file not found, this might error, so we handle that below.
  // Make sure 'truck.glb' is in your /public folder!
  const { scene, materials } = useGLTF('/truck.glb'); 

  // This runs on every frame (60 times a second)
  useFrame((state, delta) => {
    if (!modelRef.current) return;
    
    // Get the scroll offset (0 at top, 1 at bottom)
    const r1 = scroll.range(0 / 4, 1 / 4); // First section
    const r2 = scroll.range(1 / 4, 1 / 4); // Second section
    const r3 = scroll.visible(3 / 4, 1 / 4); // Last section

    // ANIMATION LOGIC
    // Rotate the truck as you scroll down
    modelRef.current.rotation.y = 4 + scroll.offset * (Math.PI * 2);

    // Move the truck from left to right
    // Interpolating position based on scroll
    const targetX = -2 + (scroll.offset * 7); 
    modelRef.current.position.x = gsap.utils.interpolate(modelRef.current.position.x, targetX, 0.1);

    // Toggle Wireframe Mode at the specific scroll point (like in the video)
    if (scroll.offset > 0.5 && !wireframe) {
      setWireframe(true);
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.wireframe = true;
          child.material.color.set('#00ff00'); // Sci-fi green
        }
      });
    } else if (scroll.offset <= 0.5 && wireframe) {
      setWireframe(false);
      scene.traverse((child) => {
        if (child.isMesh) child.material.wireframe = false;
        // You would need to restore original materials here in a real app
      });
    }
  });

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

// Fallback if no model is found (Just a box)
function FallbackModel() {
    const mesh = useRef();
    const scroll = useScroll();
    
    useFrame(() => {
        mesh.current.rotation.x = scroll.offset * Math.PI;
        mesh.current.rotation.y = scroll.offset * Math.PI * 2;
    })
    return (
        <mesh ref={mesh} scale={2}>
            <boxGeometry />
            <meshStandardMaterial color="orange" wireframe />
        </mesh>
    )
}

// 2. THE LIGHTING & ENVIRONMENT
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={100} />
      <pointLight position={[-10, -10, -10]} intensity={50} />
      {/* City environment reflection */}
      <Environment preset="city" /> 
    </>
  );
}

// 3. THE HTML CONTENT (OVERLAY)
function HTMLContent() {
  return (
    <ScrollControls pages={4} damping={0.2}>
      {/* The 3D Scene within the ScrollControls */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <React.Suspense fallback={<FallbackModel />}>
             <TruckModel />
        </React.Suspense>
      </Float>
      
      {/* Background Particles */}
      <Sparkles count={100} scale={10} size={4} speed={0.4} opacity={0.5} color="#444" />

      {/* The Text Layers */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
        
        {/* Section 1 */}
        <div className="section">
          <h1>TERMINAL<br /><span style={{color: '#555'}}>LOGISTICS</span></h1>
          <p>Don't overdo it. Keep it simple.</p>
        </div>

        {/* Section 2 */}
        <div className="section right">
          <h2>INTELLIGENT<br />INFRASTRUCTURE</h2>
          <p>Connecting the yard to the highway.</p>
        </div>

        {/* Section 3 */}
        <div className="section">
          <h2>THE MATRIX<br />VIEW</h2>
          <p>Switching to digital twin mode.</p>
        </div>

        {/* Section 4 */}
        <div className="section right">
            <h2>READY TO<br />DEPLOY?</h2>
            <button style={{
                padding: '15px 40px', 
                fontSize: '1.2rem', 
                background: 'white', 
                color: 'black', 
                border: 'none', 
                marginTop: '20px',
                cursor: 'pointer'
            }}>GET STARTED</button>
        </div>

      </div>
    </ScrollControls>
  );
}

// 4. MAIN APP ENTRY POINT
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#080808' }}>
      <Canvas 
        shadows 
        dpr={[1, 1.5]} // Cap pixel ratio to save GPU power
        gl={{ antialias: true, preserveDrawingBuffer: true }} // Stability settings
        camera={{ position: [0, 0, 8], fov: 40 }}
      >
        <Lighting />
        <HTMLContent />
      </Canvas>
    </div>
  );
}