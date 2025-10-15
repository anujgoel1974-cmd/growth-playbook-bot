import { useMemo } from 'react';
import { generateMockCampaignData } from '@/utils/mockCampaignData';

export function useDashboardMetrics() {
  const connectedPlatforms = useMemo(() => {
    const stored = localStorage.getItem('connectedPlatforms');
    if (!stored) return ['google', 'meta', 'tiktok'];
    
    const platforms = JSON.parse(stored);
    return Object.keys(platforms).filter((key) => platforms[key]);
  }, []);
  
  const { dailyMetrics, aggregateMetrics } = useMemo(
    () => generateMockCampaignData(connectedPlatforms),
    [connectedPlatforms]
  );
  
  return {
    connectedPlatforms,
    dailyMetrics,
    aggregateMetrics,
  };
}
