import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DateRange, PeriodComparison } from './DateRangeFilter';

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

interface EmotionData {
  date: string;
  emotion: string;
  count: number;
  sentiment: number;
}

interface CheckinData {
  date: string;
  count: number;
  avgSentiment: number;
  dominantEmotion: string;
}

interface AdvancedChartsProps {
  emotionData: EmotionData[];
  checkinData: CheckinData[];
  comparisonData?: CheckinData[];
  comparisonLabel?: string;
  dateRange: DateRange;
  className?: string;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  emotionData,
  checkinData,
  comparisonData,
  comparisonLabel,
  dateRange,
  className = ""
}) => {
  // Prepare emotion distribution data
  const emotionCounts = emotionData.reduce((acc, item) => {
    acc[item.emotion] = (acc[item.emotion] || 0) + item.count;
    return acc;
  }, {} as Record<string, number>);

  const emotionLabels = Object.keys(emotionCounts);
  const emotionValues = Object.values(emotionCounts);

  // Prepare sentiment trend data
  const sentimentLabels = checkinData.map(d => d.date);
  const sentimentData = checkinData.map(d => d.avgSentiment);

  // Prepare comparison data if available
  const comparisonSentimentData = comparisonData?.map(d => d.avgSentiment) || [];

  // Calculate trend indicators
  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const percentage = ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100;

    if (percentage > 5) return { direction: 'up', percentage };
    if (percentage < -5) return { direction: 'down', percentage };
    return { direction: 'stable', percentage };
  };

  const sentimentTrend = calculateTrend(sentimentData);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Emotion correlation analysis
  const emotionSentimentMap = emotionData.reduce((acc, item) => {
    if (!acc[item.emotion]) {
      acc[item.emotion] = { totalSentiment: 0, count: 0 };
    }
    acc[item.emotion].totalSentiment += item.sentiment * item.count;
    acc[item.emotion].count += item.count;
    return acc;
  }, {} as Record<string, { totalSentiment: number; count: number }>);

  const emotionCorrelationData = Object.entries(emotionSentimentMap)
    .map(([emotion, data]) => ({
      emotion,
      avgSentiment: data.totalSentiment / data.count,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment Trend</p>
              <p className={`text-lg font-semibold ${getTrendColor(sentimentTrend.direction)}`}>
                {sentimentTrend.percentage > 0 ? '+' : ''}{sentimentTrend.percentage.toFixed(1)}%
              </p>
            </div>
            {getTrendIcon(sentimentTrend.direction)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Check-ins</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {checkinData.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Sentiment</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {(sentimentData.reduce((sum, val) => sum + val, 0) / sentimentData.length * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend with Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Sentiment Trend {comparisonLabel && `(${comparisonLabel})`}
          </h3>
          <Line
            data={{
              labels: sentimentLabels,
              datasets: [
                {
                  label: 'Current Period',
                  data: sentimentData,
                  borderColor: '#3B82F6',
                  backgroundColor: '#3B82F6',
                  tension: 0.4,
                  pointRadius: 3,
                  pointHoverRadius: 5,
                },
                ...(comparisonData ? [{
                  label: 'Previous Period',
                  data: comparisonSentimentData,
                  borderColor: '#94A3B8',
                  backgroundColor: '#94A3B8',
                  borderDash: [5, 5],
                  tension: 0.4,
                  pointRadius: 2,
                  pointHoverRadius: 4,
                }] : [])
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 1,
                  ticks: {
                    callback: (value) => `${Number(value) * 100}%`
                  }
                },
              },
            }}
          />
        </div>

        {/* Emotion Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Emotion Distribution
          </h3>
          <Doughnut
            data={{
              labels: emotionLabels,
              datasets: [{
                data: emotionValues,
                backgroundColor: [
                  '#FFD700', '#4169E1', '#DC143C', '#800080',
                  '#FFA500', '#228B22', '#FF69B4', '#00CED1',
                  '#FF6347', '#32CD32', '#FF4500', '#20B2AA'
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
              }],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                      const percentage = ((context.parsed / total) * 100).toFixed(1);
                      return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                  }
                }
              },
            }}
          />
        </div>

        {/* Check-in Frequency */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Check-in Frequency
          </h3>
          <Bar
            data={{
              labels: checkinData.map(d => d.date),
              datasets: [{
                label: 'Check-ins',
                data: checkinData.map(d => d.count),
                backgroundColor: '#10B981',
                borderRadius: 4,
              }],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  }
                },
              },
            }}
          />
        </div>

        {/* Emotion-Sentiment Correlation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Emotion-Sentiment Correlation
          </h3>
          <div className="space-y-3">
            {emotionCorrelationData.slice(0, 6).map((item, index) => (
              <div key={item.emotion} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: [
                        '#FFD700', '#4169E1', '#DC143C', '#800080',
                        '#FFA500', '#228B22'
                      ][index % 6]
                    }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {item.emotion}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(item.avgSentiment * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    ({item.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Shows average sentiment score for each emotion type
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
