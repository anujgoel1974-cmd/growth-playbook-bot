import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Analyzing URL:', url);

    if (!url) {
      throw new Error('URL is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Fetch the landing page content
    console.log('Fetching landing page content...');
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LandingPageAnalyzer/1.0)',
      },
    });

    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status}`);
    }

    const htmlContent = await pageResponse.text();
    console.log('Page fetched successfully, content length:', htmlContent.length);

    // Extract basic information from HTML (simplified extraction)
    const extractText = (html: string): string => {
      // Remove script and style tags
      let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      // Remove HTML tags
      text = text.replace(/<[^>]+>/g, ' ');
      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();
      return text.substring(0, 8000); // Limit content size
    };

    const pageContent = extractText(htmlContent);
    console.log('Extracted text content length:', pageContent.length);

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are an AdTech strategist AI. 
Given this product landing page content, produce two structured outputs:

1. CUSTOMER INSIGHT (tab 1):
- Extreme detail of potential target customer personas (demographics, psychographics, jobs-to-be-done, lifestyle, pain points).
- Tonality/personality of these buyers.
- Their decision-making style and trust signals.
- External macro/market factors influencing demand for this product.

2. CAMPAIGN TARGETING (tab 2):
- Translate the above into a structured campaign plan for SMB founders to run paid ads.
- Platforms: Google Ads (Search, Performance Max, YouTube) & Meta Ads (FB/IG).
- Provide: 
  * Audience stack (demographics, interests, job titles, lookalikes, exclusions).
  * Keyword clusters (with negatives).
  * Campaign types & budget splits (prospecting, retargeting, brand).
  * Recommended daily budgets & scaling playbook.
  * Ad creative kit: sample headlines, primary texts, descriptions, CTAs, image/video briefs.
  * Example API-ready payloads (Google Ads JSON, Meta Marketing API JSON, CSV snippets for product feed).

Output must be:
- Extremely detailed but clearly structured with headings/subsections.
- Written for a time-strapped SMB founder: simple, consumable, and actionable.
- Use bullet points, tables, and section dividers for readability.
- Format your response as JSON with two main sections: "customerInsight" and "campaignTargeting".
- Each section should have subsections as objects with "title" and "content" fields.`;

    console.log('Calling OpenAI API...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this landing page content and provide structured insights:\n\n${pageContent}` }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received successfully');
    
    const analysisText = openAIData.choices[0].message.content;
    
    // Try to parse as JSON, fallback to text if not JSON
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch {
      // If not JSON, structure it as text
      analysisData = {
        customerInsight: {
          raw: analysisText.split('CAMPAIGN TARGETING')[0] || analysisText
        },
        campaignTargeting: {
          raw: analysisText.split('CAMPAIGN TARGETING')[1] || ''
        }
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisData,
        url: url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-landing-page function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
