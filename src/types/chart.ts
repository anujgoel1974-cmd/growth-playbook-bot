export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'funnel' | 'comparison';

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: ChartDataPoint[];
  xAxis?: string;
  yAxis?: string;
  metrics?: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}
