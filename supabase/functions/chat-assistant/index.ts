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
    const systemPrompt = `You are a marketing analytics AI assistant for a campaign dashboard showing advertising campaign data.

Current Campaign Data (Last 30 Days):
- Total Spend: $${metrics.totalSpend.toLocaleString()}
- Total Impressions: ${metrics.totalImpressions.toLocaleString()}
- Total Clicks: ${metrics.totalClicks.toLocaleString()}
- Total Conversions: ${metrics.totalConversions}
- Average CTR: ${metrics.avgCTR}%
- Average CPC: $${metrics.avgCPC.toFixed(2)}
- Average CPA: $${metrics.avgCPA.toFixed(2)}
- Conversion Rate: ${metrics.conversionRate}%

Platform Breakdown:
${metrics.platformBreakdown.map((p: any) => 
  `- ${p.platform}: $${p.spend.toLocaleString()} spent, CTR ${p.ctr}%, ${p.conversions} conversions, CPA $${p.cpa.toFixed(2)}`
).join('\n')}

Recent Trends:
- Spending ${metrics.trends.spendChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(metrics.trends.spendChange)}%
- Impressions ${metrics.trends.impressionsChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(metrics.trends.impressionsChange)}%
- CTR ${metrics.trends.ctrChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(metrics.trends.ctrChange)}%
- Conversions ${metrics.trends.conversionsChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(metrics.trends.conversionsChange)}%

Your capabilities:
- Analyze campaign metrics and identify trends
- Compare performance across advertising channels
- Provide actionable optimization recommendations
- Answer questions about advertising best practices
- Reference specific metrics and data points from the dashboard
- Generate visual charts to illustrate insights when helpful

Chart Generation Guidelines:
- Use the generate_chart tool when visualizations would help answer the question
- Choose appropriate chart types:
  * line: for trends over time (CTR, conversions, spend trends)
  * bar: for comparing platforms or campaigns
  * pie: for budget distribution or traffic sources
  * area: for cumulative metrics
  * comparison: for before/after or period comparisons
- Always provide both a text explanation AND a chart when using the tool
- Extract relevant data from the metrics provided to create the chart

Guidelines:
- Be concise and data-driven (2-3 paragraphs unless detailed analysis is requested)
- Always reference specific numbers from the data when making observations
- Provide actionable recommendations
- Use a professional but friendly tone
- Format responses with clear paragraphs for readability
- When a question asks about trends, comparisons, or distributions, consider using a chart`;

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
                enum: ["line", "bar", "pie", "area", "comparison"],
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
