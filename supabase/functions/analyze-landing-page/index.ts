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

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
    const systemPrompt = `You are an expert AdTech strategist. Analyze product landing pages and provide actionable insights for SMB founders running paid ads.`;

    const userPrompt = `Analyze this product landing page and provide detailed insights in the following format:

## CUSTOMER INSIGHT

### Target Personas
[Detailed demographics, psychographics, behaviors, lifestyle, pain points]

### Communication Style
[How to speak to them, tonality, personality cues]

### Decision Triggers
[What motivates them to buy, trust signals, objections]

### Market Context
[Industry trends, seasonality, competitive factors]

## CAMPAIGN TARGETING

### Recommended Platforms
[Google Ads, Meta Ads, YouTube - with rationale]

### Audience Targeting
[Demographics, interests, job titles, lookalikes, exclusions]

### Keyword Strategy
[Core keywords, long-tail keywords, negative keywords]

### Ad Creative Examples
[Headlines, primary text, CTAs, image/video concepts]

### Budget & Scaling
[Campaign types, daily budgets, scaling rules, CPA targets]

Landing page content:
${pageContent}`;

    console.log('Calling Lovable AI...');
    const openAIResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('Lovable AI error:', openAIResponse.status, errorText);
      throw new Error(`Lovable AI error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Lovable AI response received');
    console.log('Response structure:', JSON.stringify({
      hasChoices: !!openAIData.choices,
      choicesLength: openAIData.choices?.length,
      hasMessage: !!openAIData.choices?.[0]?.message,
      hasContent: !!openAIData.choices?.[0]?.message?.content
    }));
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('Invalid Lovable AI response structure:', JSON.stringify(openAIData, null, 2));
      throw new Error('Invalid response from Lovable AI');
    }
    
    const analysisText = openAIData.choices[0].message.content;
    console.log('Content length:', analysisText?.length || 0);
    console.log('Content preview (first 1000 chars):', analysisText?.substring(0, 1000) || 'EMPTY');
    
    if (!analysisText || analysisText.trim() === '') {
      throw new Error('Lovable AI returned empty content');
    }
    
    // Structure the markdown response into sections
    const sections = analysisText.split('##').filter((s: string) => s.trim());
    
    const customerInsightSection = sections.find((s: string) => s.toLowerCase().includes('customer insight')) || '';
    const campaignTargetingSection = sections.find((s: string) => s.toLowerCase().includes('campaign targeting')) || '';
    
    const structuredData = {
      customerInsight: {
        full: {
          title: "Customer Insight",
          content: customerInsightSection.trim()
        }
      },
      campaignTargeting: {
        full: {
          title: "Campaign Targeting",
          content: campaignTargetingSection.trim()
        }
      }
    };
    
    console.log('Structured response ready:', {
      customerInsightLength: customerInsightSection.length,
      campaignTargetingLength: campaignTargetingSection.length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: structuredData,
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
