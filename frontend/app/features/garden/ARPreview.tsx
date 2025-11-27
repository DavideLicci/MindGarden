import React from 'react';

const ARPreview: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">AR Preview Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          Experience your Mind Garden in augmented reality. This feature is under development and will allow you to view and interact with your emotional plants in your physical space using your device's camera and AR capabilities.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>🔮 Planned Features:</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            <li>Place plants in your real environment</li>
            <li>Interactive AR plant care</li>
            <li>Real-time growth visualization</li>
            <li>Share AR gardens with friends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ARPreview;
