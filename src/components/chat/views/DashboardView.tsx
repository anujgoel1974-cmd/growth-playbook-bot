import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { HistoricalBenchmark } from '@/components/dashboard/HistoricalBenchmark';
import { MetricsSummary } from '@/components/dashboard/MetricsSummary';
import { DynamicChartDisplay } from '@/components/dashboard/DynamicChartDisplay';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useDashboardChartState } from '@/hooks/useDashboardChartState';
import { VisualCanvasData } from '@/types/visual-canvas';

interface DashboardViewProps {
  data?: VisualCanvasData;
}

export function DashboardView({ data }: DashboardViewProps) {
  const { dailyMetrics, aggregateMetrics } = useDashboardMetrics();
  const { currentChart, setCurrentChart, clearChart } = useDashboardChartState();
  const userRole = localStorage.getItem("userRole") || "Other";
  
  return (
    <div className="p-6 space-y-6">
      <MetricsCards metrics={aggregateMetrics} />
      <HistoricalBenchmark currentMetrics={aggregateMetrics} />
      <MetricsSummary aggregateMetrics={aggregateMetrics} userRole={userRole} />
      <DynamicChartDisplay
        currentChart={currentChart}
        onClear={clearChart}
        dailyMetrics={dailyMetrics}
        aggregateMetrics={aggregateMetrics}
      />
    </div>
  );
}
