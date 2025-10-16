import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles } from 'lucide-react';
import { DynamicChart } from './DynamicChart';
import { ChartConfig } from '@/types/chart';
import { ChartsSection } from './ChartsSection';
import { DailyMetric, AggregateMetrics } from '@/utils/mockCampaignData';

interface DynamicChartDisplayProps {
  currentChart: ChartConfig | null;
  onClear: () => void;
  dailyMetrics: DailyMetric[];
  aggregateMetrics: AggregateMetrics;
}

export function DynamicChartDisplay({
  currentChart,
  onClear,
  dailyMetrics,
  aggregateMetrics,
}: DynamicChartDisplayProps) {
  if (!currentChart) {
    // Show default static charts when no AI chart is active
    return <ChartsSection dailyMetrics={dailyMetrics} aggregateMetrics={aggregateMetrics} />;
  }

  // Show AI-generated chart prominently
  return (
    <Card className="animate-fade-in border-primary/30 shadow-lg relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">{currentChart.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Clear chart and return to default view"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <DynamicChart config={currentChart} />
      </CardContent>
    </Card>
  );
}
