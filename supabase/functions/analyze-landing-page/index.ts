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

    // Prepare the prompt for AI
    const systemPrompt = `You are an AI marketing analyst specializing in landing page analysis and ad campaign strategy. Your role is to provide actionable insights that marketing teams can use to create highly targeted campaigns. Focus on delivering practical, data-driven recommendations based on the landing page content. 

CRITICAL FORMATTING RULES:
- Use ### for subsection headers (e.g., "### Target Personas", "### Demographics")
- Keep each subsection concise with 3-5 bullet points maximum
- Use bullet points (•) for all lists
- Focus on actionable, specific insights
- Avoid verbose paragraphs`;
    
    const userPrompt = `Analyze this landing page and provide comprehensive insights for marketing campaigns.

Structure your response in TWO main sections:

## CUSTOMER INSIGHT

### Target Personas
[3-5 bullet points about ideal customer profiles]

### Demographics
[3-5 bullet points: age, gender, income, location]

### Psychographics
[3-5 bullet points: values, interests, lifestyle]

### Pain Points
[3-5 bullet points: problems solved]

### Decision Triggers
[3-5 bullet points: what makes them buy]

### Communication Style
[3-5 bullet points: messaging approach]

## CAMPAIGN TARGETING

### Recommended Platforms
[3-5 bullet points: where to advertise and why]

### Audience Segments
[3-5 bullet points: targeting parameters]

### Keywords
[3-5 bullet points: search terms]

### Ad Creative Direction
[3-5 bullet points: visual and copy recommendations]

### Campaign Types
[3-5 bullet points: campaign focus areas]

### Budget Allocation
[3-5 bullet points: investment priorities]

Landing page content:
${pageContent}

Provide specific, actionable insights. Each subsection MUST have 3-5 concise bullet points.`;

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
      // Fallback: return a friendly placeholder instead of erroring
      const structuredData = {
        customerInsight: { full: { title: 'Customer Insight', content: 'No insights generated due to an upstream AI response format issue. Please try again.' } },
        campaignTargeting: { full: { title: 'Campaign Targeting', content: 'No insights generated due to an upstream AI response format issue. Please try again.' } }
      };
      return new Response(
        JSON.stringify({ success: true, analysis: structuredData, url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const analysisText = openAIData.choices[0].message.content;
    console.log('Content length:', analysisText?.length || 0);
    console.log('Content preview (first 1000 chars):', analysisText?.substring(0, 1000) || 'EMPTY');
    
    if (!analysisText || analysisText.trim() === '') {
      console.warn('Lovable AI returned empty content; using fallback.');
      const structuredData = {
        customerInsight: { full: { title: 'Customer Insight', content: 'No insights generated. Please try again shortly.' } },
        campaignTargeting: { full: { title: 'Campaign Targeting', content: 'No insights generated. Please try again shortly.' } }
      };
      return new Response(
        JSON.stringify({ success: true, analysis: structuredData, url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Helper function to map subsection titles to icons
    const getIconForSection = (title: string): string => {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('persona') || lowerTitle.includes('demographic')) return 'users';
      if (lowerTitle.includes('psychographic') || lowerTitle.includes('behavior')) return 'brain';
      if (lowerTitle.includes('pain') || lowerTitle.includes('trigger')) return 'zap';
      if (lowerTitle.includes('communication') || lowerTitle.includes('messaging')) return 'message-circle';
      if (lowerTitle.includes('market') || lowerTitle.includes('context')) return 'trending-up';
      if (lowerTitle.includes('platform')) return 'target';
      if (lowerTitle.includes('audience') || lowerTitle.includes('segment')) return 'users-round';
      if (lowerTitle.includes('keyword') || lowerTitle.includes('search')) return 'search';
      if (lowerTitle.includes('creative') || lowerTitle.includes('visual')) return 'palette';
      if (lowerTitle.includes('budget') || lowerTitle.includes('allocation')) return 'dollar-sign';
      if (lowerTitle.includes('campaign') || lowerTitle.includes('type')) return 'megaphone';
      return 'file-text';
    };

    // Parse subsections from markdown
    const parseSubsections = (content: string) => {
      const subsections: Array<{ id: string; title: string; content: string; icon: string }> = [];
      const lines = content.split('\n');
      let currentSubsection: { title: string; content: string[] } | null = null;

      for (const line of lines) {
        if (line.trim().startsWith('### ')) {
          // Save previous subsection if exists
          if (currentSubsection) {
            const cleanTitle = currentSubsection.title.replace(/^###\s*/, '').trim();
            subsections.push({
              id: cleanTitle.toLowerCase().replace(/\s+/g, '-'),
              title: cleanTitle,
              content: currentSubsection.content.join('\n').trim(),
              icon: getIconForSection(cleanTitle)
            });
          }
          // Start new subsection
          currentSubsection = {
            title: line.trim(),
            content: []
          };
        } else if (currentSubsection && line.trim() && !line.trim().startsWith('##')) {
          currentSubsection.content.push(line);
        }
      }

      // Save last subsection
      if (currentSubsection) {
        const cleanTitle = currentSubsection.title.replace(/^###\s*/, '').trim();
        subsections.push({
          id: cleanTitle.toLowerCase().replace(/\s+/g, '-'),
          title: cleanTitle,
          content: currentSubsection.content.join('\n').trim(),
          icon: getIconForSection(cleanTitle)
        });
      }

      return subsections;
    };

    // Structure the markdown response into sections
    const lower = analysisText.toLowerCase();
    const ciIdx = lower.indexOf('## customer insight');
    const ctIdx = lower.indexOf('## campaign targeting');

    let customerInsightCards: Array<{ id: string; title: string; content: string; icon: string }> = [];
    let campaignTargetingCards: Array<{ id: string; title: string; content: string; icon: string }> = [];

    if (ciIdx !== -1 && ctIdx !== -1) {
      const ciContent = analysisText.slice(ciIdx, ctIdx).trim();
      const ctContent = analysisText.slice(ctIdx).trim();
      customerInsightCards = parseSubsections(ciContent);
      campaignTargetingCards = parseSubsections(ctContent);
    } else {
      // Fallback: try to parse any subsections found
      customerInsightCards = parseSubsections(analysisText);
    }

    const structuredData = {
      customerInsight: customerInsightCards,
      campaignTargeting: campaignTargetingCards
    };
    
    console.log('Structured response ready:', {
      customerInsightCards: customerInsightCards.length,
      campaignTargetingCards: campaignTargetingCards.length
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
