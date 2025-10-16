import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getRoleSummaryGuidance(role: string): string {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('founder') || roleLower.includes('ceo')) {
    return `Focus on: Business impact, ROI, profitability, strategic opportunities, growth trajectory, 
            competitive positioning. Use executive language with emphasis on revenue and market position.`;
  }
  
  if (roleLower.includes('marketing manager') || roleLower.includes('manager')) {
    return `Focus on: Channel performance comparison, budget efficiency, campaign optimization opportunities, 
            team priorities, tactical improvements. Use actionable marketing language with clear next steps.`;
  }
  
  if (roleLower.includes('analyst') || roleLower.includes('data')) {
    return `Focus on: Data trends, statistical significance, metric correlations, anomaly detection, 
            predictive insights. Use analytical language with data-driven recommendations.`;
  }
  
  if (roleLower.includes('content') || roleLower.includes('creator')) {
    return `Focus on: Creative performance, engagement metrics, audience response, content effectiveness, 
            platform-specific insights. Use creative language with storytelling elements.`;
  }
  
  if (roleLower.includes('agency')) {
    return `Focus on: Client deliverables, competitive benchmarks, efficiency metrics, value demonstration, 
            strategic recommendations. Use client-facing professional language.`;
  }
  
  if (roleLower.includes('small business') || roleLower.includes('business owner')) {
    return `Focus on: Cost-effectiveness, practical next steps, simple wins, revenue impact, 
            time-efficient optimizations. Use plain language with clear action items.`;
  }
  
  return `Focus on: Key performance trends, notable wins and areas for improvement, 
          balanced strategic and tactical insights. Use clear, accessible language.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aggregateMetrics, userRole } = await req.json();
    
    console.log('Generating metrics summary for role:', userRole);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an AI marketing analytics assistant providing personalized campaign summaries.

USER ROLE: ${userRole}
${getRoleSummaryGuidance(userRole)}

CURRENT METRICS:
- Total Spend: $${aggregateMetrics.totalSpend.toLocaleString()}
- Total Conversions: ${aggregateMetrics.totalConversions.toLocaleString()}
- Average CPA: $${aggregateMetrics.avgCPA.toFixed(2)}
- Average ROAS: ${aggregateMetrics.avgROAS.toFixed(1)}x
- Average CTR: ${aggregateMetrics.avgCTR.toFixed(2)}%
- Total Revenue: $${aggregateMetrics.totalRevenue.toLocaleString()}
- Profit: $${aggregateMetrics.totalProfit.toLocaleString()}
- Conversion Rate: ${aggregateMetrics.conversionRate.toFixed(2)}%

TRENDS (vs previous period):
- Spend: ${aggregateMetrics.trends.spendChange > 0 ? '+' : ''}${aggregateMetrics.trends.spendChange.toFixed(1)}%
- Conversions: ${aggregateMetrics.trends.conversionsChange > 0 ? '+' : ''}${aggregateMetrics.trends.conversionsChange.toFixed(1)}%
- CTR: ${aggregateMetrics.trends.ctrChange > 0 ? '+' : ''}${aggregateMetrics.trends.ctrChange.toFixed(1)}%
- Revenue: ${aggregateMetrics.trends.revenueChange > 0 ? '+' : ''}${aggregateMetrics.trends.revenueChange.toFixed(1)}%
- ROAS: ${aggregateMetrics.trends.roasChange > 0 ? '+' : ''}${aggregateMetrics.trends.roasChange.toFixed(1)}%

PLATFORM BREAKDOWN:
${aggregateMetrics.platformBreakdown.map((p: any) => 
  `- ${p.platform}: $${p.spend.toLocaleString()} spend, ${p.conversions} conversions, ${p.roas.toFixed(1)}x ROAS`
).join('\n')}

Generate a concise 3-5 sentence summary that:
1. Opens with a role-appropriate greeting and overall performance assessment
2. Highlights the most important insights for this role
3. Identifies the biggest opportunity or concern
4. Provides 1-2 specific, actionable recommendations
5. Uses language and metrics that matter most to this role

Keep it conversational, insightful, and actionable. No bullet points - use flowing prose.`;

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
          { role: 'user', content: 'Generate the campaign performance summary.' }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error('No summary generated from AI');
    }

    console.log('Summary generated successfully');

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-metrics-summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
