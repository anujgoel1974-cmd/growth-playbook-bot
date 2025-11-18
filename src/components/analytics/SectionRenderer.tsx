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
            <ResponsiveContainer width="100%" height="100%">
              <>
                {section.chartType === 'line' && (
                  <RechartsLine data={section.config.data}>
...
                  </RechartsLine>
                )}
              </>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
