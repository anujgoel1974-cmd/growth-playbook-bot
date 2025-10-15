import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

export default function Dashboard() {
  const { dailyMetrics, aggregateMetrics } = useDashboardMetrics();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Metrics Cards */}
        <MetricsCards metrics={aggregateMetrics} />
        
        {/* Charts Section */}
        <ChartsSection
          dailyMetrics={dailyMetrics}
          aggregateMetrics={aggregateMetrics}
        />
        
        {/* AI Chatbot */}
        <div className="mt-8">
          <ChatInterface aggregateMetrics={aggregateMetrics} />
        </div>
      </main>
    </div>
  );
}
