"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Calendar } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'checkin' | 'milestone' | 'alert' | 'improvement';
  title: string;
  description: string;
  sentiment?: number;
  intensity?: number;
  impact: 'low' | 'medium' | 'high';
}

interface AdvancedTimelineProps {
  dateRange?: {
    start: string;
    end: string;
  };
}

const AdvancedTimeline: React.FC<AdvancedTimelineProps> = ({ dateRange }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadTimelineData();
  }, [dateRange]);

  useEffect(() => {
    if (events.length > 0 && svgRef.current) {
      renderTimeline();
    }
  }, [events]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }

      const response = await fetch(`/api/analytics/timeline?${params}`);
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load timeline data:', err);
      setError('Unable to load timeline data');
    } finally {
      setLoading(false);
    }
  };

  const renderTimeline = () => {
    if (!svgRef.current || events.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 20, bottom: 60, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates and sort events
    const parsedEvents = events.map(event => ({
      ...event,
      parsedDate: new Date(event.date)
    })).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    // Create time scale
    const timeExtent = d3.extent(parsedEvents, d => d.parsedDate) as [Date, Date];
    const xScale = d3.scaleTime()
      .domain(timeExtent)
      .range([0, width]);

    // Create Y scale for different event types
    const eventTypes = ['checkin', 'milestone', 'alert', 'improvement'];
    const yScale = d3.scaleBand()
      .domain(eventTypes)
      .range([height, 0])
      .padding(0.1);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(d3.timeDay.every(7)!))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Y axis labels
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .text(function(d) {
        const datum = d as string;
        switch (datum) {
          case 'checkin': return 'Check-ins';
          case 'milestone': return 'Milestones';
          case 'alert': return 'Alerts';
          case 'improvement': return 'Improvements';
          default: return datum;
        }
      });

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'timeline-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '250px');

    // Draw timeline line
    svg.append('line')
      .attr('x1', 0)
      .attr('y1', height / 2)
      .attr('x2', width)
      .attr('y2', height / 2)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    // Draw events
    parsedEvents.forEach((event) => {
      const x = xScale(event.parsedDate);
      const y = yScale(event.type)! + yScale.bandwidth() / 2;

      // Event circle
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', getEventRadius(event))
        .attr('fill', getEventColor(event))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedEvent(event))
        .on('mouseover', function() {
          d3.select(this).attr('r', getEventRadius(event) + 3);

          tooltip
            .style('visibility', 'visible')
            .html(`
              <div class="font-semibold mb-1">${event.title}</div>
              <div class="mb-1">${event.description}</div>
              <div class="text-xs opacity-80">${new Date(event.date).toLocaleDateString()}</div>
              ${event.sentiment ? `<div class="text-xs">Sentiment: ${event.sentiment.toFixed(2)}</div>` : ''}
            `);
        })
        .on('mousemove', function(eventMouse) {
          tooltip
            .style('top', (eventMouse.pageY - 10) + 'px')
            .style('left', (eventMouse.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', getEventRadius(event));
          tooltip.style('visibility', 'hidden');
        });

      // Add event icon
      const iconSize = 12;
      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', `${iconSize}px`)
        .style('fill', 'white')
        .style('pointer-events', 'none')
        .text(getEventIcon(event.type));
    });

    // Add trend line if we have sentiment data
    const sentimentEvents = parsedEvents.filter(e => e.sentiment !== undefined);
    if (sentimentEvents.length > 2) {
      const line = d3.line<{ parsedDate: Date; sentiment: number }>()
        .x(d => xScale(d.parsedDate))
        .y(d => height / 2 - (d.sentiment * 50)) // Scale sentiment to Y position
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(sentimentEvents.map(e => ({ parsedDate: e.parsedDate, sentiment: e.sentiment! })))
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('d', line);
    }

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Emotional Journey Timeline');
  };

  const getEventRadius = (event: TimelineEvent) => {
    switch (event.impact) {
      case 'high': return 12;
      case 'medium': return 8;
      case 'low': return 6;
      default: return 8;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    switch (event.type) {
      case 'checkin':
        return event.sentiment && event.sentiment > 0 ? '#10b981' : '#ef4444';
      case 'milestone': return '#3b82f6';
      case 'alert': return '#f59e0b';
      case 'improvement': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'checkin': return '●';
      case 'milestone': return '🏆';
      case 'alert': return '⚠️';
      case 'improvement': return '📈';
      default: return '●';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading timeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Timeline Unavailable
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
              Emotional Journey Timeline
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Key moments and patterns in your emotional wellness journey
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {events.length} events
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <svg ref={svgRef} className="w-full h-auto min-h-[400px]"></svg>
        </div>

        {/* Event details panel */}
        {selectedEvent && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getEventColor(selectedEvent) === '#10b981' ? 'bg-green-100' :
                getEventColor(selectedEvent) === '#ef4444' ? 'bg-red-100' :
                getEventColor(selectedEvent) === '#3b82f6' ? 'bg-blue-100' :
                getEventColor(selectedEvent) === '#f59e0b' ? 'bg-yellow-100' : 'bg-purple-100'}`}>
                <span className="text-lg">{getEventIcon(selectedEvent.type)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedEvent.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                  {selectedEvent.sentiment && (
                    <span>Sentiment: {selectedEvent.sentiment.toFixed(2)}</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.impact === 'high' ? 'bg-red-100 text-red-800' :
                    selectedEvent.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedEvent.impact} impact
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Positive Check-ins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Negative Check-ins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Milestones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Alerts</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Click on events to see details. Circle size indicates impact level.
        </p>
      </div>
    </div>
  );
};

export default AdvancedTimeline;
