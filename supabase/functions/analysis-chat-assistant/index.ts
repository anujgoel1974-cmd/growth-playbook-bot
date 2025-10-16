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
    const { message, conversationHistory, analysisData, userRole } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Extract key insights from analysis data for context
    const customerInsights = analysisData?.customerInsight?.map((c: any) => 
      `${c.title}: ${c.content.substring(0, 200)}`
    ).join('\n') || 'No customer insights available';

    const competitorInfo = analysisData?.competitiveAnalysis?.competitors?.map((c: any) =>
      `${c.competitorName}: ${c.keyStrength} (weakness: ${c.weakness})`
    ).join('\n') || 'No competitor data available';

    const trendInfo = analysisData?.trendAnalysis?.slice(0, 3).map((t: any) =>
      `${t.headline} (${t.timeframe}): ${t.productAlignment.substring(0, 100)}`
    ).join('\n') || 'No trend data available';

    const targetingInfo = analysisData?.campaignTargeting?.map((t: any) =>
      `${t.title}: ${t.content.substring(0, 150)}`
    ).join('\n') || 'No targeting data available';

    const adCreativeCount = analysisData?.adCreatives?.length || 0;
    const channels = [...new Set(analysisData?.adCreatives?.map((a: any) => a.channel) || [])].join(', ');

    const mediaPlanSummary = analysisData?.mediaPlan?.map((week: any) =>
      `Week ${week.weekNumber}: ${week.channels.map((ch: any) => `${ch.name} ($${ch.budget})`).join(', ')}`
    ).join('\n') || 'No media plan available';

    // Helper functions for role-based personalization
    function getUserRoleDescription(role: string): string {
      const descriptions: Record<string, string> = {
        'Founder/CEO': 'founders and CEOs focused on business growth',
        'Marketing Manager': 'marketing managers executing campaigns',
        'Marketing Analyst': 'marketing analysts optimizing performance',
        'Content Creator': 'content creators developing ad assets',
        'Agency Professional': 'agency professionals managing client campaigns',
        'Freelancer': 'freelance marketers running multiple campaigns',
        'Other': 'small business owners and marketers'
      };
      return descriptions[role] || descriptions['Other'];
    }

    function getExpertiseLevel(role: string): string {
      const levels: Record<string, string> = {
        'Founder/CEO': 'Strategic, business-focused',
        'Marketing Manager': 'Intermediate to advanced marketing',
        'Marketing Analyst': 'Advanced analytical and data-focused',
        'Content Creator': 'Creative and brand-focused',
        'Agency Professional': 'Advanced multi-client management',
        'Freelancer': 'Practical and efficiency-focused',
        'Other': 'Beginner to intermediate'
      };
      return levels[role] || levels['Other'];
    }

    function getRolePrimaryConcerns(role: string): string {
      const concerns: Record<string, string> = {
        'Founder/CEO': 'ROI, growth rate, competitive advantage, brand building',
        'Marketing Manager': 'Campaign execution, budget management, team coordination, timeline delivery',
        'Marketing Analyst': 'Data accuracy, optimization opportunities, attribution, performance tracking',
        'Content Creator': 'Creative quality, brand consistency, engagement, storytelling',
        'Agency Professional': 'Client satisfaction, reportable results, scalability, efficiency',
        'Freelancer': 'Time efficiency, cost-effectiveness, portfolio building, client retention',
        'Other': 'Learning, getting started, avoiding mistakes, achieving results'
      };
      return concerns[role] || concerns['Other'];
    }

    function getRoleCommunicationStyle(role: string): string {
      const styles: Record<string, string> = {
        'Founder/CEO': '- Use business language and focus on strategic outcomes\n- Connect tactics to business KPIs\n- Be concise and executive-friendly\n- Emphasize competitive positioning',
        'Marketing Manager': '- Provide step-by-step execution guidance\n- Include resource and timeline considerations\n- Balance strategy with practical tactics\n- Suggest team workflows',
        'Marketing Analyst': '- Use data-driven language with specific metrics\n- Include statistical reasoning\n- Suggest measurement frameworks\n- Reference industry benchmarks',
        'Content Creator': '- Focus on creative strategy and storytelling\n- Provide visual and copy direction\n- Use inspirational, creative language\n- Suggest content variations',
        'Agency Professional': '- Use professional, client-ready language\n- Focus on demonstrable ROI\n- Include competitive context\n- Suggest reporting approaches',
        'Freelancer': '- Emphasize time-saving tactics\n- Suggest reusable frameworks\n- Focus on high-impact, low-effort wins\n- Provide automation opportunities',
        'Other': '- Use plain language and explain terms\n- Be educational and supportive\n- Break down complex concepts\n- Provide learning resources'
      };
      return styles[role] || styles['Other'];
    }

    // Build comprehensive system prompt
    const systemPrompt = `You are an AI campaign strategy assistant helping ${getUserRoleDescription(userRole || 'Other')} launch their marketing campaigns.

USER CONTEXT:
- Role: ${userRole || 'small business owner'}
- Expertise Level: ${getExpertiseLevel(userRole || 'Other')}
- Primary Concerns: ${getRolePrimaryConcerns(userRole || 'Other')}

COMMUNICATION STYLE FOR THIS ROLE:
${getRoleCommunicationStyle(userRole || 'Other')}

CAMPAIGN ANALYSIS CONTEXT:

CUSTOMER INSIGHTS:
${customerInsights}

COMPETITIVE LANDSCAPE:
${competitorInfo}

TREND OPPORTUNITIES:
${trendInfo}

CAMPAIGN TARGETING STRATEGY:
${targetingInfo}

AD CREATIVES:
- Total variations: ${adCreativeCount}
- Recommended channels: ${channels}

MEDIA PLAN:
${mediaPlanSummary}

YOUR ROLE:
You help SMB founders understand their campaign analysis and make confident launch decisions. You:

1. **Explain in Plain English**: Avoid jargon. If you use terms like "CTR", "ROAS", or "CPA", explain them simply.

2. **Be Action-Oriented**: Give specific, step-by-step guidance. Don't just say "optimize" - say HOW to optimize.

3. **Budget-Conscious**: Most founders have limited budgets ($500-2000/month). Always consider cost-effectiveness.

4. **Beginner-Friendly**: Assume they're setting up their first campaign. Walk through platform setup if asked.

5. **Priority-Focused**: Help them understand what matters most when starting (e.g., start with 1-2 platforms, test with small budgets, focus on conversion tracking).

6. **Realistic Expectations**: Set honest timelines for results (typically 2-4 weeks to gather meaningful data).

7. **Competitor-Aware**: Help them differentiate from competitors using the competitive analysis data.

8. **Trend-Savvy**: Suggest how to leverage current trends from the trend analysis.

COMMON FOUNDER QUESTIONS TO ANTICIPATE:
- Which platform to start with (consider their budget, product, and target audience)
- How to split limited budgets (suggest 60-40 or 70-30 splits, not 6-way splits)
- What success looks like in week 1, 2, 3, 4
- How to set up tracking and measure ROI
- Which ad creative to prioritize (guide them based on the analysis)
- How to use competitor insights without copying
- When to scale vs when to pause

RESPONSE STYLE:
- Start with a direct answer
- Follow with 2-3 specific action steps
- End with what to expect or watch for
- Use bullet points for clarity
- Reference specific data from the analysis when relevant

Always be encouraging and supportive - launching a first campaign can be intimidating!

FOLLOW-UP QUESTION GENERATION:
After answering, you will be asked to suggest exactly 4 natural follow-up questions that:
1. Build directly on the current answer's context
2. Address likely founder concerns based on the topic just discussed
3. Are specific and actionable (not generic questions like "what else?")
4. Progress the conversation toward campaign launch readiness

Examples of good follow-up progression:
- If you just explained platform selection → suggest budget allocation questions
- If you discussed budget → suggest timeline/expectations questions
- If you covered setup steps → suggest optimization/testing questions
- If you explained metrics → suggest interpretation/action questions`;

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided (last 10 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
    } else {
      // If no history, just add the current message
      messages.push({ role: 'user', content: message });
    }

    // Define tool for follow-up question generation
    const tools = [
      {
        type: 'function',
        function: {
          name: 'suggest_followup_questions',
          description: 'Generate 4 contextually relevant follow-up questions based on the conversation',
          parameters: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                description: 'Array of exactly 4 follow-up questions',
                items: {
                  type: 'string',
                  description: 'A natural, specific follow-up question'
                },
                minItems: 4,
                maxItems: 4
              }
            },
            required: ['questions'],
            additionalProperties: false
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
        messages: messages,
        tools: tools,
        tool_choice: { type: 'function', function: { name: 'suggest_followup_questions' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Extract follow-up questions from tool call
    let followUpQuestions: string[] = [];
    try {
      const toolCalls = data.choices[0].message.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        if (toolCall.function.name === 'suggest_followup_questions') {
          const args = JSON.parse(toolCall.function.arguments);
          followUpQuestions = args.questions || [];
        }
      }
    } catch (e) {
      console.warn('Failed to parse follow-up questions:', e);
      // Continue with empty array - graceful degradation
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        followUpQuestions: followUpQuestions,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Analysis chat assistant error:', error);
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
