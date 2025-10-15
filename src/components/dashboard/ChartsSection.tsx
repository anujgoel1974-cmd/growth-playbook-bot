import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DailyMetric, AggregateMetrics } from '@/utils/mockCampaignData';
import { format, parseISO } from 'date-fns';

interface ChartsSectionProps {
  dailyMetrics: DailyMetric[];
  aggregateMetrics: AggregateMetrics;
}

const PLATFORM_COLORS: Record<string, string> = {
  'Google Ads': 'hsl(var(--primary))',
  'Meta': 'hsl(var(--chart-2))',
  'TikTok': 'hsl(var(--chart-3))',
  'LinkedIn': 'hsl(var(--chart-4))',
  'Bing': 'hsl(var(--chart-5))',
  'Pinterest': 'hsl(var(--destructive))',
};

export function ChartsSection({ dailyMetrics, aggregateMetrics }: ChartsSectionProps) {
  // Aggregate daily metrics by date
  const dailyAggregated = dailyMetrics.reduce((acc, metric) => {
    const existing = acc.find((item) => item.date === metric.date);
    if (existing) {
      existing.spend += metric.spend;
      existing.clicks += metric.clicks;
      existing.conversions += metric.conversions;
    } else {
      acc.push({
        date: metric.date,
        spend: metric.spend,
        clicks: metric.clicks,
        conversions: metric.conversions,
      });
    }
    return acc;
  }, [] as { date: string; spend: number; clicks: number; conversions: number }[]);

  // Format data for line chart
  const lineChartData = dailyAggregated.map((item) => ({
    date: format(parseISO(item.date), 'MMM dd'),
    spend: Math.round(item.spend),
    clicks: item.clicks,
    conversions: item.conversions,
  }));

  // Platform breakdown for bar chart
  const barChartData = aggregateMetrics.platformBreakdown;

  // Pie chart data
  const pieChartData = aggregateMetrics.platformBreakdown.map((item) => ({
    name: item.platform,
    value: item.spend,
  }));

  return (
    <div className="space-y-4">
      {/* Performance Over Time */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Performance Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                fontSize={12}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="spend"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Spend ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="clicks"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Clicks"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="conversions"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channel Performance */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="platform"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  fontSize={11}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="spend" fill="hsl(var(--primary))" name="Spend ($)" />
                <Bar dataKey="conversions" fill="hsl(var(--chart-3))" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Allocation */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PLATFORM_COLORS[entry.name] || 'hsl(var(--muted))'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
