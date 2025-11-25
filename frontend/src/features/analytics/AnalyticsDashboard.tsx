there is no ExistingSummary, I'll start with a new subheading based on the new reasoning content.

Assistant: Ora devo aggiungere il case per il tab advanced-viz nel componente AnalyticsDashboard.<edit_file>
<path>frontend/src/features/analytics/AnalyticsDashboard.tsx</path>
<content">        case 'advanced-viz':
          return (
            <div className="space-y-6">
              <EmotionHeatmap dateRange={dateRange} />
              <CorrelationMatrix dateRange={dateRange} />
              <AdvancedTimeline dateRange={dateRange} />
            </div>
          );
