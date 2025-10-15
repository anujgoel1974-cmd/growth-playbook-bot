interface DailyMetric {
  date: string;
  platform: 'google' | 'meta' | 'bing' | 'tiktok' | 'linkedin' | 'pinterest';
  
  // Core Performance Metrics
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  conversionRate: number;
  
  // Extended Performance Metrics
  views: number;
  videoViews: number;
  videoCompletionRate: number;
  engagements: number;
  shares: number;
  comments: number;
  likes: number;
  saves: number;
  
  // Cost & Revenue Metrics
  revenue: number;
  profit: number;
  roas: number;
  roi: number;
  cpm: number;
  cpe: number;
  cplv: number;
  averageOrderValue: number;
  totalOrderValue: number;
  
  // Conversion Funnel Metrics
  landingPageViews: number;
  landingPageViewRate: number;
  addToCart: number;
  addToCartRate: number;
  initiateCheckout: number;
  initiateCheckoutRate: number;
  purchaseRate: number;
  bounceRate: number;
  exitRate: number;
  timeOnSite: number;
  
  // Audience & Demographics
  uniqueReach: number;
  frequency: number;
  newUsers: number;
  returningUsers: number;
  mobileImpressions: number;
  desktopImpressions: number;
  tabletImpressions: number;
  mobileConversions: number;
  desktopConversions: number;
  deviceConversionRate: number;
  
  // Quality & Performance Indicators
  qualityScore: number;
  relevanceScore: number;
  adStrength: 'poor' | 'average' | 'good' | 'excellent';
  impressionShare: number;
  lostImpressionShareBudget: number;
  lostImpressionShareRank: number;
  positionAboveRate: number;
  
  // Creative Performance
  videoWatchTime: number;
  videoPercentage25: number;
  videoPercentage50: number;
  videoPercentage75: number;
  videoPercentage100: number;
  thumbnailClickRate: number;
  outboundClicks: number;
  linkClicks: number;
  socialEngagementRate: number;
  
  // Bid & Auction Metrics
  avgBid: number;
  maxBid: number;
  minBid: number;
  avgPosition: number;
  topImpressionRate: number;
  absoluteTopImpressionRate: number;
  auctionCompetitiveness: number;
  
  // Time-Based Metrics
  hourOfDay: number;
  dayOfWeek: number;
  peakPerformanceTime: boolean;
  avgTimeToConversion: number;
  
  // Attribution Metrics
  viewThroughConversions: number;
  clickThroughConversions: number;
  assistedConversions: number;
  
  // Campaign Health Indicators
  budgetUtilization: number;
  accountHealth: number;
}

interface AggregateMetrics {
  // Core Aggregates
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCTR: number;
  avgCPC: number;
  avgCPA: number;
  conversionRate: number;
  
  // Revenue Aggregates
  totalRevenue: number;
  totalProfit: number;
  avgROAS: number;
  avgROI: number;
  avgOrderValue: number;
  
  // Funnel Aggregates
  totalLandingPageViews: number;
  totalAddToCart: number;
  totalInitiateCheckout: number;
  avgBounceRate: number;
  avgTimeOnSite: number;
  
  // Audience Aggregates
  totalUniqueReach: number;
  avgFrequency: number;
  mobileShareOfConversions: number;
  desktopShareOfConversions: number;
  
  // Quality Aggregates
  avgQualityScore: number;
  avgRelevanceScore: number;
  avgImpressionShare: number;
  
  // Video Performance
  avgVideoCompletionRate: number;
  totalVideoViews: number;
  
  // Engagement
  totalEngagements: number;
  avgEngagementRate: number;
  
  trends: {
    spendChange: number;
    impressionsChange: number;
    ctrChange: number;
    conversionsChange: number;
    revenueChange: number;
    roasChange: number;
    qualityScoreChange: number;
  };
  platformBreakdown: {
    platform: string;
    spend: number;
    ctr: number;
    conversions: number;
    cpa: number;
    revenue: number;
    roas: number;
    qualityScore: number;
    impressionShare: number;
  }[];
  
  // Device Breakdown
  deviceBreakdown: {
    device: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  }[];
  
  // Funnel Analysis
  funnelAnalysis: {
    stage: string;
    count: number;
    dropOffRate: number;
  }[];
}

const platformConfigs = {
  google: {
    name: 'Google Ads',
    baseSpend: 87.5,
    budgetShare: 0.30,
    cpcRange: [2, 4],
    ctrRange: [2.5, 3.1],
    qualityScoreRange: [6, 9],
    relevanceScoreRange: [6, 9],
    avgPositionRange: [1.5, 3.5],
    impressionShareRange: [45, 75],
    mobileShare: 0.65,
    videoCompletionRange: [55, 75],
    bounceRateRange: [35, 55],
    avgOrderValueRange: [45, 85],
    engagementRateRange: [1.5, 2.5],
    videoViewRate: 0.7,
    avgTimeOnSiteRange: [120, 300],
    weekendMultiplier: 0.7,
  },
  meta: {
    name: 'Meta',
    baseSpend: 72.9,
    budgetShare: 0.25,
    cpcRange: [1, 2],
    ctrRange: [1.7, 2.1],
    qualityScoreRange: [5, 8],
    relevanceScoreRange: [5, 8],
    avgPositionRange: [1, 1],
    impressionShareRange: [35, 65],
    mobileShare: 0.85,
    videoCompletionRange: [45, 65],
    bounceRateRange: [45, 65],
    avgOrderValueRange: [35, 70],
    engagementRateRange: [3.5, 6.5],
    videoViewRate: 0.8,
    avgTimeOnSiteRange: [90, 240],
    weekendMultiplier: 1.2,
  },
  bing: {
    name: 'Bing',
    baseSpend: 29.2,
    budgetShare: 0.10,
    cpcRange: [1.5, 3],
    ctrRange: [1.6, 2.0],
    qualityScoreRange: [5, 8],
    relevanceScoreRange: [5, 8],
    avgPositionRange: [2, 4],
    impressionShareRange: [30, 55],
    mobileShare: 0.55,
    videoCompletionRange: [50, 70],
    bounceRateRange: [40, 60],
    avgOrderValueRange: [40, 75],
    engagementRateRange: [1.2, 2.0],
    videoViewRate: 0.65,
    avgTimeOnSiteRange: [110, 280],
    weekendMultiplier: 0.8,
  },
  tiktok: {
    name: 'TikTok',
    baseSpend: 43.7,
    budgetShare: 0.15,
    cpcRange: [0.5, 1.5],
    ctrRange: [2.2, 2.6],
    qualityScoreRange: [6, 9],
    relevanceScoreRange: [7, 9],
    avgPositionRange: [1, 1],
    impressionShareRange: [40, 70],
    mobileShare: 0.98,
    videoCompletionRange: [65, 85],
    bounceRateRange: [50, 70],
    avgOrderValueRange: [25, 55],
    engagementRateRange: [6, 12],
    videoViewRate: 0.9,
    avgTimeOnSiteRange: [60, 180],
    weekendMultiplier: 1.3,
  },
  linkedin: {
    name: 'LinkedIn',
    baseSpend: 43.7,
    budgetShare: 0.15,
    cpcRange: [4, 8],
    ctrRange: [1.3, 1.7],
    qualityScoreRange: [6, 9],
    relevanceScoreRange: [6, 8],
    avgPositionRange: [1.5, 3],
    impressionShareRange: [35, 60],
    mobileShare: 0.60,
    videoCompletionRange: [50, 70],
    bounceRateRange: [35, 50],
    avgOrderValueRange: [80, 150],
    engagementRateRange: [0.8, 1.5],
    videoViewRate: 0.6,
    avgTimeOnSiteRange: [150, 350],
    weekendMultiplier: 0.5,
  },
  pinterest: {
    name: 'Pinterest',
    baseSpend: 14.6,
    budgetShare: 0.05,
    cpcRange: [0.8, 2],
    ctrRange: [1.9, 2.3],
    qualityScoreRange: [5, 8],
    relevanceScoreRange: [6, 8],
    avgPositionRange: [1, 2],
    impressionShareRange: [30, 55],
    mobileShare: 0.80,
    videoCompletionRange: [55, 75],
    bounceRateRange: [40, 60],
    avgOrderValueRange: [30, 65],
    engagementRateRange: [2.5, 5.0],
    videoViewRate: 0.75,
    avgTimeOnSiteRange: [100, 250],
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

function getAdStrength(qualityScore: number): 'poor' | 'average' | 'good' | 'excellent' {
  if (qualityScore >= 8) return 'excellent';
  if (qualityScore >= 6.5) return 'good';
  if (qualityScore >= 5) return 'average';
  return 'poor';
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
  
  // Calculate core metrics
  const ctr = getRandomInRange(config.ctrRange[0], config.ctrRange[1]);
  const cpc = getRandomInRange(config.cpcRange[0], config.cpcRange[1]);
  const impressions = Math.round(spend / cpc * (100 / ctr) * 100);
  const clicks = Math.round(impressions * (ctr / 100));
  
  // Conversion funnel
  const landingPageViews = Math.round(clicks * getRandomInRange(0.85, 0.95));
  const landingPageViewRate = (landingPageViews / clicks) * 100;
  const addToCart = Math.round(landingPageViews * getRandomInRange(0.08, 0.18));
  const addToCartRate = (addToCart / landingPageViews) * 100;
  const initiateCheckout = Math.round(addToCart * getRandomInRange(0.5, 0.7));
  const initiateCheckoutRate = (initiateCheckout / addToCart) * 100;
  const conversions = Math.round(initiateCheckout * getRandomInRange(0.4, 0.6));
  const conversionRate = (conversions / clicks) * 100;
  const purchaseRate = (conversions / landingPageViews) * 100;
  
  // Revenue metrics
  const averageOrderValue = getRandomInRange(config.avgOrderValueRange[0], config.avgOrderValueRange[1]);
  const revenue = conversions * averageOrderValue;
  const totalOrderValue = revenue;
  const profit = revenue - spend;
  const roas = conversions > 0 ? revenue / spend : 0;
  const roi = conversions > 0 ? ((revenue - spend) / spend) * 100 : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  const cpm = (spend / impressions) * 1000;
  
  // Engagement metrics
  const engagementRate = getRandomInRange(config.engagementRateRange[0], config.engagementRateRange[1]);
  const engagements = Math.round(impressions * (engagementRate / 100));
  const likes = Math.round(engagements * 0.5);
  const shares = Math.round(engagements * 0.2);
  const comments = Math.round(engagements * 0.15);
  const saves = Math.round(engagements * 0.15);
  const cpe = engagements > 0 ? spend / engagements : 0;
  const socialEngagementRate = (engagements / impressions) * 100;
  
  // Video metrics
  const videoViews = Math.round(impressions * config.videoViewRate);
  const videoCompletionRate = getRandomInRange(config.videoCompletionRange[0], config.videoCompletionRange[1]);
  const videoWatchTime = Math.round(videoViews * getRandomInRange(15, 45));
  const videoPercentage25 = Math.round(videoViews * 0.8);
  const videoPercentage50 = Math.round(videoViews * 0.6);
  const videoPercentage75 = Math.round(videoViews * 0.4);
  const videoPercentage100 = Math.round(videoViews * (videoCompletionRate / 100));
  const thumbnailClickRate = getRandomInRange(2, 8);
  
  // Device breakdown
  const mobileImpressions = Math.round(impressions * config.mobileShare);
  const desktopImpressions = Math.round(impressions * (1 - config.mobileShare) * 0.8);
  const tabletImpressions = impressions - mobileImpressions - desktopImpressions;
  const mobileConversions = Math.round(conversions * (config.mobileShare * 0.7));
  const desktopConversions = conversions - mobileConversions;
  const deviceConversionRate = desktopImpressions > 0 ? (desktopConversions / desktopImpressions) * 100 : 0;
  
  // Audience metrics
  const uniqueReach = Math.round(impressions * getRandomInRange(0.6, 0.85));
  const frequency = impressions / uniqueReach;
  const newUsers = Math.round(clicks * getRandomInRange(0.6, 0.8));
  const returningUsers = clicks - newUsers;
  
  // Quality metrics
  const qualityScore = getRandomInRange(config.qualityScoreRange[0], config.qualityScoreRange[1]);
  const relevanceScore = getRandomInRange(config.relevanceScoreRange[0], config.relevanceScoreRange[1]);
  const adStrength = getAdStrength(qualityScore);
  const impressionShare = getRandomInRange(config.impressionShareRange[0], config.impressionShareRange[1]);
  const lostImpressionShareBudget = getRandomInRange(10, 35);
  const lostImpressionShareRank = 100 - impressionShare - lostImpressionShareBudget;
  const positionAboveRate = platform === 'google' || platform === 'bing' ? getRandomInRange(40, 80) : 0;
  
  // Site metrics
  const bounceRate = getRandomInRange(config.bounceRateRange[0], config.bounceRateRange[1]);
  const exitRate = bounceRate + getRandomInRange(-10, 10);
  const timeOnSite = Math.round(getRandomInRange(config.avgTimeOnSiteRange[0], config.avgTimeOnSiteRange[1]));
  const cplv = landingPageViews > 0 ? spend / landingPageViews : 0;
  
  // Link metrics
  const linkClicks = Math.round(clicks * getRandomInRange(0.8, 0.95));
  const outboundClicks = linkClicks;
  
  // Bid & Auction
  const avgBid = cpc * getRandomInRange(0.9, 1.1);
  const maxBid = avgBid * getRandomInRange(1.5, 2.5);
  const minBid = avgBid * getRandomInRange(0.4, 0.7);
  const avgPosition = getRandomInRange(config.avgPositionRange[0], config.avgPositionRange[1]);
  const topImpressionRate = platform === 'google' || platform === 'bing' ? getRandomInRange(30, 70) : 0;
  const absoluteTopImpressionRate = topImpressionRate * getRandomInRange(0.3, 0.6);
  const auctionCompetitiveness = getRandomInRange(4, 9);
  
  // Time metrics
  const hourOfDay = date.getHours();
  const dayOfWeek = date.getDay();
  const peakPerformanceTime = isPeakDay;
  const avgTimeToConversion = getRandomInRange(2, 72);
  
  // Attribution
  const viewThroughConversions = Math.round(conversions * getRandomInRange(0.1, 0.25));
  const clickThroughConversions = conversions - viewThroughConversions;
  const assistedConversions = Math.round(conversions * getRandomInRange(0.15, 0.35));
  
  // Campaign health
  const budgetUtilization = getRandomInRange(70, 100);
  const accountHealth = getRandomInRange(6, 10);
  
  return {
    date: date.toISOString().split('T')[0],
    platform,
    
    // Core Performance
    spend: Math.round(spend * 100) / 100,
    impressions,
    clicks,
    conversions,
    ctr: Math.round(ctr * 100) / 100,
    cpc: Math.round(cpc * 100) / 100,
    cpa: Math.round(cpa * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
    
    // Extended Performance
    views: impressions,
    videoViews,
    videoCompletionRate: Math.round(videoCompletionRate * 100) / 100,
    engagements,
    shares,
    comments,
    likes,
    saves,
    
    // Revenue
    revenue: Math.round(revenue * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    cpm: Math.round(cpm * 100) / 100,
    cpe: Math.round(cpe * 100) / 100,
    cplv: Math.round(cplv * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    totalOrderValue: Math.round(totalOrderValue * 100) / 100,
    
    // Funnel
    landingPageViews,
    landingPageViewRate: Math.round(landingPageViewRate * 100) / 100,
    addToCart,
    addToCartRate: Math.round(addToCartRate * 100) / 100,
    initiateCheckout,
    initiateCheckoutRate: Math.round(initiateCheckoutRate * 100) / 100,
    purchaseRate: Math.round(purchaseRate * 100) / 100,
    bounceRate: Math.round(bounceRate * 100) / 100,
    exitRate: Math.round(exitRate * 100) / 100,
    timeOnSite,
    
    // Audience
    uniqueReach,
    frequency: Math.round(frequency * 100) / 100,
    newUsers,
    returningUsers,
    mobileImpressions,
    desktopImpressions,
    tabletImpressions,
    mobileConversions,
    desktopConversions,
    deviceConversionRate: Math.round(deviceConversionRate * 100) / 100,
    
    // Quality
    qualityScore: Math.round(qualityScore * 10) / 10,
    relevanceScore: Math.round(relevanceScore * 10) / 10,
    adStrength,
    impressionShare: Math.round(impressionShare * 100) / 100,
    lostImpressionShareBudget: Math.round(lostImpressionShareBudget * 100) / 100,
    lostImpressionShareRank: Math.round(lostImpressionShareRank * 100) / 100,
    positionAboveRate: Math.round(positionAboveRate * 100) / 100,
    
    // Creative
    videoWatchTime,
    videoPercentage25,
    videoPercentage50,
    videoPercentage75,
    videoPercentage100,
    thumbnailClickRate: Math.round(thumbnailClickRate * 100) / 100,
    outboundClicks,
    linkClicks,
    socialEngagementRate: Math.round(socialEngagementRate * 100) / 100,
    
    // Bid & Auction
    avgBid: Math.round(avgBid * 100) / 100,
    maxBid: Math.round(maxBid * 100) / 100,
    minBid: Math.round(minBid * 100) / 100,
    avgPosition: Math.round(avgPosition * 10) / 10,
    topImpressionRate: Math.round(topImpressionRate * 100) / 100,
    absoluteTopImpressionRate: Math.round(absoluteTopImpressionRate * 100) / 100,
    auctionCompetitiveness: Math.round(auctionCompetitiveness * 10) / 10,
    
    // Time
    hourOfDay,
    dayOfWeek,
    peakPerformanceTime,
    avgTimeToConversion: Math.round(avgTimeToConversion * 100) / 100,
    
    // Attribution
    viewThroughConversions,
    clickThroughConversions,
    assistedConversions,
    
    // Health
    budgetUtilization: Math.round(budgetUtilization * 100) / 100,
    accountHealth: Math.round(accountHealth * 10) / 10,
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
  const totalRevenue = dailyMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalProfit = dailyMetrics.reduce((sum, m) => sum + m.profit, 0);
  const totalLandingPageViews = dailyMetrics.reduce((sum, m) => sum + m.landingPageViews, 0);
  const totalAddToCart = dailyMetrics.reduce((sum, m) => sum + m.addToCart, 0);
  const totalInitiateCheckout = dailyMetrics.reduce((sum, m) => sum + m.initiateCheckout, 0);
  const totalEngagements = dailyMetrics.reduce((sum, m) => sum + m.engagements, 0);
  const totalVideoViews = dailyMetrics.reduce((sum, m) => sum + m.videoViews, 0);
  const totalUniqueReach = dailyMetrics.reduce((sum, m) => sum + m.uniqueReach, 0);
  const totalMobileConversions = dailyMetrics.reduce((sum, m) => sum + m.mobileConversions, 0);
  const totalDesktopConversions = dailyMetrics.reduce((sum, m) => sum + m.desktopConversions, 0);
  
  const avgCTR = (totalClicks / totalImpressions) * 100;
  const avgCPC = totalSpend / totalClicks;
  const avgCPA = totalSpend / totalConversions;
  const conversionRate = (totalConversions / totalClicks) * 100;
  const avgROAS = totalRevenue / totalSpend;
  const avgROI = ((totalRevenue - totalSpend) / totalSpend) * 100;
  const avgOrderValue = totalRevenue / totalConversions;
  const avgBounceRate = dailyMetrics.reduce((sum, m) => sum + m.bounceRate, 0) / dailyMetrics.length;
  const avgTimeOnSite = Math.round(dailyMetrics.reduce((sum, m) => sum + m.timeOnSite, 0) / dailyMetrics.length);
  const avgFrequency = dailyMetrics.reduce((sum, m) => sum + m.frequency, 0) / dailyMetrics.length;
  const mobileShareOfConversions = (totalMobileConversions / totalConversions) * 100;
  const desktopShareOfConversions = (totalDesktopConversions / totalConversions) * 100;
  const avgQualityScore = dailyMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / dailyMetrics.length;
  const avgRelevanceScore = dailyMetrics.reduce((sum, m) => sum + m.relevanceScore, 0) / dailyMetrics.length;
  const avgImpressionShare = dailyMetrics.reduce((sum, m) => sum + m.impressionShare, 0) / dailyMetrics.length;
  const avgVideoCompletionRate = dailyMetrics.reduce((sum, m) => sum + m.videoCompletionRate, 0) / dailyMetrics.length;
  const avgEngagementRate = (totalEngagements / totalImpressions) * 100;
  
  // Calculate platform breakdown
  const platformBreakdown = connectedPlatforms.map((platform) => {
    const platformMetrics = dailyMetrics.filter((m) => m.platform === platform);
    const platformSpend = platformMetrics.reduce((sum, m) => sum + m.spend, 0);
    const platformClicks = platformMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const platformImpressions = platformMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const platformConversions = platformMetrics.reduce((sum, m) => sum + m.conversions, 0);
    const platformRevenue = platformMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const platformCTR = (platformClicks / platformImpressions) * 100;
    const platformCPA = platformSpend / platformConversions;
    const platformROAS = platformRevenue / platformSpend;
    const platformQualityScore = platformMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / platformMetrics.length;
    const platformImpressionShare = platformMetrics.reduce((sum, m) => sum + m.impressionShare, 0) / platformMetrics.length;
    
    return {
      platform: platformConfigs[platform as keyof typeof platformConfigs]?.name || platform,
      spend: Math.round(platformSpend * 100) / 100,
      ctr: Math.round(platformCTR * 100) / 100,
      conversions: platformConversions,
      cpa: Math.round(platformCPA * 100) / 100,
      revenue: Math.round(platformRevenue * 100) / 100,
      roas: Math.round(platformROAS * 100) / 100,
      qualityScore: Math.round(platformQualityScore * 10) / 10,
      impressionShare: Math.round(platformImpressionShare * 100) / 100,
    };
  });
  
  // Device breakdown
  const deviceBreakdown = [
    {
      device: 'Mobile',
      impressions: dailyMetrics.reduce((sum, m) => sum + m.mobileImpressions, 0),
      conversions: totalMobileConversions,
      conversionRate: mobileShareOfConversions,
    },
    {
      device: 'Desktop',
      impressions: dailyMetrics.reduce((sum, m) => sum + m.desktopImpressions, 0),
      conversions: totalDesktopConversions,
      conversionRate: desktopShareOfConversions,
    },
    {
      device: 'Tablet',
      impressions: dailyMetrics.reduce((sum, m) => sum + m.tabletImpressions, 0),
      conversions: totalConversions - totalMobileConversions - totalDesktopConversions,
      conversionRate: 100 - mobileShareOfConversions - desktopShareOfConversions,
    },
  ];
  
  // Funnel analysis
  const funnelAnalysis = [
    {
      stage: 'Clicks',
      count: totalClicks,
      dropOffRate: 0,
    },
    {
      stage: 'Landing Page Views',
      count: totalLandingPageViews,
      dropOffRate: ((totalClicks - totalLandingPageViews) / totalClicks) * 100,
    },
    {
      stage: 'Add to Cart',
      count: totalAddToCart,
      dropOffRate: ((totalLandingPageViews - totalAddToCart) / totalLandingPageViews) * 100,
    },
    {
      stage: 'Initiate Checkout',
      count: totalInitiateCheckout,
      dropOffRate: ((totalAddToCart - totalInitiateCheckout) / totalAddToCart) * 100,
    },
    {
      stage: 'Purchase',
      count: totalConversions,
      dropOffRate: ((totalInitiateCheckout - totalConversions) / totalInitiateCheckout) * 100,
    },
  ];
  
  const aggregateMetrics: AggregateMetrics = {
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalImpressions,
    totalClicks,
    totalConversions,
    avgCTR: Math.round(avgCTR * 100) / 100,
    avgCPC: Math.round(avgCPC * 100) / 100,
    avgCPA: Math.round(avgCPA * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    avgROAS: Math.round(avgROAS * 100) / 100,
    avgROI: Math.round(avgROI * 100) / 100,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    totalLandingPageViews,
    totalAddToCart,
    totalInitiateCheckout,
    avgBounceRate: Math.round(avgBounceRate * 100) / 100,
    avgTimeOnSite,
    totalUniqueReach,
    avgFrequency: Math.round(avgFrequency * 100) / 100,
    mobileShareOfConversions: Math.round(mobileShareOfConversions * 100) / 100,
    desktopShareOfConversions: Math.round(desktopShareOfConversions * 100) / 100,
    avgQualityScore: Math.round(avgQualityScore * 10) / 10,
    avgRelevanceScore: Math.round(avgRelevanceScore * 10) / 10,
    avgImpressionShare: Math.round(avgImpressionShare * 100) / 100,
    avgVideoCompletionRate: Math.round(avgVideoCompletionRate * 100) / 100,
    totalVideoViews,
    totalEngagements,
    avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
    trends: {
      spendChange: 12.5,
      impressionsChange: 8.3,
      ctrChange: -0.5,
      conversionsChange: 15.2,
      revenueChange: 18.7,
      roasChange: 5.3,
      qualityScoreChange: 0.8,
    },
    platformBreakdown,
    deviceBreakdown,
    funnelAnalysis,
  };
  
  return { dailyMetrics, aggregateMetrics };
}

export type { DailyMetric, AggregateMetrics };
