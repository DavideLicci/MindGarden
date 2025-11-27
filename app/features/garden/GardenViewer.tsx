import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useAuth } from '../auth/useAuth';
import { apiService } from '../../core/api';

interface PlantInstance {
  id: string;
  userId: string;
  checkinId: string;
  archetype: string;
  params?: any;
  position: { x: number; y: number; z: number };
  styleSkin?: string;
  health: number;
  growthProgress: number;
  createdAt: string;
}

interface Garden {
  gardenId: string;
  userId: string;
  createdAt: string;
  plants: PlantInstance[];
  aggregate?: any;
}

interface PlantProps {
  plant: PlantInstance;
  onAction: (plantId: string, action: string) => Promise<void>;
  actionLoading: string | null;
}

const getPlantConfig = (archetype: string) => {
  switch (archetype.toLowerCase()) {
    case 'joy':
      return {
        flowerColor: '#FFD700',
        stemColor: '#228B22',
        flowerShape: 'sphere',
        leafCount: 4,
        flowerSize: 0.25,
        bloomEffect: true
      };
    case 'sadness':
      return {
        flowerColor: '#4169E1',
        stemColor: '#228B22',
        flowerShape: 'droplet',
        leafCount: 6,
        flowerSize: 0.2,
        bloomEffect: false
      };
    case 'anger':
      return {
        flowerColor: '#DC143C',
        stemColor: '#8B4513',
        flowerShape: 'thorn',
        leafCount: 3,
        flowerSize: 0.3,
        bloomEffect: false
      };
    case 'fear':
      return {
        flowerColor: '#800080',
        stemColor: '#228B22',
        flowerShape: 'mystical',
        leafCount: 5,
        flowerSize: 0.22,
        bloomEffect: true
      };
    case 'surprise':
      return {
        flowerColor: '#FFA500',
        stemColor: '#228B22',
        flowerShape: 'star',
        leafCount: 4,
        flowerSize: 0.28,
        bloomEffect: true
      };
    case 'disgust':
      return {
        flowerColor: '#228B22',
        stemColor: '#228B22',
        flowerShape: 'organic',
        leafCount: 7,
        flowerSize: 0.18,
        bloomEffect: false
      };
    default:
      return {
        flowerColor: '#8B4513',
        stemColor: '#228B22',
        flowerShape: 'sphere',
        leafCount: 4,
        flowerSize: 0.2,
        bloomEffect: false
      };
  }
};

const Plant = ({ plant, onAction, actionLoading }: PlantProps) => {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const config = getPlantConfig(plant.archetype);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (config.bloomEffect) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      }
    }
  });

  const handleClick = async () => {
    if (actionLoading) return;
    setClicked(true);
    try {
      await onAction(plant.id, 'water');
    } catch (error) {
      console.error('Failed to water plant:', error);
    } finally {
      setClicked(false);
    }
  };

  return (
    <group position={[plant.position.x, plant.position.y, plant.position.z]}>
      {/* Stem */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color={config.stemColor} />
      </mesh>

      {/* Leaves */}
      {Array.from({ length: config.leafCount }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / config.leafCount) * Math.PI * 2) * 0.3,
            0.3 + (i % 2) * 0.2,
            Math.sin((i / config.leafCount) * Math.PI * 2) * 0.3
          ]}
          rotation={[0, (i / config.leafCount) * Math.PI * 2, Math.PI / 6]}
        >
          <planeGeometry args={[0.2, 0.1]} />
          <meshStandardMaterial color="#228B22" side={2} />
        </mesh>
      ))}

      {/* Flower */}
      <mesh
        ref={meshRef}
        position={[0, 1, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {config.flowerShape === 'sphere' && <sphereGeometry args={[config.flowerSize, 16, 16]} />}
        {config.flowerShape === 'droplet' && <coneGeometry args={[config.flowerSize, config.flowerSize * 2, 8]} />}
        {config.flowerShape === 'thorn' && <octahedronGeometry args={[config.flowerSize]} />}
        {config.flowerShape === 'mystical' && <icosahedronGeometry args={[config.flowerSize]} />}
        {config.flowerShape === 'star' && <octahedronGeometry args={[config.flowerSize]} />}
        {config.flowerShape === 'organic' && <dodecahedronGeometry args={[config.flowerSize]} />}
        <meshStandardMaterial color={config.flowerColor} emissive={hovered ? config.flowerColor : '#000000'} emissiveIntensity={hovered ? 0.2 : 0} />
      </mesh>

      {/* Health indicator */}
      <Html position={[0, 1.5, 0]}>
        <div className="text-xs bg-white/80 px-2 py-1 rounded shadow">
          Health: {Math.round(plant.health * 100)}%
        </div>
      </Html>

      {/* Action feedback */}
      {actionLoading === plant.id && (
        <Html position={[0, 1.7, 0]}>
          <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded shadow animate-pulse">
            Watering...
          </div>
        </Html>
      )}
    </group>
  );
};

const GardenViewer: React.FC = () => {
  const { user } = useAuth();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadGarden();
  }, [user]);

  const loadGarden = async () => {
    if (!user) return;
    try {
      const data = await apiService.getGarden();
      setGarden(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load garden');
    } finally {
      setLoading(false);
    }
  };

  const handlePlantAction = async (plantId: string, action: string) => {
    setActionLoading(plantId);
    try {
      await apiService.performPlantAction(plantId, {
        userId: user!.id,
        action,
        metadata: {}
      });
      // Reload garden to see updated state
      await loadGarden();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your garden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={loadGarden}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-200 to-green-200">
      <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg mx-4">
        <h1 className="text-2xl font-bold text-gray-900">Your Mind Garden</h1>
        <p className="text-gray-600">
          {garden?.plants.length || 0} plants growing from your emotional journey
        </p>
        {garden?.aggregate && (
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-green-600">Health: {(garden.aggregate.health * 100).toFixed(0)}%</span>
            <span className="text-blue-600">Plants: {garden.aggregate.plantCount}</span>
          </div>
        )}
      </div>

      <div className="w-full" style={{ height: 'calc(100vh - 120px)' }}>
        <Canvas
          camera={{ position: [0, 8, 12], fov: 60 }}
          shadows
        >
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Sky gradient background */}
          <color attach="background" args={['#87CEEB']} />
          <fog attach="fog" args={['#87CEEB', 15, 30]} />

          {/* Ground with texture */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#90EE90" />
          </mesh>

          {/* Garden border */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <ringGeometry args={[9.5, 10, 32]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>

          {/* Plants */}
          {garden?.plants.map((plant) => (
            <Plant
              key={plant.id}
              plant={plant}
              onAction={handlePlantAction}
              actionLoading={actionLoading}
            />
          ))}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default GardenViewer;
