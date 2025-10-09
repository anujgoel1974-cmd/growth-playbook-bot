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
    const systemPrompt = `You are an expert AdTech strategist analyzing product landing pages for SMB founders.

Analyze the provided landing page content and return a detailed JSON response with this exact structure:

{
  "customerInsight": {
    "personas": "Detailed demographics, psychographics, behaviors, and use-cases",
    "tonality": "How to speak to them, personality cues, and communication style",
    "painPoints": "Problems they face, jobs-to-be-done, and buying triggers",
    "macroFactors": "Industry trends, seasonality, and market opportunities"
  },
  "campaignTargeting": {
    "platforms": "Recommended ad platforms (Google, Meta, YouTube)",
    "audiences": "Target demographics, interests, job titles, exclusions",
    "keywords": "Keyword clusters with exact matches, phrase matches, and negatives",
    "creatives": "Example headlines, primary text, CTAs, image/video concepts",
    "budgets": "Campaign types (prospecting/retargeting/brand), daily budgets, and scaling rules"
  }
}

Be extremely detailed and actionable. Use bullet points and clear formatting.`;

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
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: `Analyze this product landing page:\n\n${pageContent}` 
          }
        ],
        response_format: { type: "json_object" },
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
    console.log('Full OpenAI response:', JSON.stringify(openAIData, null, 2));
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', openAIData);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const analysisText = openAIData.choices[0].message.content;
    console.log('Analysis text length:', analysisText?.length || 0);
    console.log('Analysis text preview:', analysisText?.substring(0, 500) || 'EMPTY');
    
    if (!analysisText || analysisText.trim() === '') {
      throw new Error('OpenAI returned empty content');
    }
    
    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
      console.log('Successfully parsed JSON response');
      console.log('Parsed data structure:', {
        hasCustomerInsight: !!analysisData.customerInsight,
        hasCampaignTargeting: !!analysisData.campaignTargeting,
        customerInsightKeys: Object.keys(analysisData.customerInsight || {}),
        campaignTargetingKeys: Object.keys(analysisData.campaignTargeting || {})
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response text:', analysisText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Ensure the data structure matches what the frontend expects
    const structuredData = {
      customerInsight: analysisData.customerInsight || {},
      campaignTargeting: analysisData.campaignTargeting || {}
    };

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
