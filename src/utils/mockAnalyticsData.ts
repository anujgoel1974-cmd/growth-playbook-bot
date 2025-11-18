import { AnalyticsRunResponse, AnalyticsTemplate, AnalyticsTemplateId } from '@/types/analytics';

export const analyticsTemplates: AnalyticsTemplate[] = [
  {
    id: "weekly_performance",
    name: "Weekly Performance Snapshot",
    description: "Blended summary across Google, Meta, Bing for the last 7 days.",
    category: "Overview"
  },
  {
    id: "wasted_spend",
    name: "Wasted Spend Finder",
    description: "Find campaigns wasting budget (high spend, low/no conversions).",
    category: "Spend & Efficiency"
  },
  {
    id: "scaling_opportunities",
    name: "Scaling Opportunities",
    description: "Identify campaigns/ads that are strong candidates to scale.",
    category: "Spend & Efficiency"
  },
  {
    id: "funnel_dropoff",
    name: "Funnel Drop-off Analysis",
    description: "See where users drop off in the funnel using pixel data.",
    category: "Funnel & Pixel"
  },
  {
    id: "creative_fatigue",
    name: "Creative Fatigue Detector",
    description: "Spot creatives whose performance is decaying.",
    category: "Creative & SKU"
  },
  {
    id: "top_bottom_skus",
    name: "Top & Bottom SKUs",
    description: "Which products should we push or deprioritize?",
    category: "Creative & SKU"
  },
  {
    id: "channel_mix",
    name: "Channel Mix Optimizer",
    description: "How to rebalance budget between Google, Meta, Bing.",
    category: "Overview"
  },
  {
    id: "geo_performance",
    name: "Geo Heatmap & Expansion",
    description: "Which locations work best, and where to expand or cut?",
    category: "Spend & Efficiency"
  },
  {
    id: "account_anomalies",
    name: "Account Health & Anomalies",
    description: "Detect spikes/drops in ROAS, CPA, or spend.",
    category: "Health & Anomalies"
  },
  {
    id: "roas_drop_explainer",
    name: "ROAS Drop Explainer",
    description: "ROAS dropped this week – explain why & what to do.",
    category: "Health & Anomalies"
  }
];

export function generateMockAnalyticsResponse(
  templateId: AnalyticsTemplateId,
  dateRange: { from: string; to: string },
  platforms: string[],
  sessionId?: string
): AnalyticsRunResponse {
  const baseSessionId = sessionId || `session_${Date.now()}`;
  
  const responses: Record<AnalyticsTemplateId, AnalyticsRunResponse> = {
    weekly_performance: {
      sessionId: baseSessionId,
      templateId,
      summary: "Your campaigns generated $12,482 in revenue from $4,234 in spend over the last 7 days, achieving a 2.95 ROAS. Meta is your strongest performer at 3.4 ROAS, while Google shows opportunity for optimization at 2.1 ROAS.",
      sections: [
        {
          type: "table",
          title: "Platform Performance",
          columns: ["Platform", "Spend", "Revenue", "ROAS", "CPA", "CTR", "CPC"],
          rows: [
            ["Meta", "$1,842", "$6,263", "3.40", "$18.50", "2.8%", "$0.92"],
            ["Google", "$1,892", "$3,973", "2.10", "$24.30", "1.9%", "$1.24"],
            ["Bing", "$500", "$1,246", "2.49", "$21.10", "2.1%", "$0.85"]
          ]
        },
        {
          type: "chart",
          title: "ROAS Trend (Last 7 Days)",
          chartType: "line",
          config: {
            data: [
              { date: "Day 1", Meta: 3.2, Google: 2.3, Bing: 2.6 },
              { date: "Day 2", Meta: 3.5, Google: 2.0, Bing: 2.4 },
              { date: "Day 3", Meta: 3.3, Google: 2.2, Bing: 2.5 },
              { date: "Day 4", Meta: 3.6, Google: 1.9, Bing: 2.3 },
              { date: "Day 5", Meta: 3.4, Google: 2.1, Bing: 2.6 },
              { date: "Day 6", Meta: 3.3, Google: 2.0, Bing: 2.5 },
              { date: "Day 7", Meta: 3.5, Google: 2.2, Bing: 2.4 }
            ],
            xAxis: "date",
            metrics: ["Meta", "Google", "Bing"]
          }
        }
      ],
      recommendations: [
        {
          title: "Scale Meta Prospecting Campaign",
          description: "Your Meta prospecting is consistently hitting 3.4+ ROAS. Consider increasing daily budget by 20%.",
          severity: "info",
          tags: ["scale", "meta"]
        },
        {
          title: "Optimize Google Search Keywords",
          description: "Google ROAS below target. Review search terms and add negative keywords to reduce wasted spend.",
          severity: "warning",
          tags: ["optimize", "google"]
        }
      ]
    },
    
    wasted_spend: {
      sessionId: baseSessionId,
      templateId,
      summary: "Found $892 in wasted spend across 4 campaigns over the last 7 days. These campaigns have high spend but zero or very low conversions, representing 21% of your total ad budget.",
      sections: [
        {
          type: "table",
          title: "Wasteful Campaigns",
          columns: ["Campaign", "Platform", "Spend", "Conversions", "Wasted $", "Action"],
          rows: [
            ["Summer Collection 2024", "Google", "$342", "1", "$342", "Pause"],
            ["Retargeting - Cold", "Meta", "$198", "0", "$198", "Pause"],
            ["Brand Keywords", "Bing", "$224", "2", "$224", "Review"],
            ["Display Network", "Google", "$128", "0", "$128", "Pause"]
          ]
        },
        {
          type: "chart",
          title: "Wasted Spend by Campaign",
          chartType: "bar",
          config: {
            data: [
              { campaign: "Summer 2024", wasted: 342 },
              { campaign: "Retargeting Cold", wasted: 198 },
              { campaign: "Brand KW", wasted: 224 },
              { campaign: "Display", wasted: 128 }
            ],
            xAxis: "campaign",
            metrics: ["wasted"]
          }
        }
      ],
      recommendations: [
        {
          title: "Pause 3 Campaigns Immediately",
          description: "Stop bleeding budget on campaigns with 0-1 conversions. This will save ~$670/week.",
          severity: "critical",
          tags: ["pause", "immediate"]
        },
        {
          title: "Review Brand Keyword Strategy",
          description: "Brand campaign has only 2 conversions for $224 spend. Check if branded terms are cannibalizing organic.",
          severity: "warning",
          tags: ["review", "google"]
        }
      ]
    },
    
    scaling_opportunities: {
      sessionId: baseSessionId,
      templateId,
      summary: "Identified 3 high-performing campaigns ready to scale. These campaigns show consistent ROAS above 3.0 with room for increased budget before saturation.",
      sections: [
        {
          type: "table",
          title: "Scale Candidates",
          columns: ["Campaign", "Platform", "Current Budget", "ROAS", "Suggested Increase", "Projected Revenue Lift"],
          rows: [
            ["Prospecting Lookalike", "Meta", "$150/day", "3.8", "+30% ($45)", "+$513/day"],
            ["Shopping - Best Sellers", "Google", "$200/day", "3.2", "+25% ($50)", "+$400/day"],
            ["Interest Targeting", "Meta", "$100/day", "3.5", "+40% ($40)", "+$420/day"]
          ]
        },
        {
          type: "chart",
          title: "ROAS vs Spend (Scale Candidates Highlighted)",
          chartType: "scatter",
          config: {
            data: [
              { campaign: "Prospecting LLA", spend: 1050, roas: 3.8, status: "scale" },
              { campaign: "Shopping Best", spend: 1400, roas: 3.2, status: "scale" },
              { campaign: "Interest Target", spend: 700, roas: 3.5, status: "scale" },
              { campaign: "Other 1", spend: 800, roas: 2.1, status: "normal" },
              { campaign: "Other 2", spend: 600, roas: 1.8, status: "normal" }
            ]
          }
        }
      ],
      recommendations: [
        {
          title: "Increase Budget on Top 3 Campaigns",
          description: "Scale these campaigns gradually (+20-40%) to maximize revenue while maintaining efficiency.",
          severity: "info",
          tags: ["scale", "budget"]
        },
        {
          title: "Monitor ROAS During Scale",
          description: "Watch for ROAS decline as you scale. If ROAS drops 15%+, pause increases and optimize creative/targeting.",
          severity: "warning",
          tags: ["monitor", "roas"]
        }
      ]
    },
    
    funnel_dropoff: {
      sessionId: baseSessionId,
      templateId,
      summary: "Major drop-off occurs at Add to Cart stage (68% drop from pageview). Only 12% of users who add to cart complete purchase, indicating checkout friction.",
      sections: [
        {
          type: "chart",
          title: "Conversion Funnel",
          chartType: "funnel",
          config: {
            data: [
              { stage: "Sessions", count: 12500, rate: 100 },
              { stage: "Product View", count: 8200, rate: 65.6 },
              { stage: "Add to Cart", count: 2624, rate: 32.0 },
              { stage: "Checkout Started", count: 892, rate: 34.0 },
              { stage: "Purchase", count: 315, rate: 35.3 }
            ]
          }
        },
        {
          type: "table",
          title: "Conversion Rates by Stage",
          columns: ["Stage", "Users", "Drop-off", "Conversion Rate"],
          rows: [
            ["Sessions → Product View", "8,200", "4,300 (34.4%)", "65.6%"],
            ["Product View → Add to Cart", "2,624", "5,576 (68.0%)", "32.0%"],
            ["Add to Cart → Checkout", "892", "1,732 (66.0%)", "34.0%"],
            ["Checkout → Purchase", "315", "577 (64.7%)", "35.3%"]
          ]
        }
      ],
      recommendations: [
        {
          title: "Fix Add to Cart Drop-off",
          description: "68% drop from product view to cart is unusually high. Test prominent CTA, urgency messaging, or reduce form fields.",
          severity: "critical",
          tags: ["optimize", "conversion"]
        },
        {
          title: "Simplify Checkout Flow",
          description: "Only 35% of checkout starters complete purchase. Consider guest checkout, trust badges, or payment options.",
          severity: "warning",
          tags: ["checkout", "ux"]
        }
      ]
    },
    
    creative_fatigue: {
      sessionId: baseSessionId,
      templateId,
      summary: "Detected 5 ads showing creative fatigue with CTR declining 30%+ over the last 14 days. Frequency is high (5.8+ impressions per user) and engagement is dropping.",
      sections: [
        {
          type: "table",
          title: "Fatigued Creatives",
          columns: ["Ad Name", "Platform", "Current CTR", "14-Day Trend", "Frequency", "Action"],
          rows: [
            ["Summer Sale Hero", "Meta", "1.2%", "↓ 42%", "6.8", "Refresh"],
            ["Product Carousel v2", "Meta", "0.9%", "↓ 38%", "5.9", "Refresh"],
            ["Testimonial Video", "Google", "1.5%", "↓ 31%", "N/A", "Pause"],
            ["Discount Promo", "Meta", "1.0%", "↓ 35%", "7.2", "Refresh"],
            ["Brand Story", "Meta", "0.8%", "↓ 29%", "5.2", "Test New"]
          ]
        },
        {
          type: "text",
          title: "What's Happening",
          body: "Your audience has seen these ads multiple times (5-7 impressions per person). CTR decay indicates creative burnout. Meta's algorithm also penalizes fatigued ads with higher CPMs."
        }
      ],
      recommendations: [
        {
          title: "Launch 3-5 New Creative Variations",
          description: "Refresh top 3 fatigued ads with new hooks, visuals, or formats. Test UGC, behind-the-scenes, or benefit-focused angles.",
          severity: "critical",
          tags: ["creative", "refresh"]
        },
        {
          title: "Rotate Ads More Frequently",
          description: "Set frequency cap at 4 impressions/7 days and rotate in fresh creatives weekly to prevent fatigue.",
          severity: "info",
          tags: ["strategy", "frequency"]
        }
      ]
    },
    
    top_bottom_skus: {
      sessionId: baseSessionId,
      templateId,
      summary: "Your top 3 SKUs drive 68% of revenue. Bottom 5 SKUs have negative ROAS and should be deprioritized or removed from campaigns.",
      sections: [
        {
          type: "table",
          title: "Top Performing SKUs (Scale These)",
          columns: ["SKU", "Product", "Revenue", "ROAS", "Conversion Rate", "Action"],
          rows: [
            ["SKU-1284", "Classic White Sneaker", "$4,892", "4.2", "3.8%", "Increase Budget"],
            ["SKU-2910", "Running Shoe Pro", "$3,241", "3.9", "3.2%", "Create Dedicated Campaign"],
            ["SKU-4472", "Limited Edition Black", "$2,156", "3.5", "2.9%", "Expand Targeting"]
          ]
        },
        {
          type: "table",
          title: "Bottom Performing SKUs (Deprioritize)",
          columns: ["SKU", "Product", "Spend", "Revenue", "ROAS", "Action"],
          rows: [
            ["SKU-8821", "Neon Yellow Variant", "$342", "$98", "0.29", "Pause"],
            ["SKU-5512", "Clearance Item A", "$198", "$145", "0.73", "Pause"],
            ["SKU-9904", "Limited Stock B", "$224", "$189", "0.84", "Remove"],
            ["SKU-3387", "Seasonal Red", "$156", "$112", "0.72", "Pause"],
            ["SKU-7743", "Prototype Design", "$128", "$45", "0.35", "Remove"]
          ]
        },
        {
          type: "chart",
          title: "Revenue by SKU",
          chartType: "bar",
          config: {
            data: [
              { sku: "SKU-1284", revenue: 4892 },
              { sku: "SKU-2910", revenue: 3241 },
              { sku: "SKU-4472", revenue: 2156 },
              { sku: "SKU-8821", revenue: 98 },
              { sku: "SKU-5512", revenue: 145 }
            ],
            xAxis: "sku",
            metrics: ["revenue"]
          }
        }
      ],
      recommendations: [
        {
          title: "Create Winner Campaigns for Top 3 SKUs",
          description: "Build dedicated campaigns for SKU-1284, 2910, and 4472 with higher budgets and premium placements.",
          severity: "info",
          tags: ["scale", "sku"]
        },
        {
          title: "Remove Losing SKUs from Campaigns",
          description: "Pause or remove bottom 5 SKUs immediately. They're burning 21% of budget with negative returns.",
          severity: "critical",
          tags: ["pause", "sku"]
        }
      ]
    },
    
    channel_mix: {
      sessionId: baseSessionId,
      templateId,
      summary: "Current spend is 45% Google, 40% Meta, 15% Bing. Analysis shows Meta is underallocated given its superior ROAS (3.4 vs 2.1 on Google). Recommended rebalance: 35% Google, 50% Meta, 15% Bing.",
      sections: [
        {
          type: "table",
          title: "Current vs Recommended Budget Split",
          columns: ["Platform", "Current %", "Current Spend", "Recommended %", "Recommended Spend", "Delta"],
          rows: [
            ["Google", "45%", "$1,892", "35%", "$1,470", "-$422"],
            ["Meta", "40%", "$1,680", "50%", "$2,100", "+$420"],
            ["Bing", "15%", "$630", "15%", "$630", "$0"]
          ]
        },
        {
          type: "chart",
          title: "Current Budget Mix",
          chartType: "pie",
          config: {
            data: [
              { platform: "Google", value: 45 },
              { platform: "Meta", value: 40 },
              { platform: "Bing", value: 15 }
            ]
          }
        },
        {
          type: "chart",
          title: "Recommended Budget Mix",
          chartType: "pie",
          config: {
            data: [
              { platform: "Google", value: 35 },
              { platform: "Meta", value: 50 },
              { platform: "Bing", value: 15 }
            ]
          }
        }
      ],
      recommendations: [
        {
          title: "Shift $420 from Google to Meta",
          description: "Meta's ROAS is 62% higher than Google. Reallocating budget could increase overall revenue by 12-15%.",
          severity: "info",
          tags: ["rebalance", "budget"]
        },
        {
          title: "Keep Bing Allocation Stable",
          description: "Bing is performing adequately at 2.49 ROAS and 15% budget. Maintain current allocation.",
          severity: "info",
          tags: ["maintain", "bing"]
        }
      ]
    },
    
    geo_performance: {
      sessionId: baseSessionId,
      templateId,
      summary: "Your top 5 geos (CA, NY, TX, FL, WA) drive 72% of revenue. Expansion opportunity in IL, PA, and OH shows strong early ROAS. Underperforming geos (NV, AZ) should be deprioritized.",
      sections: [
        {
          type: "table",
          title: "Geographic Performance",
          columns: ["State", "Spend", "Revenue", "ROAS", "Category", "Action"],
          rows: [
            ["California", "$892", "$3,456", "3.87", "Core", "Maintain"],
            ["New York", "$624", "$2,184", "3.50", "Core", "Maintain"],
            ["Texas", "$512", "$1,638", "3.20", "Core", "Maintain"],
            ["Illinois", "$128", "$486", "3.80", "Growth", "Expand"],
            ["Pennsylvania", "$98", "$352", "3.59", "Growth", "Expand"],
            ["Nevada", "$224", "$358", "1.60", "Risk", "Reduce"],
            ["Arizona", "$186", "$298", "1.60", "Risk", "Reduce"]
          ]
        },
        {
          type: "chart",
          title: "Top Geos by ROAS",
          chartType: "bar",
          config: {
            data: [
              { geo: "CA", roas: 3.87 },
              { geo: "IL", roas: 3.80 },
              { geo: "PA", roas: 3.59 },
              { geo: "NY", roas: 3.50 },
              { geo: "TX", roas: 3.20 }
            ],
            xAxis: "geo",
            metrics: ["roas"]
          }
        }
      ],
      recommendations: [
        {
          title: "Expand into IL, PA, and OH",
          description: "These geos show strong early ROAS (3.5-3.8) with low spend. Increase budget by 50% to test scalability.",
          severity: "info",
          tags: ["expand", "geo"]
        },
        {
          title: "Cut Spend in NV and AZ",
          description: "ROAS below 2.0 in these states. Reduce budget by 40% or pause entirely and reallocate to winners.",
          severity: "warning",
          tags: ["reduce", "geo"]
        }
      ]
    },
    
    account_anomalies: {
      sessionId: baseSessionId,
      templateId,
      summary: "Detected 3 anomalies in the last 7 days: ROAS dropped 18% on Google (Day 4), Meta spend spiked 32% (Day 5), and overall CPA increased 22% (Days 5-6).",
      sections: [
        {
          type: "table",
          title: "Detected Anomalies",
          columns: ["Date", "Metric", "Platform", "Change", "Impact", "Status"],
          rows: [
            ["Nov 15", "ROAS", "Google", "-18%", "Lost $340 revenue", "Investigating"],
            ["Nov 16", "Spend", "Meta", "+32%", "Over-budget by $280", "Resolved"],
            ["Nov 16-17", "CPA", "All", "+22%", "Efficiency declined", "Monitoring"]
          ]
        },
        {
          type: "chart",
          title: "ROAS and Spend (Last 14 Days)",
          chartType: "line",
          config: {
            data: [
              { date: "Day 1", roas: 2.8, spend: 580 },
              { date: "Day 2", roas: 2.9, spend: 590 },
              { date: "Day 3", roas: 3.0, spend: 610 },
              { date: "Day 4", roas: 2.4, spend: 620 },
              { date: "Day 5", roas: 2.6, spend: 820 },
              { date: "Day 6", roas: 2.5, spend: 780 },
              { date: "Day 7", roas: 2.7, spend: 650 }
            ],
            xAxis: "date",
            metrics: ["roas", "spend"]
          }
        }
      ],
      recommendations: [
        {
          title: "Investigate Google ROAS Drop",
          description: "Review Day 4 campaigns for bid changes, keyword performance, or competitive pressure that caused 18% ROAS decline.",
          severity: "warning",
          tags: ["investigate", "google"]
        },
        {
          title: "Set Budget Alerts",
          description: "Meta spend spike suggests budget cap issue. Enable automated rules to prevent overspend (+20% threshold).",
          severity: "critical",
          tags: ["automation", "budget"]
        }
      ]
    },
    
    roas_drop_explainer: {
      sessionId: baseSessionId,
      templateId,
      summary: "ROAS dropped from 3.2 to 2.4 this week (-25%). Primary driver: Google Shopping CPC increased 28% due to increased competition. Secondary factors: Meta creative fatigue (-12% CTR) and 15% decrease in conversion rate across all platforms.",
      sections: [
        {
          type: "text",
          title: "What Changed?",
          body: "Three major factors contributed to the ROAS decline: (1) Google increased CPCs by 28% in your Shopping campaigns due to seasonal competition, (2) Meta ad creative is showing fatigue with CTR down 12%, and (3) Your landing page conversion rate dropped 15%, possibly due to site speed issues or checkout friction."
        },
        {
          type: "table",
          title: "Key Drivers of ROAS Decline",
          columns: ["Factor", "Platform", "Impact", "Magnitude"],
          rows: [
            ["CPC Increase", "Google Shopping", "Primary", "+28%"],
            ["Creative Fatigue", "Meta", "Secondary", "-12% CTR"],
            ["Conversion Rate Drop", "All", "Secondary", "-15%"],
            ["Increased Competition", "Google", "Contributing", "+22% auction pressure"]
          ]
        },
        {
          type: "chart",
          title: "ROAS Trend with Breakdown",
          chartType: "line",
          config: {
            data: [
              { date: "Week 1", roas: 3.2, google: 2.8, meta: 3.6 },
              { date: "Week 2", roas: 3.0, google: 2.5, meta: 3.5 },
              { date: "Week 3", roas: 2.7, google: 2.2, meta: 3.2 },
              { date: "Week 4", roas: 2.4, google: 1.9, meta: 2.9 }
            ],
            xAxis: "date",
            metrics: ["roas", "google", "meta"]
          }
        },
        {
          type: "table",
          title: "Platform/Campaign Deltas",
          columns: ["Platform/Campaign", "Previous ROAS", "Current ROAS", "Change"],
          rows: [
            ["Google Shopping", "2.8", "1.9", "-32%"],
            ["Google Search", "3.1", "2.7", "-13%"],
            ["Meta Prospecting", "3.6", "2.9", "-19%"],
            ["Meta Retargeting", "4.2", "3.8", "-10%"]
          ]
        }
      ],
      recommendations: [
        {
          title: "Pause Low-Performing Google Shopping Products",
          description: "Identify SKUs with ROAS < 2.0 in Shopping and pause them immediately to stop the bleeding.",
          severity: "critical",
          tags: ["pause", "google", "immediate"]
        },
        {
          title: "Refresh Meta Creative Assets",
          description: "Launch 3-5 new ad variations with fresh hooks and visuals to combat creative fatigue.",
          severity: "warning",
          tags: ["creative", "meta"]
        },
        {
          title: "Optimize Landing Page Experience",
          description: "Run speed test, simplify checkout, and A/B test CTA placement to recover 15% conversion rate loss.",
          severity: "warning",
          tags: ["conversion", "landing-page"]
        }
      ]
    }
  };

  return responses[templateId];
}
