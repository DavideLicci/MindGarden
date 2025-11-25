import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { apiService } from '../../core/api';
import { Calendar, Clock, TrendingUp, Zap } from 'lucide-react';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
  emotion: string;
  intensity: number;
  count: number;
}

interface EmotionHeatmapProps {
  dateRange?: {
    start: string;
    end: string;
  };
}

const EmotionHeatmap: React.FC<EmotionHeatmapProps> = ({ dateRange }) => {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadHeatmapData();
  }, [dateRange, viewMode]);

  useEffect(() => {
    if (data.length > 0 && svgRef.current) {
      renderHeatmap();
    }
  }, [data]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }
      params.append('viewMode', viewMode);

      const response = await apiService.get(`/analytics/heatmap?${params}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
      setError('Unable to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const renderHeatmap = () => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data based on view mode
    let processedData: any[];
    let xLabels: string[];
    let yLabels: string[];

    if (viewMode === 'week') {
      // Group by day of week and hour
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      xLabels = dayNames;
      yLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

      processedData = data.reduce((acc, item) => {
        const dayIndex = new Date(item.day).getDay();
        const key = `${dayIndex}-${item.hour}`;
        if (!acc[key]) {
          acc[key] = {
            x: dayIndex,
            y: item.hour,
            value: 0,
            count: 0,
            emotions: {}
          };
        }
        acc[key].value += item.intensity;
        acc[key].count += item.count;
        acc[key].emotions[item.emotion] = (acc[key].emotions[item.emotion] || 0) + item.count;
        return acc;
      }, {});
    } else {
      // Group by week and day of month
      const weeks = Array.from({ length: 5 }, (_, i) => `Week ${i + 1}`);
      const days = Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`);
      xLabels = days;
      yLabels = weeks;

      processedData = data.reduce((acc, item) => {
        const date = new Date(item.day);
        const weekOfMonth = Math.floor(date.getDate() / 7);
        const dayOfWeek = date.getDay();
        const key = `${weekOfMonth}-${dayOfWeek}`;
        if (!acc[key]) {
          acc[key] = {
            x: dayOfWeek,
            y: weekOfMonth,
            value: 0,
            count: 0,
            emotions: {}
          };
        }
        acc[key].value += item.intensity;
        acc[key].count += item.count;
        acc[key].emotions[item.emotion] = (acc[key].emotions[item.emotion] || 0) + item.count;
        return acc;
      }, {});
    }

    const values = Object.values(processedData).map((d: any) => d.value / d.count);
    const maxValue = d3.max(values) || 1;
    const minValue = d3.min(values) || 0;

    // Color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateRdYlGn)
      .domain([maxValue, minValue]); // Reverse for green = positive

    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(xLabels)
      .padding(0.05);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Y axis
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(yLabels)
      .padding(0.05);

    svg.append('g')
      .call(d3.axisLeft(y));

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'heatmap-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    // Draw rectangles
    svg.selectAll()
      .data(Object.values(processedData))
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(xLabels[d.x])!)
      .attr('y', (d: any) => y(yLabels[d.y])!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d: any) => {
        const avgValue = d.value / d.count;
        return colorScale(avgValue);
      })
      .style('stroke', 'white')
      .style('stroke-width', 1)
      .on('mouseover', function(event, d: any) {
        const avgValue = d.value / d.count;
        const dominantEmotion = Object.keys(d.emotions).reduce((a, b) =>
          d.emotions[a] > d.emotions[b] ? a : b, 'neutral'
        );

        tooltip
          .style('visibility', 'visible')
          .html(`
            <div><strong>${xLabels[d.x]}, ${yLabels[d.y]}</strong></div>
            <div>Avg Intensity: ${avgValue.toFixed(2)}</div>
            <div>Dominant: ${dominantEmotion}</div>
            <div>Total Check-ins: ${d.count}</div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
      });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Emotional Intensity Heatmap - ${viewMode === 'week' ? 'Weekly' : 'Monthly'} View`);

    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;

    const legend = svg.append('g')
      .attr('transform', `translate(${width - legendWidth}, -30)`);

    const legendScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));

    // Legend gradient
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linearGradient.selectAll('stop')
      .data(d3.range(0, 1.01, 0.01))
      .enter().append('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => colorScale(minValue + d * (maxValue - minValue)));

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis);

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Emotional Intensity');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Generating heatmap...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Heatmap Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Emotional Intensity Heatmap
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visual overview of emotional patterns over time
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Weekly
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <svg ref={svgRef} className="w-full h-auto"></svg>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>High positive intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Neutral intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>High negative intensity</span>
            </div>
          </div>
          <p className="mt-2">
            Hover over cells to see detailed information. Darker colors indicate higher emotional intensity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmotionHeatmap;
