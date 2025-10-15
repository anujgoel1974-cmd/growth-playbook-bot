interface DailyMetric {
  date: string;
  platform: 'google' | 'meta' | 'bing' | 'tiktok' | 'linkedin' | 'pinterest';
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  conversionRate: number;
}

interface AggregateMetrics {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCTR: number;
  avgCPC: number;
  avgCPA: number;
  conversionRate: number;
  trends: {
    spendChange: number;
    impressionsChange: number;
    ctrChange: number;
    conversionsChange: number;
  };
  platformBreakdown: {
    platform: string;
    spend: number;
    ctr: number;
    conversions: number;
    cpa: number;
  }[];
}

const platformConfigs = {
  google: {
    name: 'Google Ads',
    baseSpend: 87.5,
    budgetShare: 0.30,
    cpcRange: [2, 4],
    ctrRange: [2.5, 3.1],
    weekendMultiplier: 0.7,
  },
  meta: {
    name: 'Meta',
    baseSpend: 72.9,
    budgetShare: 0.25,
    cpcRange: [1, 2],
    ctrRange: [1.7, 2.1],
    weekendMultiplier: 1.2,
  },
  bing: {
    name: 'Bing',
    baseSpend: 29.2,
    budgetShare: 0.10,
    cpcRange: [1.5, 3],
    ctrRange: [1.6, 2.0],
    weekendMultiplier: 0.8,
  },
  tiktok: {
    name: 'TikTok',
    baseSpend: 43.7,
    budgetShare: 0.15,
    cpcRange: [0.5, 1.5],
    ctrRange: [2.2, 2.6],
    weekendMultiplier: 1.3,
  },
  linkedin: {
    name: 'LinkedIn',
    baseSpend: 43.7,
    budgetShare: 0.15,
    cpcRange: [4, 8],
    ctrRange: [1.3, 1.7],
    weekendMultiplier: 0.5,
  },
  pinterest: {
    name: 'Pinterest',
    baseSpend: 14.6,
    budgetShare: 0.05,
    cpcRange: [0.8, 2],
    ctrRange: [1.9, 2.3],
    weekendMultiplier: 1.4,
  },
};

function getRandomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function generateDailyMetric(
  date: Date,
  platform: keyof typeof platformConfigs,
  isPeakDay: boolean
): DailyMetric {
  const config = platformConfigs[platform];
  
  let spend = config.baseSpend;
  
  // Apply weekend multiplier
  if (isWeekend(date)) {
    spend *= config.weekendMultiplier;
  }
  
  // Apply peak day boost
  if (isPeakDay) {
    spend *= 1.3;
  }
  
  // Add random variation ±15%
  spend *= getRandomInRange(0.85, 1.15);
  
  // Calculate metrics
  const ctr = getRandomInRange(config.ctrRange[0], config.ctrRange[1]);
  const cpc = getRandomInRange(config.cpcRange[0], config.cpcRange[1]);
  const impressions = Math.round(spend / cpc * (100 / ctr) * 100);
  const clicks = Math.round(impressions * (ctr / 100));
  const conversionRate = getRandomInRange(0.8, 2.5);
  const conversions = Math.round(clicks * (conversionRate / 100));
  const cpa = conversions > 0 ? spend / conversions : 0;
  
  return {
    date: date.toISOString().split('T')[0],
    platform,
    spend: Math.round(spend * 100) / 100,
    impressions,
    clicks,
    conversions,
    ctr: Math.round(ctr * 100) / 100,
    cpc: Math.round(cpc * 100) / 100,
    cpa: Math.round(cpa * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}

export function generateMockCampaignData(
  connectedPlatforms: string[]
): { dailyMetrics: DailyMetric[]; aggregateMetrics: AggregateMetrics } {
  const dailyMetrics: DailyMetric[] = [];
  const today = new Date();
  
  // Select 3 random peak days
  const peakDays = new Set([
    Math.floor(Math.random() * 10) + 5,
    Math.floor(Math.random() * 10) + 15,
    Math.floor(Math.random() * 10) + 25,
  ]);
  
  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const isPeakDay = peakDays.has(29 - i);
    
    connectedPlatforms.forEach((platform) => {
      if (platform in platformConfigs) {
        dailyMetrics.push(
          generateDailyMetric(date, platform as keyof typeof platformConfigs, isPeakDay)
        );
      }
    });
  }
  
  // Calculate aggregate metrics
  const totalSpend = dailyMetrics.reduce((sum, m) => sum + m.spend, 0);
  const totalImpressions = dailyMetrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalClicks = dailyMetrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalConversions = dailyMetrics.reduce((sum, m) => sum + m.conversions, 0);
  const avgCTR = (totalClicks / totalImpressions) * 100;
  const avgCPC = totalSpend / totalClicks;
  const avgCPA = totalSpend / totalConversions;
  const conversionRate = (totalConversions / totalClicks) * 100;
  
  // Calculate platform breakdown
  const platformBreakdown = connectedPlatforms.map((platform) => {
    const platformMetrics = dailyMetrics.filter((m) => m.platform === platform);
    const platformSpend = platformMetrics.reduce((sum, m) => sum + m.spend, 0);
    const platformClicks = platformMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const platformImpressions = platformMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const platformConversions = platformMetrics.reduce((sum, m) => sum + m.conversions, 0);
    const platformCTR = (platformClicks / platformImpressions) * 100;
    const platformCPA = platformSpend / platformConversions;
    
    return {
      platform: platformConfigs[platform as keyof typeof platformConfigs]?.name || platform,
      spend: Math.round(platformSpend * 100) / 100,
      ctr: Math.round(platformCTR * 100) / 100,
      conversions: platformConversions,
      cpa: Math.round(platformCPA * 100) / 100,
    };
  });
  
  const aggregateMetrics: AggregateMetrics = {
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalImpressions,
    totalClicks,
    totalConversions,
    avgCTR: Math.round(avgCTR * 100) / 100,
    avgCPC: Math.round(avgCPC * 100) / 100,
    avgCPA: Math.round(avgCPA * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
    trends: {
      spendChange: 12.5,
      impressionsChange: 8.3,
      ctrChange: -0.5,
      conversionsChange: 15.2,
    },
    platformBreakdown,
  };
  
  return { dailyMetrics, aggregateMetrics };
}

export type { DailyMetric, AggregateMetrics };
