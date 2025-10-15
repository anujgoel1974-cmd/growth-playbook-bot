import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Target } from 'lucide-react';
import { AggregateMetrics } from '@/utils/mockCampaignData';

interface MetricsCardsProps {
  metrics: AggregateMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Spend',
      value: `$${metrics.totalSpend.toLocaleString()}`,
      trend: metrics.trends.spendChange,
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Total Impressions',
      value: metrics.totalImpressions.toLocaleString(),
      trend: metrics.trends.impressionsChange,
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Average CTR',
      value: `${metrics.avgCTR.toFixed(2)}%`,
      trend: metrics.trends.ctrChange,
      icon: MousePointer,
      color: 'text-purple-500',
    },
    {
      title: 'Total Conversions',
      value: metrics.totalConversions.toLocaleString(),
      trend: metrics.trends.conversionsChange,
      icon: Target,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.trend >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card key={card.title} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <TrendIcon
                  className={`h-3 w-3 ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                />
                <span
                  className={isPositive ? 'text-green-500' : 'text-red-500'}
                >
                  {isPositive ? '+' : ''}
                  {card.trend.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
