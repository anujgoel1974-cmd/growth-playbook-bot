import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, analysisData, conversationState, userRole } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Detect if message is an edit command
    const editIntent = detectEditIntent(message);
    
    // Build system prompt
    const systemPrompt = buildSystemPrompt(userRole, analysisData, conversationState);

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_followup_questions',
              description: 'Suggest 3-4 relevant follow-up questions the user might want to ask',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of follow-up question strings'
                  }
                },
                required: ['questions']
              }
            }
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API request failed');
    }

    const aiData = await response.json();
    const aiMessage = aiData.choices[0].message;
    
    // Extract response and follow-up questions
    let responseText = aiMessage.content || '';
    let followUpQuestions: string[] = [];

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.function.name === 'suggest_followup_questions') {
          const args = JSON.parse(toolCall.function.arguments);
          followUpQuestions = args.questions || [];
        }
      }
    }

    // Determine action type
    let actionType = 'info';
    let updatedData = null;

    if (editIntent) {
      actionType = 'update_campaign';
      updatedData = applyEdit(analysisData, editIntent);
      responseText += `\n\n✓ Updated ${editIntent.field}: ${editIntent.newValue}`;
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        followUpQuestions,
        actionType,
        updatedData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Campaign chat assistant error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Sorry, I encountered an error. Please try again.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function buildSystemPrompt(userRole: string, analysisData: any, conversationState: string): string {
  const roleDescription = getUserRoleDescription(userRole);
  
  let prompt = `You are an expert AI marketing strategist helping ${roleDescription} build effective advertising campaigns.

Your personality:
- Conversational and friendly, like a knowledgeable colleague
- Use emojis sparingly to add warmth (1-2 per message max)
- Explain complex concepts simply
- Be concise but thorough
- Always provide actionable insights

Current conversation state: ${conversationState}

`;

  if (analysisData) {
    prompt += `\nYou have access to the following analysis data:\n`;
    
    if (analysisData.customerInsight) {
      prompt += `- Customer insights: ${analysisData.customerInsight.length} personas identified\n`;
    }
    if (analysisData.competitiveAnalysis) {
      prompt += `- Competitor analysis: ${analysisData.competitiveAnalysis.competitors?.length || 0} competitors\n`;
    }
    if (analysisData.mediaPlan) {
      prompt += `- Media plan: ${analysisData.mediaPlan.length} weeks planned\n`;
      prompt += `- Campaigns: ${analysisData.mediaPlan[0]?.channels?.length || 0} platform strategies\n`;
    }
  }

  prompt += `\nWhen answering questions:
1. Reference specific data from the analysis when relevant
2. Explain WHY recommendations were made
3. Compare options when discussing alternatives
4. Be honest if you don't have enough data to answer
5. Suggest next steps or related questions

If the user requests changes to campaigns (e.g., "increase Google budget to $500"):
1. Acknowledge the change clearly
2. Explain how it affects the overall strategy
3. Suggest complementary adjustments if needed
4. Always maintain a positive, solution-oriented tone

Keep responses under 150 words unless explaining complex topics.`;

  return prompt;
}

function getUserRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    'Founder/CEO': 'a founder focused on growth and ROI',
    'Marketing Manager': 'a marketing manager optimizing campaign performance',
    'Digital Marketer': 'a digital marketing specialist',
    'Performance Marketer': 'a performance marketer focused on data-driven results',
    'Creative/Designer': 'a creative professional working on ad campaigns',
    'Agency Professional': 'an agency professional managing client campaigns',
    'Freelancer': 'a freelance marketer',
    'Student/Learning': 'someone learning about digital marketing',
  };
  return descriptions[role] || 'a marketing professional';
}

interface EditIntent {
  field: string;
  platform?: string;
  newValue: string | number;
}

function detectEditIntent(message: string): EditIntent | null {
  const lowerMessage = message.toLowerCase();

  // Budget changes
  const budgetMatch = lowerMessage.match(/(increase|raise|boost|decrease|lower|reduce).*?(budget|spend).*?(?:to |by )?\$?(\d+)/i);
  if (budgetMatch) {
    const platform = extractPlatform(message);
    return {
      field: platform ? `${platform} budget` : 'budget',
      platform,
      newValue: parseInt(budgetMatch[3]),
    };
  }

  // Objective changes
  const objectiveMatch = lowerMessage.match(/change.*?objective.*?to.*?(maximize|target|awareness|conversion|traffic)/i);
  if (objectiveMatch) {
    return {
      field: 'objective',
      newValue: objectiveMatch[1],
    };
  }

  return null;
}

function extractPlatform(message: string): string | null {
  const platforms = ['google', 'meta', 'facebook', 'instagram', 'tiktok', 'pinterest', 'youtube', 'linkedin'];
  const lowerMessage = message.toLowerCase();
  
  for (const platform of platforms) {
    if (lowerMessage.includes(platform)) {
      return platform === 'facebook' || platform === 'instagram' ? 'Meta' : 
             platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  }
  return null;
}

function applyEdit(analysisData: any, editIntent: EditIntent): any {
  if (!analysisData?.mediaPlan) return analysisData;

  const updatedMediaPlan = [...analysisData.mediaPlan];
  
  if (editIntent.field.includes('budget') && editIntent.platform) {
    // Update specific platform budget
    for (const week of updatedMediaPlan) {
      const channel = week.channels.find((c: any) => 
        c.name.toLowerCase() === editIntent.platform?.toLowerCase()
      );
      if (channel) {
        channel.budget = editIntent.newValue;
        // Recalculate percentages
        const totalBudget = week.channels.reduce((sum: number, c: any) => sum + c.budget, 0);
        week.channels.forEach((c: any) => {
          c.percentage = Math.round((c.budget / totalBudget) * 100);
        });
      }
    }
  }

  return {
    ...analysisData,
    mediaPlan: updatedMediaPlan,
  };
}
