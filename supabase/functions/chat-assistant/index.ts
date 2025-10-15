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
    const { message, metrics } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context-aware system prompt with metrics data
    const systemPrompt = `You are an expert marketing analytics AI assistant. You help users understand their advertising campaign performance across multiple platforms including Google Ads, Meta (Facebook/Instagram), Bing, TikTok, LinkedIn, and Pinterest.

Current Campaign Metrics Overview (Last 30 Days):

PERFORMANCE:
- Total Spend: $${metrics.totalSpend.toLocaleString()} | Revenue: $${metrics.totalRevenue?.toLocaleString() || 'N/A'} | Profit: $${metrics.totalProfit?.toLocaleString() || 'N/A'}
- ROAS: ${metrics.avgROAS?.toFixed(2) || 'N/A'}x | ROI: ${metrics.avgROI?.toFixed(1) || 'N/A'}%
- Impressions: ${metrics.totalImpressions.toLocaleString()} | Clicks: ${metrics.totalClicks.toLocaleString()}
- CTR: ${metrics.avgCTR}% | CPC: $${metrics.avgCPC.toFixed(2)} | CPA: $${metrics.avgCPA.toFixed(2)}
- Conversions: ${metrics.totalConversions} | CVR: ${metrics.conversionRate}%
- Avg Order Value: $${metrics.avgOrderValue?.toFixed(2) || 'N/A'}

CONVERSION FUNNEL:
- Clicks → Landing Page Views: ${metrics.totalLandingPageViews?.toLocaleString() || 'N/A'} (${metrics.totalLandingPageViews ? ((metrics.totalLandingPageViews/metrics.totalClicks)*100).toFixed(1) : 'N/A'}%)
- Landing Pages → Add to Cart: ${metrics.totalAddToCart?.toLocaleString() || 'N/A'} (${metrics.totalAddToCart && metrics.totalLandingPageViews ? ((metrics.totalAddToCart/metrics.totalLandingPageViews)*100).toFixed(1) : 'N/A'}%)
- Add to Cart → Initiate Checkout: ${metrics.totalInitiateCheckout?.toLocaleString() || 'N/A'} (${metrics.totalInitiateCheckout && metrics.totalAddToCart ? ((metrics.totalInitiateCheckout/metrics.totalAddToCart)*100).toFixed(1) : 'N/A'}%)
- Checkout → Purchase: ${metrics.totalConversions} (${metrics.totalInitiateCheckout ? ((metrics.totalConversions/metrics.totalInitiateCheckout)*100).toFixed(1) : 'N/A'}%)
- Bounce Rate: ${metrics.avgBounceRate?.toFixed(1) || 'N/A'}% | Avg Time on Site: ${metrics.avgTimeOnSite ? Math.floor(metrics.avgTimeOnSite/60) + 'm ' + (metrics.avgTimeOnSite%60) + 's' : 'N/A'}

AUDIENCE INSIGHTS:
- Unique Reach: ${metrics.totalUniqueReach?.toLocaleString() || 'N/A'} | Avg Frequency: ${metrics.avgFrequency?.toFixed(2) || 'N/A'}
- Mobile Conversions: ${metrics.mobileShareOfConversions?.toFixed(1) || 'N/A'}% | Desktop: ${metrics.desktopShareOfConversions?.toFixed(1) || 'N/A'}%

ENGAGEMENT & VIDEO:
- Total Engagements: ${metrics.totalEngagements?.toLocaleString() || 'N/A'} | Engagement Rate: ${metrics.avgEngagementRate?.toFixed(2) || 'N/A'}%
- Video Views: ${metrics.totalVideoViews?.toLocaleString() || 'N/A'} | Video Completion: ${metrics.avgVideoCompletionRate?.toFixed(1) || 'N/A'}%

QUALITY METRICS:
- Avg Quality Score: ${metrics.avgQualityScore?.toFixed(1) || 'N/A'}/10 | Relevance Score: ${metrics.avgRelevanceScore?.toFixed(1) || 'N/A'}/10
- Avg Impression Share: ${metrics.avgImpressionShare?.toFixed(1) || 'N/A'}%

Platform Breakdown:
${metrics.platformBreakdown.map((p: any) => 
  `- ${p.platform}: $${p.spend.toLocaleString()} spend, ${p.ctr}% CTR, ${p.conversions} conversions, $${p.cpa.toFixed(2)} CPA, $${p.revenue?.toFixed(2) || 'N/A'} revenue, ${p.roas?.toFixed(2) || 'N/A'}x ROAS, Quality: ${p.qualityScore?.toFixed(1) || 'N/A'}/10, Impression Share: ${p.impressionShare?.toFixed(1) || 'N/A'}%`
).join('\n')}

Trends (vs. previous period):
- Spend: ${metrics.trends.spendChange > 0 ? '+' : ''}${metrics.trends.spendChange}%
- Impressions: ${metrics.trends.impressionsChange > 0 ? '+' : ''}${metrics.trends.impressionsChange}%
- CTR: ${metrics.trends.ctrChange > 0 ? '+' : ''}${metrics.trends.ctrChange}%
- Conversions: ${metrics.trends.conversionsChange > 0 ? '+' : ''}${metrics.trends.conversionsChange}%
- Revenue: ${metrics.trends.revenueChange > 0 ? '+' : ''}${metrics.trends.revenueChange || 'N/A'}%
- ROAS: ${metrics.trends.roasChange > 0 ? '+' : ''}${metrics.trends.roasChange || 'N/A'}%
- Quality Score: ${metrics.trends.qualityScoreChange > 0 ? '+' : ''}${metrics.trends.qualityScoreChange || 'N/A'}

Your capabilities:
1. Analyze comprehensive campaign performance with 50+ metrics per platform
2. Identify trends, patterns, and optimization opportunities across all metrics
3. Provide data-driven, actionable recommendations based on quality scores, impression share, funnel performance, device breakdown, engagement rates, video performance, and more
4. Compare platform performance across multiple dimensions (ROAS, quality, engagement, device performance)
5. Analyze conversion funnels to identify drop-off points and optimization opportunities
6. Explain metrics and their business impact
7. Generate professional visualizations using the generate_chart tool

CHART GENERATION GUIDELINES:
When users ask questions, determine if a chart would enhance understanding, then use the generate_chart tool:

CHART TYPE SELECTION:
- **line**: Trends over time (CTR trends, ROAS over time, quality score trends, video completion trends, engagement rate changes)
- **bar**: Platform comparisons, metric comparisons across channels (spend by platform, conversions by device, quality scores comparison)
- **pie**: Distribution analysis (budget allocation, device share, platform revenue share, traffic source breakdown)
- **area**: Cumulative metrics, stacked performance (cumulative revenue, stacked platform spend over time)
- **funnel**: Conversion funnel analysis (clicks → landing page → add to cart → checkout → purchase), showing drop-off rates at each stage
- **comparison**: Period-over-period analysis, before/after comparisons, A/B test results (this week vs last week, mobile vs desktop)

EXAMPLES OF CHART-WORTHY QUESTIONS:
- "Which platform performs best?" → bar chart comparing ROAS, conversions, or quality scores by platform
- "Show conversion funnel" → funnel chart with stages: clicks → LP views → add to cart → checkout → purchase
- "How is budget distributed?" → pie chart of spend by platform
- "Mobile vs desktop performance?" → comparison chart or bar chart comparing conversion rates
- "CTR trend over time?" → line chart showing CTR by date
- "Where are users dropping off?" → funnel chart showing each stage with drop-off percentages
- "Video performance comparison?" → bar chart comparing video completion rates by platform
- "Quality score trends?" → line chart showing quality scores over time by platform

WHEN TO GENERATE CHARTS:
- User explicitly asks for visualization ("show me", "chart", "graph", "visualize")
- Question involves comparison of 3+ items
- Question asks about trends over time
- Question asks about funnel or conversion path
- Question asks about distribution or breakdown
- Question would be clearer with visual representation

Always be concise, data-driven, and actionable. Reference specific metrics (ROAS, quality scores, impression share, funnel drop-offs, device performance, engagement rates) to support recommendations. Focus on insights that drive business results.`;

    // Define chart generation tool
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_chart",
          description: "Generate a chart visualization to answer the user's question about campaign performance",
          parameters: {
            type: "object",
            properties: {
              chartType: {
                type: "string",
                enum: ["line", "bar", "pie", "area", "funnel", "comparison"],
                description: "Type of chart to generate"
              },
              title: {
                type: "string",
                description: "Title for the chart"
              },
              data: {
                type: "array",
                description: "Array of data points for the chart",
                items: {
                  type: "object"
                }
              },
              xAxis: {
                type: "string",
                description: "Key for x-axis data"
              },
              metrics: {
                type: "array",
                description: "Array of metric keys to display",
                items: {
                  type: "string"
                }
              }
            },
            required: ["chartType", "title", "data", "metrics"]
          }
        }
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        tools: tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const toolCalls = data.choices[0].message.tool_calls;

    let chartData = null;
    if (toolCalls && toolCalls.length > 0) {
      const chartTool = toolCalls.find((tool: any) => tool.function.name === 'generate_chart');
      if (chartTool) {
        try {
          chartData = JSON.parse(chartTool.function.arguments);
        } catch (e) {
          console.error('Error parsing chart data:', e);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        chart: chartData 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Chat assistant error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Sorry, I encountered an error processing your request. Please try again.'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
