import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, context } = await req.json();

    console.log('Unified chat request:', { message, contextType: context?.type });

    // Prepare conversation for AI
    const messages = [
      {
        role: 'system',
        content: `You are an AI marketing assistant helping users analyze campaigns and optimize their ad strategies. 
Be concise, actionable, and friendly. Use specific data when available. 
If asked about analytics, focus on insights and recommendations.
If asked about campaign strategies, explain your reasoning clearly.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limits exceeded, please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required, please add funds to your Lovable AI workspace.');
      }
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Generate contextual follow-up questions
    const followUpQuestions = generateFollowUps(message, context?.type);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        followUpQuestions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unified chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: errorMessage,
        response: 'Sorry, I encountered an error processing your request. Please try again.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateFollowUps(message: string, contextType?: string): string[] {
  const lowerMessage = message.toLowerCase();
  
  // Analytics-related follow-ups
  if (lowerMessage.includes('performance') || lowerMessage.includes('campaign') || lowerMessage.includes('metrics')) {
    return [
      'Compare this to last month',
      'What can I optimize?',
      'Show me platform-specific breakdown'
    ];
  }
  
  // Budget-related follow-ups
  if (lowerMessage.includes('budget') || lowerMessage.includes('spend')) {
    return [
      'How can I optimize my budget?',
      'Which platform has the best ROI?',
      'Suggest budget reallocation'
    ];
  }
  
  // Campaign creation follow-ups
  if (contextType === 'campaign_creation') {
    return [
      'Explain the targeting strategy',
      'Why this budget split?',
      'Show me the ad creatives'
    ];
  }
  
  // Default follow-ups
  return [
    'Tell me more',
    'What should I do next?',
    'Show me examples'
  ];
}
