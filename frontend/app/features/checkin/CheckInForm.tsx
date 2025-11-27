import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { apiService } from '../../core/api';

const CheckInForm: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [emotionHint, setEmotionHint] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const emotions = [
    'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
    'anxiety', 'excitement', 'gratitude', 'love', 'confusion', 'calm'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const checkInData = {
        userId: user.id,
        text: text.trim() || undefined,
        emotionHint: emotionHint || undefined,
        intensity,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };

      await apiService.createCheckIn(checkInData);
      setSuccess(true);
      setText('');
      setEmotionHint('');
      setIntensity(5);
      setTags('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Emotional Check-In</h1>

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Check-in recorded successfully! Your emotional plant is growing.
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling? (Optional)
            </label>
            <textarea
              id="text"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your thoughts, feelings, or what's on your mind..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="emotion" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Emotion
            </label>
            <select
              id="emotion"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={emotionHint}
              onChange={(e) => setEmotionHint(e.target.value)}
            >
              <option value="">Select an emotion (optional)</option>
              {emotions.map(emotion => (
                <option key={emotion} value={emotion}>
                  {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-2">
              Intensity (1-10)
            </label>
            <input
              type="range"
              id="intensity"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span className="font-medium">{intensity}</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated, optional)
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="work, family, health, etc."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Record Check-In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckInForm;
