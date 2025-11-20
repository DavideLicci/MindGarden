import React, { useState } from 'react';

const ARPreview: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);

  // Check for AR support (simplified - in real app, check for WebXR)
  React.useEffect(() => {
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
          setIsSupported(supported);
        } catch (error) {
          setIsSupported(false);
        }
      }
    };
    checkARSupport();
  }, []);

  const startAR = async () => {
    if (!isSupported) return;

    try {
      const session = await (navigator as any).xr.requestSession('immersive-ar');
      // In a real implementation, you'd set up the AR session
      console.log('AR session started', session);
    } catch (error) {
      console.error('Failed to start AR session', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">AR Garden Preview</h2>

      <div className="bg-gray-100 rounded-lg p-8 text-center">
        {isSupported ? (
          <div>
            <p className="text-lg mb-4">Your device supports AR! Experience your garden in augmented reality.</p>
            <button
              onClick={startAR}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Start AR Experience
            </button>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-4">AR is not supported on this device or browser.</p>
            <p className="text-gray-600">
              Try using a compatible device with a modern browser that supports WebXR.
            </p>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Preview Features:</h3>
          <ul className="text-left max-w-md mx-auto space-y-2">
            <li>• View your garden plants in 3D space</li>
            <li>• Place plants in your real environment</li>
            <li>• Interact with plants using gestures</li>
            <li>• See plant health and growth in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ARPreview;
