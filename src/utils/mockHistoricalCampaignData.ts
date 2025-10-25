// Generate realistic historical campaign performance data
// Simulates 3-6 months of past campaign learnings

interface HistoricalCampaignData {
  channelPerformance: {
    platform: string;
    averageROAS: number;
    averageCPA: number;
    conversionRate: number;
    clickThroughRate: number;
    performanceScore: number;
    confidenceLevel: 'low' | 'medium' | 'high';
    sampleSize: number;
    bestPerformingCampaignType: string;
  }[];
  
  creativePerformance: {
    winningHooks: string[];
    topPerformingFormats: {
      format: string;
      platform: string;
      avgEngagementRate: number;
      avgConversionRate: number;
    }[];
    provenValueProps: string[];
    effectiveCallsToAction: string[];
    creativeTestInsights: {
      insight: string;
      impact: 'high' | 'medium' | 'low';
    }[];
  };
  
  audienceSegments: {
    segmentName: string;
    demographics: string;
    conversionRate: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    repeatPurchaseRate: number;
    segmentScore: number;
    recommendation: 'primary' | 'secondary' | 'test' | 'avoid';
  }[];
  
  budgetPatterns: {
    channelBudgetAllocation: {
      platform: string;
      optimalBudgetShare: number;
      minEffectiveBudget: number;
      scalabilityScore: number;
    }[];
    scalingPatterns: {
      insight: string;
      threshold: number;
      platform: string;
    }[];
    weeklyPacingInsights: {
      dayOfWeek: string;
      performanceMultiplier: number;
      recommendation: string;
    }[];
    seasonalityInsights: {
      period: string;
      expectedLift: number;
      budgetRecommendation: string;
    }[];
  };
  
  competitiveIntelligence: {
    trackedCompetitors: string[];
    competitiveGaps: string[];
    emergingTrends: string[];
    competitivePricing: {
      ourPricePoint: string;
      marketPosition: 'premium' | 'mid-market' | 'value';
      priceElasticity: 'high' | 'medium' | 'low';
    };
  };
  
  learnings: {
    lowPerformingCampaigns: {
      campaignType: string;
      failureReason: string;
      costOfFailure: number;
      avoidanceStrategy: string;
    }[];
    antiPatterns: string[];
    inefficientSpend: {
      channel: string;
      context: string;
      recommendation: string;
    }[];
  };
  
  dataFreshness: string;
  totalCampaignsAnalyzed: number;
  totalSpendAnalyzed: number;
  lastUpdated: string;
}

const platformHistoricalData: Record<string, any> = {
  google: {
    averageROAS: 2.8,
    averageCPA: 42,
    conversionRate: 3.2,
    clickThroughRate: 2.8,
    performanceScore: 8.2,
    confidenceLevel: 'high',
    sampleSize: 23,
    bestPerformingCampaignType: 'Search campaigns with SKAGs'
  },
  meta: {
    averageROAS: 3.1,
    averageCPA: 35,
    conversionRate: 3.8,
    clickThroughRate: 1.9,
    performanceScore: 8.7,
    confidenceLevel: 'high',
    sampleSize: 31,
    bestPerformingCampaignType: 'Video + Carousel combos'
  },
  bing: {
    averageROAS: 2.1,
    averageCPA: 48,
    conversionRate: 2.6,
    clickThroughRate: 1.7,
    performanceScore: 6.8,
    confidenceLevel: 'medium',
    sampleSize: 12,
    bestPerformingCampaignType: 'Branded search'
  },
  tiktok: {
    averageROAS: 1.9,
    averageCPA: 52,
    conversionRate: 2.3,
    clickThroughRate: 2.4,
    performanceScore: 6.2,
    confidenceLevel: 'medium',
    sampleSize: 8,
    bestPerformingCampaignType: 'UGC-style video ads'
  },
  linkedin: {
    averageROAS: 2.4,
    averageCPA: 78,
    conversionRate: 2.1,
    clickThroughRate: 1.4,
    performanceScore: 7.1,
    confidenceLevel: 'medium',
    sampleSize: 9,
    bestPerformingCampaignType: 'Sponsored content + InMail'
  },
  pinterest: {
    averageROAS: 1.8,
    averageCPA: 58,
    conversionRate: 2.0,
    clickThroughRate: 2.1,
    performanceScore: 5.9,
    confidenceLevel: 'low',
    sampleSize: 5,
    bestPerformingCampaignType: 'Shopping ads'
  }
};

export function generateHistoricalData(connectedPlatforms: string[]): HistoricalCampaignData {
  // Generate channel performance based on connected platforms
  const channelPerformance = connectedPlatforms.map(platform => ({
    platform,
    ...(platformHistoricalData[platform] || platformHistoricalData.google)
  }));

  // Generate creative performance insights
  const creativePerformance = {
    winningHooks: [
      'Transform Your Space in 30 Days',
      'Join 50,000+ Happy Customers',
      'Limited Time: Save 30% Today',
      'See Real Results or Money Back',
      'The Secret to [Benefit]'
    ],
    topPerformingFormats: [
      {
        format: 'Video (15-30s)',
        platform: 'Meta',
        avgEngagementRate: 8.2,
        avgConversionRate: 4.1
      },
      {
        format: 'Carousel (3-5 cards)',
        platform: 'Meta',
        avgEngagementRate: 6.7,
        avgConversionRate: 3.8
      },
      {
        format: 'Single Image + Strong CTA',
        platform: 'Google Display',
        avgEngagementRate: 3.2,
        avgConversionRate: 2.9
      },
      {
        format: 'UGC-style Video',
        platform: 'TikTok',
        avgEngagementRate: 12.1,
        avgConversionRate: 2.8
      }
    ],
    provenValueProps: [
      'Free shipping on all orders',
      '30-day money-back guarantee',
      'Expert support 24/7',
      'Made with sustainable materials',
      'Trusted by industry leaders'
    ],
    effectiveCallsToAction: [
      'Shop Now',
      'Get Started Today',
      'Claim Your Discount',
      'Learn More',
      'Try It Free'
    ],
    creativeTestInsights: [
      {
        insight: 'Video ads with captions perform 2.3x better than without',
        impact: 'high' as const
      },
      {
        insight: 'Lifestyle imagery outperforms product-only shots by 47%',
        impact: 'high' as const
      },
      {
        insight: 'Social proof (reviews/testimonials) increases conversions by 32%',
        impact: 'high' as const
      },
      {
        insight: 'Urgency language ("Limited time", "Today only") lifts CTR by 18%',
        impact: 'medium' as const
      },
      {
        insight: 'First 3 seconds of video are critical - hook must be strong',
        impact: 'high' as const
      }
    ]
  };

  // Generate audience segments
  const audienceSegments = [
    {
      segmentName: 'Young Urban Professionals',
      demographics: 'Ages 25-40, Urban, $75K+ income',
      conversionRate: 4.7,
      averageOrderValue: 127,
      customerLifetimeValue: 487,
      repeatPurchaseRate: 38,
      segmentScore: 9.2,
      recommendation: 'primary' as const
    },
    {
      segmentName: 'Suburban Parents',
      demographics: 'Ages 30-50, Suburban, $60K+ income',
      conversionRate: 3.8,
      averageOrderValue: 156,
      customerLifetimeValue: 612,
      repeatPurchaseRate: 42,
      segmentScore: 8.7,
      recommendation: 'primary' as const
    },
    {
      segmentName: 'Millennial Trendsetters',
      demographics: 'Ages 23-35, Urban/Suburban, $45K+ income',
      conversionRate: 3.2,
      averageOrderValue: 89,
      customerLifetimeValue: 298,
      repeatPurchaseRate: 28,
      segmentScore: 7.4,
      recommendation: 'secondary' as const
    },
    {
      segmentName: 'Gen Z Early Adopters',
      demographics: 'Ages 18-25, Mixed locations, $25K+ income',
      conversionRate: 2.1,
      averageOrderValue: 67,
      customerLifetimeValue: 178,
      repeatPurchaseRate: 21,
      segmentScore: 5.8,
      recommendation: 'test' as const
    }
  ];

  // Generate budget patterns
  const budgetPatterns = {
    channelBudgetAllocation: connectedPlatforms.map(platform => {
      const budgetShares: Record<string, number> = {
        google: 30,
        meta: 37,
        bing: 8,
        tiktok: 10,
        linkedin: 12,
        pinterest: 3
      };
      
      const minBudgets: Record<string, number> = {
        google: 200,
        meta: 150,
        bing: 100,
        tiktok: 150,
        linkedin: 250,
        pinterest: 75
      };
      
      const scalability: Record<string, number> = {
        google: 8.5,
        meta: 9.2,
        bing: 6.8,
        tiktok: 7.1,
        linkedin: 6.5,
        pinterest: 5.2
      };

      return {
        platform,
        optimalBudgetShare: budgetShares[platform] || 15,
        minEffectiveBudget: minBudgets[platform] || 150,
        scalabilityScore: scalability[platform] || 7.0
      };
    }),
    scalingPatterns: [
      {
        insight: 'Meta scales efficiently up to $500/day before diminishing returns',
        threshold: 500,
        platform: 'Meta'
      },
      {
        insight: 'Google Search maintains performance up to $400/day',
        threshold: 400,
        platform: 'Google'
      },
      {
        insight: 'TikTok requires minimum $150/day for algorithm optimization',
        threshold: 150,
        platform: 'TikTok'
      }
    ],
    weeklyPacingInsights: [
      { dayOfWeek: 'Monday', performanceMultiplier: 0.92, recommendation: 'Standard budget' },
      { dayOfWeek: 'Tuesday', performanceMultiplier: 1.05, recommendation: 'Increase by 10%' },
      { dayOfWeek: 'Wednesday', performanceMultiplier: 1.08, recommendation: 'Peak day - increase by 15%' },
      { dayOfWeek: 'Thursday', performanceMultiplier: 1.12, recommendation: 'Peak day - increase by 20%' },
      { dayOfWeek: 'Friday', performanceMultiplier: 0.98, recommendation: 'Standard budget' },
      { dayOfWeek: 'Saturday', performanceMultiplier: 0.85, recommendation: 'Reduce by 15%' },
      { dayOfWeek: 'Sunday', performanceMultiplier: 0.78, recommendation: 'Reduce by 20%' }
    ],
    seasonalityInsights: [
      {
        period: 'Q4 Holiday Season (Nov-Dec)',
        expectedLift: 47,
        budgetRecommendation: 'Increase budget by 40-50% in November and December'
      },
      {
        period: 'Back-to-School (Aug-Sep)',
        expectedLift: 23,
        budgetRecommendation: 'Increase budget by 20-25% in August and early September'
      },
      {
        period: 'New Year (Jan)',
        expectedLift: 18,
        budgetRecommendation: 'Capitalize on New Year resolutions - increase by 15-20%'
      },
      {
        period: 'Summer Slowdown (Jun-Jul)',
        expectedLift: -12,
        budgetRecommendation: 'Reduce spending by 10-15% or focus on retargeting'
      }
    ]
  };

  // Generate competitive intelligence
  const competitiveIntelligence = {
    trackedCompetitors: ['Brand A', 'Brand B', 'Brand C', 'Brand D'],
    competitiveGaps: [
      'Competitors lack mobile-optimized checkout experience',
      'Weak social proof and customer reviews on competitor sites',
      'Limited product customization options compared to our offering',
      'Slower shipping times (5-7 days vs our 2-3 days)'
    ],
    emergingTrends: [
      'Shift toward sustainable/eco-friendly messaging',
      'Increased demand for personalization and customization',
      'Rise of influencer partnerships and UGC content',
      'Growing preference for subscription/membership models'
    ],
    competitivePricing: {
      ourPricePoint: '$79-$149',
      marketPosition: 'mid-market' as const,
      priceElasticity: 'medium' as const
    }
  };

  // Generate learnings from past failures
  const learnings = {
    lowPerformingCampaigns: [
      {
        campaignType: 'Pinterest - Broad Targeting',
        failureReason: 'Audience too broad, high CPA ($87), low conversion rate (0.8%)',
        costOfFailure: 2847,
        avoidanceStrategy: 'Use Pinterest shopping ads with specific interest targeting only'
      },
      {
        campaignType: 'Google Display - Prospecting',
        failureReason: 'Poor quality traffic, high bounce rate (78%), minimal conversions',
        costOfFailure: 1923,
        avoidanceStrategy: 'Limit Display to retargeting only, avoid cold prospecting on Display'
      },
      {
        campaignType: 'TikTok - Q1 2024',
        failureReason: 'Seasonal mismatch, low engagement in winter months',
        costOfFailure: 1456,
        avoidanceStrategy: 'Reduce TikTok spend during Q1, focus on Meta and Google'
      }
    ],
    antiPatterns: [
      'Avoid generic lifestyle imagery without product focus',
      'Don\'t run awareness campaigns without retargeting follow-up',
      'Never launch campaigns without mobile optimization first',
      'Avoid broad age targeting (18-65+) - always segment',
      'Don\'t neglect landing page speed - cost us 23% in conversions'
    ],
    inefficientSpend: [
      {
        channel: 'Google Display Network',
        context: 'Cold prospecting without remarketing',
        recommendation: 'Use Display exclusively for retargeting warm audiences'
      },
      {
        channel: 'LinkedIn',
        context: 'B2C campaigns targeting individual consumers',
        recommendation: 'Reserve LinkedIn for B2B or high-ticket B2C only'
      },
      {
        channel: 'Pinterest',
        context: 'Winter campaigns (Dec-Feb)',
        recommendation: 'Focus Pinterest spend on spring/summer when platform engagement peaks'
      }
    ]
  };

  const totalCampaigns = connectedPlatforms.reduce((sum, platform) => {
    return sum + (platformHistoricalData[platform]?.sampleSize || 0);
  }, 0);

  const totalSpend = totalCampaigns * 2700; // Average $2,700 per campaign

  return {
    channelPerformance,
    creativePerformance,
    audienceSegments,
    budgetPatterns,
    competitiveIntelligence,
    learnings,
    dataFreshness: 'Last 90 days',
    totalCampaignsAnalyzed: totalCampaigns,
    totalSpendAnalyzed: totalSpend,
    lastUpdated: new Date().toISOString()
  };
}

export type { HistoricalCampaignData };
