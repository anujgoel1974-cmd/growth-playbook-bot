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

    // Prepare the prompt for OpenAI with structured output
    const systemPrompt = `You are an AdTech strategist AI analyzing product landing pages.
Provide detailed customer insights and campaign targeting recommendations.
Be extremely detailed, structured, and actionable for SMB founders.`;

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
            content: `Analyze this landing page and provide insights in JSON format with two main sections:

1. "customerInsight" with subsections:
   - "personas": Demographics, psychographics, behaviors
   - "tonality": How to speak to them
   - "painPoints": Problems and motivators
   - "macroFactors": Market trends and influences

2. "campaignTargeting" with subsections:
   - "platforms": Recommended ad platforms
   - "audiences": Targeting details (demographics, interests)
   - "keywords": Keyword clusters and negatives
   - "creatives": Ad copy examples (headlines, CTAs, descriptions)
   - "budgets": Campaign types, budget splits, scaling rules

Landing page content:\n\n${pageContent}` 
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
    
    const analysisText = openAIData.choices[0].message.content;
    console.log('Analysis text preview:', analysisText.substring(0, 200));
    
    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback: structure the text response
      analysisData = {
        customerInsight: {
          overview: {
            title: "Customer Insight",
            content: analysisText.split('campaignTargeting')[0] || analysisText
          }
        },
        campaignTargeting: {
          overview: {
            title: "Campaign Targeting",
            content: analysisText.split('campaignTargeting')[1] || 'No campaign targeting data available'
          }
        }
      };
    }

    // Ensure the data structure matches what the frontend expects
    const structuredData = {
      customerInsight: analysisData.customerInsight || {},
      campaignTargeting: analysisData.campaignTargeting || {}
    };

    console.log('Structured data keys:', {
      customerInsight: Object.keys(structuredData.customerInsight),
      campaignTargeting: Object.keys(structuredData.campaignTargeting)
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
