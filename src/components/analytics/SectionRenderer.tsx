import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AnalyticsSectionType } from '@/types/analytics';
import { BarChart3, FileText, LineChart, PieChart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface SectionRendererProps {
  section: AnalyticsSectionType;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted-foreground))'];

export function SectionRenderer({ section }: SectionRendererProps) {
  const getIcon = () => {
    if (section.type === 'text') return <FileText className="h-4 w-4" />;
    if (section.type === 'table') return <BarChart3 className="h-4 w-4" />;
    if (section.type === 'chart') {
      if (section.chartType === 'pie') return <PieChart className="h-4 w-4" />;
      if (section.chartType === 'bar') return <BarChart3 className="h-4 w-4" />;
      return <LineChart className="h-4 w-4" />;
    }
    return <TrendingUp className="h-4 w-4" />;
  };

  if (section.type === 'text') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            {section.title && <CardTitle className="text-base">{section.title}</CardTitle>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {section.body}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (section.type === 'table') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">{section.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {section.columns.map((col, idx) => (
                    <TableHead key={idx}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.rows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <TableCell key={cellIdx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (section.type === 'chart') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">{section.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {section.chartType === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine data={section.config.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey={section.config.xAxis} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {section.config.metrics?.map((metric: string, idx: number) => (
                    <Line 
                      key={metric} 
                      type="monotone" 
                      dataKey={metric} 
                      stroke={COLORS[idx % COLORS.length]} 
                      strokeWidth={2}
                    />
                  ))}
                </RechartsLine>
              </ResponsiveContainer>
            )}
            
            {section.chartType === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={section.config.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey={section.config.xAxis} stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={section.config.metrics?.[0] || 'value'} 
                    fill={COLORS[0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {section.chartType === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={section.config.data}
                    dataKey="value"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {section.config.data.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            )}

            {section.chartType === 'scatter' && (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="spend" name="Spend" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="roas" name="ROAS" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Legend />
                  <Scatter 
                    name="Campaigns" 
                    data={section.config.data} 
                    fill={COLORS[0]}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}

            {section.chartType === 'funnel' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={section.config.data} 
                  layout="horizontal"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="stage" 
                    stroke="hsl(var(--muted-foreground))" 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
