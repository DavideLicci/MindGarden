import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

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
  const [showActions, setShowActions] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const stemRef = useRef<any>(null);
  const flowerRef = useRef<any>(null);
  const leavesRef = useRef<any>(null);

  const config = useMemo(() => getPlantConfig(plant.archetype), [plant.archetype]);
  const plantHeight = (plant.health / 100) * (plant.growthProgress / 100) * 2 + 0.5;
  const isHealthy = plant.health > 0.7;
  const isBlooming = plant.growthProgress > 0.8 && config.bloomEffect;
  const isLoading = actionLoading === plant.id;

  // Enhanced animations
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Stem swaying
    if (stemRef.current) {
      stemRef.current.rotation.z = Math.sin(time * 0.5 + plant.position.x) * 0.05;
      stemRef.current.position.y = plant.position.y + Math.sin(time + plant.position.x) * 0.03;
    }

    // Flower blooming animation
    if (flowerRef.current && isBlooming) {
      flowerRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
      flowerRef.current.rotation.y = time * 0.5;
    }

    // Leaves rustling
    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf: any, index: number) => {
        leaf.rotation.z = Math.sin(time * 0.8 + index) * 0.1;
      });
    }

    // Watering particles
    if (isWatering) {
      // Particle effect would be added here with useSprings
    }
  });

  const handleWaterAction = async () => {
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 2000);
    await onAction(plant.id, 'water');
  };

  const renderFlower = () => {
    const baseProps = {
      ref: flowerRef,
      position: [0, plantHeight, 0] as [number, number, number],
      onClick: () => setShowActions(!showActions),
    };

    switch (config.flowerShape) {
      case 'droplet':
        return (
          <mesh {...baseProps}>
            <coneGeometry args={[config.flowerSize, config.flowerSize * 2, 8]} />
            <meshStandardMaterial color={config.flowerColor} />
          </mesh>
        );
      case 'thorn':
        return (
          <mesh {...baseProps}>
            <octahedronGeometry args={[config.flowerSize]} />
            <meshStandardMaterial color={config.flowerColor} />
          </mesh>
        );
      case 'mystical':
        return (
          <mesh {...baseProps}>
            <icosahedronGeometry args={[config.flowerSize]} />
            <meshStandardMaterial color={config.flowerColor} emissive={config.flowerColor} emissiveIntensity={0.1} />
          </mesh>
        );
      case 'star':
        return (
          <mesh {...baseProps}>
            <octahedronGeometry args={[config.flowerSize]} />
            <meshStandardMaterial color={config.flowerColor} />
          </mesh>
        );
      case 'organic':
        return (
          <mesh {...baseProps}>
            <dodecahedronGeometry args={[config.flowerSize]} />
            <meshStandardMaterial color={config.flowerColor} />
          </mesh>
        );
      default:
        return (
          <mesh {...baseProps}>
            <sphereGeometry args={[config.flowerSize]} />
            <meshStandardMaterial color={config.flowerColor} />
          </mesh>
        );
    }
  };

  const renderLeaves = useMemo(() => {
    const leaves = [];
    for (let i = 0; i < config.leafCount; i++) {
      const angle = (i / config.leafCount) * Math.PI * 2;
      const radius = 0.15;
      const height = plantHeight * (0.3 + (i % 3) * 0.2);

      leaves.push(
        <mesh
          key={i}
          position={[
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          ]}
          rotation={[0, angle, Math.PI / 6]}
        >
          <planeGeometry args={[0.1, 0.15]} />
          <meshStandardMaterial
            color={isHealthy ? "#228B22" : "#8B7355"}
            side={2}
            transparent
            opacity={plant.health}
          />
        </mesh>
      );
    }
    return leaves;
  }, [config.leafCount, plantHeight, isHealthy, plant.health]);

  return (
    <group position={[plant.position.x, 0, plant.position.z]}>
      {/* Stem */}
      <mesh
        ref={stemRef}
        position={[0, plantHeight / 2, 0]}
        onClick={() => setShowActions(!showActions)}
      >
        <cylinderGeometry args={[0.03, 0.05, plantHeight]} />
        <meshStandardMaterial color={config.stemColor} />
      </mesh>

      {/* Leaves */}
      <group ref={leavesRef}>
        {renderLeaves}
      </group>

      {/* Flower/Bloom */}
      {renderFlower()}

      {/* Growth stage indicator */}
      {plant.growthProgress < 0.3 && (
        <mesh position={[0, plantHeight + 0.1, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}

      {/* Blooming particles */}
      {isBlooming && (
        <group>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.3,
                  plantHeight + 0.1,
                  Math.sin(angle) * 0.3
                ]}
              >
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial color={config.flowerColor} emissive={config.flowerColor} emissiveIntensity={0.3} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Plant label */}
      <Text
        position={[0, plantHeight + 0.6, 0]}
        fontSize={0.08}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {plant.archetype}
      </Text>

      {/* Health indicator */}
      <Text
        position={[0, plantHeight + 0.75, 0]}
        fontSize={0.06}
        color={plant.health > 0.5 ? "#228B22" : "#DC143C"}
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(plant.health * 100)}%
      </Text>

      {/* Action buttons */}
      {showActions && (
        <Html position={[0, plantHeight + 1.2, 0]}>
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg min-w-[140px] border border-gray-200">
            <div className="text-xs font-semibold mb-3 text-center text-gray-800">
              🌱 Care Actions
            </div>
            <div className="space-y-2">
              <button
                onClick={handleWaterAction}
                disabled={isLoading}
                className="w-full text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
              >
                {isLoading ? '...' : '💧 Water'}
              </button>
              <button
                onClick={() => onAction(plant.id, 'meditate')}
                disabled={isLoading}
                className="w-full text-xs bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
              >
                {isLoading ? '...' : '🧘 Meditate'}
              </button>
              <button
                onClick={() => onAction(plant.id, 'journal')}
                disabled={isLoading}
                className="w-full text-xs bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
              >
                {isLoading ? '...' : '📝 Journal'}
              </button>
              <button
                onClick={() => onAction(plant.id, 'prune')}
                disabled={isLoading}
                className="w-full text-xs bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
              >
                {isLoading ? '...' : '✂️ Prune'}
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Watering particle effect */}
      {isWatering && (
        <group>
          {Array.from({ length: 20 }, (_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 0.5;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * distance,
                  plantHeight + Math.random() * 0.5,
                  Math.sin(angle) * distance
                ]}
              >
                <sphereGeometry args={[0.01]} />
                <meshStandardMaterial color="#4169E1" transparent opacity={0.7} />
              </mesh>
            );
          })}
        </group>
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

  const fetchGarden = async () => {
    if (!user) return;

    try {
      const gardenData = await apiService.getGarden();
      setGarden(gardenData);
    } catch (err) {
      setError('Failed to load garden');
      console.error('Garden fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarden();
  }, [user]);

  const handlePlantAction = async (plantId: string, action: string) => {
    setActionLoading(plantId);
    try {
      await apiService.performPlantAction(plantId, {
        userId: user!.id,
        action,
      });
      // Refresh garden data after action
      await fetchGarden();
    } catch (err) {
      console.error('Plant action error:', err);
      setError('Failed to perform plant action');
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
        <div className="text-red-600 text-xl">{error}</div>
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
