
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Float, PerspectiveCamera, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// --- Helper Components ---

// Interactive Annotation Point
const Annotation = ({ position, label, description }: { position: [number, number, number], label: string, description: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Html position={position} zIndexRange={[100, 0]}>
      <div className="relative group">
        {/* Hotspot Button */}
        <div 
            className={`w-6 h-6 rounded-full border-2 shadow-md cursor-pointer flex items-center justify-center transition-all duration-300 ${
                isOpen ? 'bg-hett-brown border-white scale-110' : 'bg-white/90 border-hett-brown hover:scale-110'
            }`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
        >
             <div className={`w-2 h-2 rounded-full transition-colors ${isOpen ? 'bg-white' : 'bg-hett-brown'}`}></div>
             {/* Pulse effect */}
             {!isOpen && <div className="absolute inset-0 rounded-full bg-hett-brown/30 animate-ping"></div>}
        </div>
        
        {/* Tooltip Card */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-56 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 transition-all duration-300 origin-bottom ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}>
            <h4 className="font-bold text-hett-dark text-xs uppercase tracking-wider mb-1 border-b border-gray-100 pb-1">{label}</h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">{description}</p>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45"></div>
        </div>
      </div>
    </Html>
  );
};

// Measurement Line Helper
const DimensionLine = ({ start, end, label }: { start: [number, number, number], end: [number, number, number], label: string }) => {
    // Calculate center for label
    const center = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
    ] as [number, number, number];
    
    return (
        <group>
            {/* Dashed Line */}
            <Line 
                points={[start, end]} 
                color="#1a1a1a" 
                opacity={0.4} 
                transparent 
                lineWidth={1} 
                dashed={true} 
                dashScale={10} 
                gapSize={5} 
            />
            
            {/* End Caps */}
            <mesh position={start}><sphereGeometry args={[0.025]} /><meshBasicMaterial color="#1a1a1a" opacity={0.6} transparent /></mesh>
            <mesh position={end}><sphereGeometry args={[0.025]} /><meshBasicMaterial color="#1a1a1a" opacity={0.6} transparent /></mesh>
            
            {/* Label */}
            <Html position={center} center zIndexRange={[50, 0]}>
                 <div className="bg-hett-dark/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap backdrop-blur-sm border border-white/10">
                    {label}
                </div>
            </Html>
        </group>
    );
};

// Main 3D Mesh Component - Matches HETT Dakpaneel Eco+
// Anthracite Top, Cream Core, White Bottom, Trapezoidal Ribs
const SandwichPanelMesh = (props: any) => {
  const group = useRef<THREE.Group>(null);

  // Gentle rotation animation
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = 0.1 + Math.sin(state.clock.getElapsedTime() * 0.15) * 0.1;
    }
  });

  // Dimensions 
  const width = 2.0; 
  const length = 3.5;
  const thickness = 0.15; // Visual thickness
  const ribHeight = 0.06;
  const ribWidthTop = 0.08;
  const ribWidthBottom = 0.16; // Trapezoid wider at bottom

  // Colors
  const colorAnthracite = "#293133"; // Dark grey top
  const colorCore = "#fdf6d3"; // Cream/Yellowish foam
  const colorWhite = "#f5f5f5"; // Light grey/white bottom

  // Geometry for ribs
  const TrapezoidGeometry = ({ position }: { position: [number, number, number] }) => (
     <mesh position={position} castShadow receiveShadow>
        <cylinderGeometry args={[ribWidthTop, ribWidthBottom, length, 4]} /> 
        {/* We rotate cylinder to make it run along Z and look like a rib, but actually standard box geometry is easier for basic look. 
            Let's use a composite shape for better trapezoid effect or just a box for simplicity in this demo, 
            but scaled to look like the image.
        */}
        <boxGeometry args={[ribWidthBottom, ribHeight, length]} />
        <meshStandardMaterial color={colorAnthracite} metalness={0.3} roughness={0.6} />
     </mesh>
  );

  return (
    <group ref={group} {...props}>
      
      {/* --- 1. Insulation Core (PIR - Cream) --- */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, thickness, length]} />
        <meshStandardMaterial color={colorCore} roughness={0.9} />
      </mesh>

      {/* --- 2. Bottom Sheet (Interior - White) --- */}
      <mesh position={[0, -thickness / 2 - 0.005, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.01, length]} />
        <meshStandardMaterial color={colorWhite} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* --- 3. Top Sheet (Exterior - Anthracite) --- */}
      <mesh position={[0, thickness / 2 + 0.005, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.01, length]} />
        <meshStandardMaterial color={colorAnthracite} metalness={0.3} roughness={0.6} />
      </mesh>

      {/* --- 4. Trapezoidal Ribs (Anthracite) --- */}
      {/* 3 Main Ribs as per standard 1000mm panel often having 3 crowns */}
      {[-0.66, 0, 0.66].map((xPos, i) => (
        <mesh key={i} position={[xPos, thickness / 2 + ribHeight / 2, 0]} castShadow receiveShadow>
          {/* Approximating trapezoid with a box for WebGL simplicity, slightly tapered visually via texture or just blocky is fine for demo */}
          <boxGeometry args={[ribWidthBottom, ribHeight, length]} />
          <meshStandardMaterial color={colorAnthracite} metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
      
      {/* Smaller ribs in between? The image shows mostly flat or micro-ribbed. Let's stick to the main crowns. */}


      {/* --- 5. Cut Section Texture (Foam visualization) --- */}
      <mesh position={[0, 0, length / 2 + 0.001]}>
         <planeGeometry args={[width, thickness]} />
         <meshStandardMaterial color="#ebe4bf" roughness={1} />
      </mesh>


      {/* --- ANNOTATIONS (Hotspots) --- */}
      
      {/* Core */}
      <Annotation 
        position={[0.3, 0, length/2]} 
        label="PIR Isolatiekern" 
        description="Hoge dichtheid isolatieschuim (40kg/m³). Uitstekende thermische prestaties en brandvertragend." 
      />
      
      {/* Coating */}
      <Annotation 
        position={[0.1, thickness/2 + 0.02, -0.5]} 
        label="Staalplaat (Antraciet)" 
        description="0.63mm staal met 25µm polyester coating in RAL 7016 (Antraciet). Weerbestendig en kleurvast." 
      />

      {/* Interior */}
      <Annotation 
        position={[-0.4, -thickness/2 - 0.02, 0.8]} 
        label="Interieurzijde (Wit)" 
        description="Gladde of licht geprofileerde afwerking in RAL 9002/9010. Gemakkelijk schoon te houden." 
      />

      {/* Profile */}
      <Annotation 
        position={[0.66, thickness/2 + ribHeight, 0]} 
        label="3-Kroons Profiel" 
        description="Zorgt voor waterafvoer en extra stijfheid van het paneel, waardoor grotere overspanningen mogelijk zijn." 
      />


      {/* --- MEASUREMENTS (Lines) --- */}
      
      {/* Width */}
      <DimensionLine 
        start={[-width/2, -thickness - 0.4, length/2]} 
        end={[width/2, -thickness - 0.4, length/2]} 
        label="1000mm Werkend" 
      />
      
      {/* Thickness */}
      <DimensionLine 
        start={[width/2 + 0.4, -thickness/2, length/3]} 
        end={[width/2 + 0.4, thickness/2, length/3]} 
        label="40-120mm" 
      />

    </group>
  );
};

const Panel3D: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden relative group">
      
      {/* Interactive Hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
         <span className="bg-white/60 backdrop-blur-sm border border-white/50 px-4 py-1.5 rounded-full text-[10px] font-bold text-hett-dark uppercase tracking-widest shadow-sm">
            Interactief 3D Model
         </span>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10 opacity-60 group-hover:opacity-100 transition-opacity">
         <span className="text-[10px] text-gray-500 font-medium">
            Klik op de punten voor details • Draai om te bekijken
         </span>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[3, 2.5, 4]} fov={45} />
        
        <Stage environment="city" intensity={0.6} contactShadow={false} adjustCamera={false}>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                <SandwichPanelMesh rotation={[0.1, -0.4, 0]} />
            </Float>
        </Stage>

        <OrbitControls 
            autoRotate={false} 
            enableZoom={true} 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.5}
            enablePan={false}
        />
      </Canvas>
    </div>
  );
};

export default Panel3D;
    