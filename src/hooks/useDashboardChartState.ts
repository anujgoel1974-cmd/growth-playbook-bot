import { useState } from 'react';
import { ChartConfig } from '@/types/chart';

export function useDashboardChartState() {
  const [currentChart, setCurrentChart] = useState<ChartConfig | null>(null);

  const clearChart = () => {
    setCurrentChart(null);
  };

  return {
    currentChart,
    setCurrentChart,
    clearChart,
  };
}
