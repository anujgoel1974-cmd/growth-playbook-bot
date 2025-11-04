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

    // Call Lovable AI Gateway with streaming enabled
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI API error: ${response.statusText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the stream directly with SSE headers
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

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
  
  // CTR-related follow-ups
  if (lowerMessage.includes('ctr') || lowerMessage.includes('click')) {
    return [
      'How can I improve CTR?',
      'Compare CTR across platforms',
      'Show me best performing ads'
    ];
  }
  
  // Conversion-related follow-ups
  if (lowerMessage.includes('conversion') || lowerMessage.includes('cvr')) {
    return [
      'What affects conversion rate?',
      'Optimize landing page for conversions',
      'Compare conversion by audience'
    ];
  }
  
  // ROI/ROAS-related follow-ups
  if (lowerMessage.includes('roi') || lowerMessage.includes('roas') || lowerMessage.includes('return')) {
    return [
      'Which channels have best ROI?',
      'How to increase ROAS?',
      'Budget reallocation suggestions'
    ];
  }
  
  // Analytics-related follow-ups
  if (lowerMessage.includes('performance') || lowerMessage.includes('metrics')) {
    return [
      'Show key trends',
      'What should I focus on?',
      'Platform comparison'
    ];
  }
  
  // Budget-related follow-ups
  if (lowerMessage.includes('budget') || lowerMessage.includes('spend') || lowerMessage.includes('cost')) {
    return [
      'Optimize budget allocation',
      'Which platform has best ROI?',
      'Reduce cost per acquisition'
    ];
  }
  
  // Campaign creation follow-ups
  if (contextType === 'campaign_creation') {
    return [
      'Explain targeting strategy',
      'Why this budget split?',
      'Show ad creatives'
    ];
  }
  
  // Audience/targeting follow-ups
  if (lowerMessage.includes('audience') || lowerMessage.includes('targeting') || lowerMessage.includes('demographic')) {
    return [
      'Who is my best audience?',
      'Refine targeting strategy',
      'Expand to similar audiences'
    ];
  }
  
  // Platform-specific follow-ups
  if (lowerMessage.includes('meta') || lowerMessage.includes('facebook') || lowerMessage.includes('instagram')) {
    return [
      'Meta optimization tips',
      'Instagram vs Facebook performance',
      'Best Meta ad formats'
    ];
  }
  
  if (lowerMessage.includes('google') || lowerMessage.includes('search') || lowerMessage.includes('display')) {
    return [
      'Google Ads optimization',
      'Search vs Display performance',
      'Keyword strategy tips'
    ];
  }
  
  // Default follow-ups based on context
  if (contextType === 'analytics') {
    return [
      'Show me trends',
      'What needs attention?',
      'Export this data'
    ];
  }
  
  // Generic helpful follow-ups
  return [
    'What should I do next?',
    'Show me examples',
    'Explain in more detail'
  ];
}
