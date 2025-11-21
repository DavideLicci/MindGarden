import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { apiService } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface EmotionTrends {
  emotionTrends: { [date: string]: { [emotion: string]: number } };
  sentimentTrends: { date: string; avgSentiment: number; checkinCount: number }[];
  emotionSummary: { [emotion: string]: number };
  totalCheckins: number;
}

interface GardenHealth {
  gardenHealth: number;
  avgPlantHealth: number;
  avgSentiment: number;
  avgGrowth: number;
  plantCount: number;
  totalCheckins: number;
  healthTrend: string;
  lastCheckin: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
}

interface AchievementsData {
  achievements: Achievement[];
  stats: {
    totalCheckins: number;
    totalPlants: number;
    gardenHealth: number;
    currentStreak: number;
    uniqueEmotions: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trends' | 'health' | 'achievements' | 'report'>('trends');
  const [emotionTrends, setEmotionTrends] = useState<EmotionTrends | null>(null);
  const [gardenHealth, setGardenHealth] = useState<GardenHealth | null>(null);
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [trendsRes, healthRes, achievementsRes, reportRes] = await Promise.all([
        api.get('/analytics/emotion-trends'),
        api.get('/analytics/garden-health'),
        api.get('/analytics/achievements'),
        api.get('/analytics/report')
      ]);

      setEmotionTrends(trendsRes.data);
      setGardenHealth(healthRes.data);
      setAchievements(achievementsRes.data);
      setReport(reportRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'trends', label: 'Emotion Trends', icon: '📊' },
    { id: 'health', label: 'Garden Health', icon: '🌱' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'report', label: 'Weekly Report', icon: '📋' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your emotional journey and garden growth</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'trends' && emotionTrends && <EmotionTrendsTab data={emotionTrends} />}
        {activeTab === 'health' && gardenHealth && <GardenHealthTab data={gardenHealth} />}
        {activeTab === 'achievements' && achievements && <AchievementsTab data={achievements} />}
        {activeTab === 'report' && report && <ReportTab data={report} />}
      </div>
    </div>
  );
};

const EmotionTrendsTab: React.FC<{ data: EmotionTrends }> = ({ data }) => {
  const sentimentChartData = {
    labels: data.sentimentTrends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Average Sentiment',
        data: data.sentimentTrends.map(t => t.avgSentiment),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const emotionColors: { [key: string]: string } = {
    joy: '#FFD700',
    sadness: '#4169E1',
    anger: '#DC143C',
    fear: '#800080',
    surprise: '#FFA500',
    disgust: '#228B22',
    anxiety: '#FF6347',
    excitement: '#FF1493',
    gratitude: '#98FB98',
    love: '#FF69B4',
    confusion: '#D3D3D3',
    calm: '#87CEEB',
    neutral: '#8B4513',
    positivo: '#10B981',
    negativo: '#EF4444',
  };

  const emotionChartData = {
    labels: Object.keys(data.emotionSummary),
    datasets: [
      {
        data: Object.values(data.emotionSummary),
        backgroundColor: Object.keys(data.emotionSummary).map(
          emotion => emotionColors[emotion] || '#6B7280'
        ),
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sentiment Trends</h2>
        <Line
          data={sentimentChartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' as const },
              title: { display: true, text: 'Daily Average Sentiment' },
            },
            scales: {
              y: {
                min: -1,
                max: 1,
                ticks: {
                  callback: function(value) {
                    return (Number(value) * 100).toFixed(0) + '%';
                  }
                }
              }
            }
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Emotion Distribution</h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2">
            <Doughnut
              data={emotionChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'right' as const },
                },
              }}
            />
          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.emotionSummary).map(([emotion, count]) => (
                <div key={emotion} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: emotionColors[emotion] || '#6B7280' }}
                  ></div>
                  <span className="capitalize text-sm">{emotion}: {count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GardenHealthTab: React.FC<{ data: GardenHealth }> = ({ data }) => {
  const healthMetrics = [
    { label: 'Garden Health', value: data.gardenHealth, color: 'text-green-600' },
    { label: 'Average Plant Health', value: data.avgPlantHealth, color: 'text-blue-600' },
    { label: 'Average Sentiment', value: data.avgSentiment, color: 'text-purple-600' },
    { label: 'Average Growth', value: data.avgGrowth, color: 'text-yellow-600' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthMetrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{metric.label}</h3>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {(metric.value * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Garden Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🌱</div>
            <div className="text-2xl font-bold text-green-600">{data.plantCount}</div>
            <div className="text-sm text-gray-500">Plants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-blue-600">{data.totalCheckins}</div>
            <div className="text-sm text-gray-500">Check-ins</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">{getTrendIcon(data.healthTrend)}</div>
            <div className="text-2xl font-bold text-purple-600 capitalize">{data.healthTrend}</div>
            <div className="text-sm text-gray-500">Trend</div>
          </div>
        </div>
      </div>

      {data.lastCheckin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">
            Last check-in: {new Date(data.lastCheckin).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

const AchievementsTab: React.FC<{ data: AchievementsData }> = ({ data }) => {
  const achievementIcons: { [key: string]: string } = {
    first_checkin: '🌟',
    regular_logger: '📅',
    dedicated_gardener: '🌺',
    master_gardener: '👑',
    emotion_explorer: '🧭',
    emotion_master: '🎯',
    positive_week: '✨',
    growing_garden: '🌿',
    flourishing_garden: '🌳',
    healthy_garden: '💚',
    week_streak: '🔥',
    month_streak: '🚀',
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.stats.totalCheckins}</div>
            <div className="text-sm text-gray-500">Check-ins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.stats.totalPlants}</div>
            <div className="text-sm text-gray-500">Plants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(data.stats.gardenHealth * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-500">Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.stats.currentStreak}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{data.stats.uniqueEmotions}</div>
            <div className="text-sm text-gray-500">Emotions</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Achievements Unlocked</h2>
        {data.achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.achievements.map((achievement) => (
              <div key={achievement.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{achievementIcons[achievement.id] || '🏆'}</span>
                  <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No achievements yet. Keep checking in to unlock your first achievement!
          </p>
        )}
      </div>
    </div>
  );
};

const ReportTab: React.FC<{ data: any }> = ({ data }) => {
  if (!data.report) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Report</h2>
        <p className="text-gray-600">{data.message}</p>
      </div>
    );
  }

  const report = data.report;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {report.period === 'weekly' ? 'Weekly' : 'Monthly'} Report
        </h2>
        <p className="text-gray-600 mb-4">
          {report.dateRange.from} to {report.dateRange.to}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{report.metrics.totalCheckins}</div>
            <div className="text-sm text-gray-600">Check-ins</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(report.metrics.avgSentiment * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Avg Sentiment</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {(report.metrics.avgIntensity * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Avg Intensity</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 capitalize">
              {report.metrics.dominantEmotion}
            </div>
            <div className="text-sm text-gray-600">Top Emotion</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Key Insights</h3>
          <ul className="space-y-2">
            {report.insights.map((insight: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">💡</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
