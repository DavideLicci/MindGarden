import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { apiService, Garden, PlantInstance } from '../services/api';

interface PlantProps {
  plant: PlantInstance;
}

const Plant: React.FC<PlantProps> = ({ plant }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Simple plant representation - in a real app, you'd have different models based on archetype
  const color = plant.health > 0.7 ? '#4ade80' : plant.health > 0.4 ? '#fbbf24' : '#ef4444';
  const scale = plant.growthProgress || 1;

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle swaying animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + plant.position.x) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[plant.position.x, plant.position.y, plant.position.z]}
      scale={[scale, scale, scale]}
    >
      <cylinderGeometry args={[0.1, 0.2, 1, 8]} />
      <meshStandardMaterial color={color} />
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {plant.archetype}
      </Text>
    </mesh>
  );
};

const GardenScene: React.FC<{ plants: PlantInstance[] }> = ({ plants }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8b5a3c" />
      </mesh>

      {/* Render plants */}
      {plants.map((plant) => (
        <Plant key={plant.id} plant={plant} />
      ))}
    </>
  );
};

const GardenViewer: React.FC = () => {
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGarden = async () => {
      try {
        const gardenData = await apiService.getGarden();
        setGarden(gardenData);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load garden');
      } finally {
        setLoading(false);
      }
    };

    fetchGarden();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading your garden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 border rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
        <GardenScene plants={garden?.plants || []} />
      </Canvas>
    </div>
  );
};

export default GardenViewer;
