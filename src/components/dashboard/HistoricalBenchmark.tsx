import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, History } from "lucide-react";
import { AggregateMetrics } from "@/utils/mockCampaignData";

interface HistoricalBenchmarkProps {
  currentMetrics: AggregateMetrics;
}

// Mock historical averages - in real implementation, this would come from actual historical data
const historicalAverages = {
  avgROAS: 2.6,
  avgCPA: 45,
  conversionRate: 3.1,
  avgCTR: 2.2
};

export function HistoricalBenchmark({ currentMetrics }: HistoricalBenchmarkProps) {
  const compareMetric = (current: number, historical: number) => {
    const diff = ((current - historical) / historical) * 100;
    const isPositive = diff > 0;
    const isROASorCTR = true; // For ROAS and CTR, higher is better
    const isGood = isPositive === isROASorCTR;
    
    return {
      diff: Math.abs(diff).toFixed(1),
      isPositive,
      isGood,
      color: isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: isGood ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20',
      borderColor: isGood ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
    };
  };

  const roasComparison = compareMetric(currentMetrics.avgROAS, historicalAverages.avgROAS);
  const cpaComparison = compareMetric(historicalAverages.avgCPA, currentMetrics.avgCPA); // Inverted for CPA (lower is better)
  const convRateComparison = compareMetric(currentMetrics.conversionRate, historicalAverages.conversionRate);
  const ctrComparison = compareMetric(currentMetrics.avgCTR, historicalAverages.avgCTR);

  const MetricCard = ({ 
    title, 
    current, 
    historical, 
    comparison, 
    format 
  }: { 
    title: string; 
    current: number; 
    historical: number; 
    comparison: ReturnType<typeof compareMetric>;
    format: (val: number) => string;
  }) => (
    <div className={`p-4 rounded-lg border ${comparison.borderColor} ${comparison.bgColor}`}>
      <div className="text-xs text-muted-foreground mb-2">{title}</div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-2xl font-bold">{format(current)}</div>
          <div className="text-xs text-muted-foreground">Current</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-muted-foreground">{format(historical)}</div>
          <div className="text-xs text-muted-foreground">Historical Avg</div>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${comparison.color}`}>
        {comparison.isGood ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>
          {comparison.isPositive ? '+' : '-'}{comparison.diff}% vs historical
        </span>
      </div>
    </div>
  );

  return (
    <Card className="animate-fade-in border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Historical Performance Benchmark</CardTitle>
            <CardDescription>Compare current campaign vs. past performance</CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto">
            47 campaigns analyzed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="ROAS"
            current={currentMetrics.avgROAS}
            historical={historicalAverages.avgROAS}
            comparison={roasComparison}
            format={(val) => `${val.toFixed(2)}x`}
          />
          <MetricCard
            title="Cost Per Acquisition"
            current={currentMetrics.avgCPA}
            historical={historicalAverages.avgCPA}
            comparison={cpaComparison}
            format={(val) => `$${val.toFixed(0)}`}
          />
          <MetricCard
            title="Conversion Rate"
            current={currentMetrics.conversionRate}
            historical={historicalAverages.conversionRate}
            comparison={convRateComparison}
            format={(val) => `${val.toFixed(2)}%`}
          />
          <MetricCard
            title="Click-Through Rate"
            current={currentMetrics.avgCTR}
            historical={historicalAverages.avgCTR}
            comparison={ctrComparison}
            format={(val) => `${val.toFixed(2)}%`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
