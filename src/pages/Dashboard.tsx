import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { DynamicChartDisplay } from '@/components/dashboard/DynamicChartDisplay';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useDashboardChartState } from '@/hooks/useDashboardChartState';

export default function Dashboard() {
  const { dailyMetrics, aggregateMetrics } = useDashboardMetrics();
  const { currentChart, setCurrentChart, clearChart } = useDashboardChartState();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Campaign Analytics</h1>
          <p className="text-muted-foreground">Monitor and optimize your campaign performance</p>
        </div>
        {/* Metrics Cards */}
        <MetricsCards metrics={aggregateMetrics} />
        
        {/* Dynamic Chart Display - Shows AI-generated charts or defaults */}
        <DynamicChartDisplay
          currentChart={currentChart}
          onClear={clearChart}
          dailyMetrics={dailyMetrics}
          aggregateMetrics={aggregateMetrics}
        />
        
        {/* AI Chatbot */}
        <div className="mt-8">
          <ChatInterface 
            aggregateMetrics={aggregateMetrics}
            onChartGenerated={setCurrentChart}
          />
        </div>
      </main>
    </div>
  );
}
