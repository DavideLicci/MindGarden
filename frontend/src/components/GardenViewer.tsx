import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useAuth } from '../hooks/useAuth';
import { apiService, Garden, PlantInstance } from '../services/api';

interface PlantProps {
  plant: PlantInstance;
}

const Plant: React.FC<PlantProps> = ({ plant }) => {
  const getPlantColor = (archetype: string) => {
    switch (archetype.toLowerCase()) {
      case 'joy': return '#FFD700';
      case 'sadness': return '#4169E1';
      case 'anger': return '#DC143C';
      case 'fear': return '#800080';
      case 'surprise': return '#FFA500';
      case 'disgust': return '#228B22';
      default: return '#8B4513';
    }
  };

  const getPlantHeight = (health: number, growthProgress: number) => {
    return (health / 100) * (growthProgress / 100) * 2 + 0.5;
  };

  return (
    <group position={[plant.position.x, 0, plant.position.z]}>
      {/* Stem */}
      <mesh position={[0, getPlantHeight(plant.health, plant.growthProgress) / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, getPlantHeight(plant.health, plant.growthProgress)]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Leaves/Flowers */}
      <mesh position={[0, getPlantHeight(plant.health, plant.growthProgress), 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color={getPlantColor(plant.archetype)} />
      </mesh>

      {/* Plant label */}
      <Text
        position={[0, getPlantHeight(plant.health, plant.growthProgress) + 0.5, 0]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {plant.archetype}
      </Text>
    </group>
  );
};

const GardenViewer: React.FC = () => {
  const { user } = useAuth();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchGarden();
  }, [user]);

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
    <div className="w-full h-screen">
      <div className="mb-4 p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">Your Mind Garden</h1>
        <p className="text-gray-600">
          {garden?.plants.length || 0} plants growing from your emotional journey
        </p>
      </div>

      <div className="w-full" style={{ height: 'calc(100vh - 120px)' }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#90EE90" />
          </mesh>

          {/* Plants */}
          {garden?.plants.map((plant) => (
            <Plant key={plant.id} plant={plant} />
          ))}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default GardenViewer;
