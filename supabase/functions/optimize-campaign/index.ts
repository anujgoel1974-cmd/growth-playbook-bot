import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newCampaignAnalysis, historicalData, userRole, productCategory } = await req.json();
    
    console.log('Optimizing campaign with historical data:', {
      totalCampaigns: historicalData.totalCampaignsAnalyzed,
      platforms: historicalData.channelPerformance.length
    });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Format historical data for AI prompt
    const formatHistoricalData = (data: any) => {
      const channelSummary = data.channelPerformance
        .map((ch: any) => `${ch.platform}: ${ch.averageROAS}x ROAS, $${ch.averageCPA} CPA, ${ch.conversionRate}% conv. rate (${ch.sampleSize} campaigns)`)
        .join('\n');
      
      const topAudiences = data.audienceSegments
        .filter((seg: any) => seg.recommendation === 'primary')
        .map((seg: any) => `${seg.segmentName} (${seg.demographics}): ${seg.conversionRate}% conv., $${seg.averageOrderValue} AOV`)
        .join('\n');
      
      const topCreativeInsights = data.creativePerformance.creativeTestInsights
        .filter((ins: any) => ins.impact === 'high')
        .map((ins: any) => ins.insight)
        .join('\n');
      
      const failurePatterns = data.learnings.lowPerformingCampaigns
        .map((lp: any) => `${lp.campaignType}: ${lp.failureReason} → ${lp.avoidanceStrategy}`)
        .join('\n');

      return `
HISTORICAL CHANNEL PERFORMANCE (${data.totalCampaignsAnalyzed} campaigns, $${(data.totalSpendAnalyzed / 1000).toFixed(0)}K analyzed):
${channelSummary}

TOP PERFORMING AUDIENCES:
${topAudiences}

PROVEN CREATIVE STRATEGIES:
${topCreativeInsights}

PAST FAILURES TO AVOID:
${failurePatterns}

BUDGET OPTIMIZATION PATTERNS:
${data.budgetPatterns.scalingPatterns.map((sp: any) => sp.insight).join('\n')}
`;
    };

    // Format new campaign analysis
    const formatNewCampaignAnalysis = (analysis: any) => {
      const mediaPlanSummary = analysis.mediaPlan
        .map((week: any) => 
          week.channels.map((ch: any) => `${ch.channel}: $${ch.budget} (${ch.percentage}%)`).join(', ')
        )
        .join('\n');
      
      return `
NEW CAMPAIGN MEDIA PLAN:
${mediaPlanSummary}

TARGET AUDIENCES:
${analysis.campaignTargeting.map((ct: any) => ct.title).join(', ')}

COMPETITIVE INSIGHTS:
${analysis.competitiveAnalysis.insights.map((ins: any) => ins.title).join(', ')}
`;
    };

    const systemPrompt = `You are an expert campaign optimization strategist with access to both new campaign intelligence and historical performance data from ${historicalData.totalCampaignsAnalyzed} past campaigns.

${formatHistoricalData(historicalData)}

${formatNewCampaignAnalysis(newCampaignAnalysis)}

YOUR TASK:
Enhance the media plan and targeting strategy by:
1. Adjusting channel budget allocation based on historical ROAS and CPA performance
2. Recommending proven creative approaches from historical winners and avoiding past failures
3. Prioritizing audience segments with highest historical ROI and conversion rates
4. Suggesting optimal campaign pacing based on past efficiency patterns
5. Flagging risks based on failure patterns and anti-patterns

OPTIMIZATION RULES:
- If a channel has historical ROAS > 2.5x, consider increasing its budget allocation by 10-15%
- If a channel has historical ROAS < 2.0x, reduce to testing budget (10-15% allocation max)
- Prioritize audiences with conversion rates > 3.5% and segmentScore > 8.0
- Warn about any strategies that match historical failure patterns
- Boost budget for channels with high scalabilityScore (> 8.0)
- Surface proven creative hooks and CTAs from historical data

OUTPUT FORMAT (must be valid JSON):
{
  "optimizedMediaPlan": [
    {
      "weekNumber": 1,
      "channels": [
        {
          "channel": "Meta",
          "budget": 370,
          "percentage": 37,
          "reasoning": "Increased from 25% based on historical 3.1x ROAS (highest performer)",
          "historicalROAS": 3.1,
          "historicalCPA": 35,
          "change": "+12%"
        }
      ]
    }
  ],
  "priorityAudiences": [
    {
      "segmentName": "Young Urban Professionals",
      "demographics": "Ages 25-40, Urban, $75K+ income",
      "historicalConversionRate": 4.7,
      "historicalAOV": 127,
      "priority": 1,
      "recommendation": "Primary targeting - highest historical ROI"
    }
  ],
  "creativeRecommendations": [
    {
      "recommendation": "Use video ads with captions",
      "reasoning": "2.3x better performance historically",
      "impact": "high",
      "provenExample": "Transform Your Space in 30 Days hook performed at 8.2% CTR"
    }
  ],
  "budgetOptimizations": [
    {
      "change": "Increase Meta budget by 12% to 37% allocation",
      "reasoning": "Historical 3.1x ROAS vs 1.9x platform average",
      "expectedImpact": "+23% campaign ROAS",
      "historicalEvidence": "31 campaigns, $${(31 * 2700).toFixed(0)} spend analyzed"
    }
  ],
  "riskMitigations": [
    {
      "risk": "Pinterest historically underperforms in Q1",
      "severity": "medium",
      "mitigation": "Reduce Pinterest to testing budget (10%) or pause until Q2",
      "costOfInaction": "Avg $1,456 wasted spend based on past campaigns"
    }
  ],
  "confidenceScore": 8.5,
  "reasoningExplanation": "High confidence based on ${historicalData.totalCampaignsAnalyzed} campaigns and consistent performance patterns across channels"
}

CRITICAL: Ensure your response is valid JSON. Do not include any text before or after the JSON object.`;

    console.log('Calling AI model for optimization...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: 'Optimize this campaign based on historical performance data.'
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    let optimizations;
    try {
      optimizations = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('AI response was not valid JSON');
    }

    // Add historical data summary to optimizations
    optimizations.historicalSummary = {
      totalCampaigns: historicalData.totalCampaignsAnalyzed,
      totalSpend: historicalData.totalSpendAnalyzed,
      dataFreshness: historicalData.dataFreshness
    };

    console.log('Campaign optimization complete');

    return new Response(
      JSON.stringify(optimizations),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in optimize-campaign function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        // Fallback response if optimization fails
        optimizedMediaPlan: null,
        priorityAudiences: [],
        creativeRecommendations: [],
        budgetOptimizations: [],
        riskMitigations: [],
        confidenceScore: 0,
        reasoningExplanation: 'Optimization failed - using default campaign plan'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
