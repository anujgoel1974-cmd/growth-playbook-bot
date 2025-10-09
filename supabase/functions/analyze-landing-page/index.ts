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
• Persona 1: [Name/description]
• Persona 2: [Name/description]
• Persona 3: [Name/description]

### Demographics
• Age: [age range]
• Gender: [gender split]
• Income: [income range]
• Location: [geographic focus]

### Psychographics
• Values: [core values]
• Interests: [key interests]
• Lifestyle: [lifestyle traits]
• Aspirations: [goals/desires]

### Pain Points
• Pain 1: [specific problem]
• Pain 2: [specific problem]
• Pain 3: [specific problem]

### Decision Triggers
• Trigger 1: [what makes them buy]
• Trigger 2: [what makes them buy]
• Trigger 3: [what makes them buy]

### Communication Style
• Tone: [messaging tone]
• Language: [vocabulary style]
• Approach: [communication strategy]

## CAMPAIGN TARGETING

### Google Ads
• Keywords: [top search terms]
• Audience: [targeting parameters]
• Campaign Type: [search/display/shopping]
• Budget: [recommended allocation]

### Meta Ads
• Platforms: [Facebook/Instagram focus]
• Audience: [detailed targeting]
• Creative: [ad format recommendations]
• Budget: [recommended allocation]

### Pinterest Ads
• Visual Strategy: [pin style recommendations]
• Audience: [interest targeting]
• Campaign Focus: [awareness/consideration]
• Budget: [recommended allocation]
(Only include if relevant to product)

### TikTok Ads
• Content Style: [video approach]
• Audience: [demographic targeting]
• Creative: [ad format]
• Budget: [recommended allocation]
(Only include if relevant to product)

### YouTube Ads
• Video Strategy: [content approach]
• Audience: [targeting parameters]
• Ad Format: [skippable/non-skippable]
• Budget: [recommended allocation]
(Only include if relevant to product)

### LinkedIn Ads
• Targeting: [job titles/industries]
• Content: [messaging approach]
• Campaign: [sponsored content/InMail]
• Budget: [recommended allocation]
(Only include if relevant to product)

Landing page content:
${pageContent}

CRITICAL: Use the bullet format shown above with labels followed by colons (e.g., "• Age: 25-45"). Keep each point concise.`;

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
    
    // Helper function to map subsection titles to icons and channels
    const getIconForSection = (title: string): string => {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('persona') || lowerTitle.includes('demographic')) return 'users';
      if (lowerTitle.includes('psychographic') || lowerTitle.includes('behavior')) return 'brain';
      if (lowerTitle.includes('pain') || lowerTitle.includes('trigger')) return 'zap';
      if (lowerTitle.includes('communication') || lowerTitle.includes('messaging')) return 'message-circle';
      if (lowerTitle.includes('market') || lowerTitle.includes('context')) return 'trending-up';
      if (lowerTitle.includes('google')) return 'search';
      if (lowerTitle.includes('meta') || lowerTitle.includes('facebook') || lowerTitle.includes('instagram')) return 'share-2';
      if (lowerTitle.includes('pinterest')) return 'image';
      if (lowerTitle.includes('tiktok')) return 'music';
      if (lowerTitle.includes('youtube')) return 'video';
      if (lowerTitle.includes('linkedin')) return 'briefcase';
      if (lowerTitle.includes('platform')) return 'target';
      if (lowerTitle.includes('audience') || lowerTitle.includes('segment')) return 'users-round';
      if (lowerTitle.includes('keyword')) return 'hash';
      if (lowerTitle.includes('creative') || lowerTitle.includes('visual')) return 'palette';
      if (lowerTitle.includes('budget') || lowerTitle.includes('allocation')) return 'dollar-sign';
      if (lowerTitle.includes('campaign') || lowerTitle.includes('type')) return 'megaphone';
      return 'file-text';
    };

    const getChannelColor = (title: string): string => {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('google')) return 'google';
      if (lowerTitle.includes('meta') || lowerTitle.includes('facebook') || lowerTitle.includes('instagram')) return 'meta';
      if (lowerTitle.includes('pinterest')) return 'pinterest';
      if (lowerTitle.includes('tiktok')) return 'tiktok';
      if (lowerTitle.includes('youtube')) return 'youtube';
      if (lowerTitle.includes('linkedin')) return 'linkedin';
      return 'default';
    };

    // Parse subsections from markdown with sub-items
    const parseSubsections = (content: string, isTargeting = false) => {
      const subsections: Array<{ 
        id: string; 
        title: string; 
        content: string; 
        icon: string; 
        channel?: string;
        subItems?: Array<{ label: string; value: string }>;
      }> = [];
      const lines = content.split('\n');
      let currentSubsection: { title: string; content: string[] } | null = null;

      for (const line of lines) {
        if (line.trim().startsWith('### ')) {
          // Save previous subsection if exists
          if (currentSubsection) {
            const cleanTitle = currentSubsection.title.replace(/^###\s*/, '').trim();
            const fullContent = currentSubsection.content.join('\n').trim();
            
            // Parse sub-items from bullet points
            const subItems: Array<{ label: string; value: string }> = [];
            const contentLines = fullContent.split('\n');
            
            for (const contentLine of contentLines) {
              const trimmed = contentLine.trim();
              if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                const withoutBullet = trimmed.replace(/^[•\-]\s*/, '');
                const colonIndex = withoutBullet.indexOf(':');
                
                if (colonIndex > 0) {
                  const label = withoutBullet.substring(0, colonIndex).trim();
                  const value = withoutBullet.substring(colonIndex + 1).trim();
                  if (label && value) {
                    subItems.push({ label, value });
                  }
                }
              }
            }
            
            const card: any = {
              id: cleanTitle.toLowerCase().replace(/\s+/g, '-'),
              title: cleanTitle,
              content: fullContent,
              icon: getIconForSection(cleanTitle),
              subItems: subItems.length > 0 ? subItems : undefined
            };
            
            if (isTargeting) {
              card.channel = getChannelColor(cleanTitle);
            }
            subsections.push(card);
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
        const fullContent = currentSubsection.content.join('\n').trim();
        
        // Parse sub-items from bullet points
        const subItems: Array<{ label: string; value: string }> = [];
        const contentLines = fullContent.split('\n');
        
        for (const contentLine of contentLines) {
          const trimmed = contentLine.trim();
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            const withoutBullet = trimmed.replace(/^[•\-]\s*/, '');
            const colonIndex = withoutBullet.indexOf(':');
            
            if (colonIndex > 0) {
              const label = withoutBullet.substring(0, colonIndex).trim();
              const value = withoutBullet.substring(colonIndex + 1).trim();
              if (label && value) {
                subItems.push({ label, value });
              }
            }
          }
        }
        
        const card: any = {
          id: cleanTitle.toLowerCase().replace(/\s+/g, '-'),
          title: cleanTitle,
          content: fullContent,
          icon: getIconForSection(cleanTitle),
          subItems: subItems.length > 0 ? subItems : undefined
        };
        
        if (isTargeting) {
          card.channel = getChannelColor(cleanTitle);
        }
        subsections.push(card);
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
      customerInsightCards = parseSubsections(ciContent, false);
      campaignTargetingCards = parseSubsections(ctContent, true); // Pass true for targeting to add channel info
    } else {
      // Fallback: try to parse any subsections found
      customerInsightCards = parseSubsections(analysisText, false);
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
