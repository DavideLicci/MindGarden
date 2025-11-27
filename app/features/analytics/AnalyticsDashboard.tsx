import React, { useState } from 'react';
import { BarChart3, TrendingUp, Activity, Download } from 'lucide-react';
import AdvancedCharts from './AdvancedCharts';
import EmotionHeatmap from './EmotionHeatmap';

interface DateRange {
  start: string;
  end: string;
}

interface AnalyticsDashboardProps {
  dateRange?: DateRange;
}

type TabType = 'overview' | 'trends' | 'advanced-viz' | 'export';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ dateRange }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'trends' as TabType, label: 'Trends', icon: TrendingUp },
    { id: 'advanced-viz' as TabType, label: 'Advanced Viz', icon: Activity },
    { id: 'export' as TabType, label: 'Export', icon: Download },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <AdvancedCharts
              emotionData={[]} // TODO: Load actual data
              checkinData={[]} // TODO: Load actual data
              dateRange={dateRange || { start: '', end: '' }}
            />
          </div>
        );
      case 'trends':
        return (
          <div className="space-y-6">
            <AdvancedCharts
              emotionData={[]} // TODO: Load actual data
              checkinData={[]} // TODO: Load actual data
              dateRange={dateRange || { start: '', end: '' }}
            />
          </div>
        );
      case 'advanced-viz':
        return (
          <div className="space-y-6">
            <EmotionHeatmap dateRange={dateRange} />
            {/* CorrelationMatrix and AdvancedTimeline components are empty, so commented out */}
            {/* <CorrelationMatrix dateRange={dateRange} /> */}
            {/* <AdvancedTimeline dateRange={dateRange} /> */}
          </div>
        );
      case 'export':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Export Analytics Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Export functionality coming soon...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
