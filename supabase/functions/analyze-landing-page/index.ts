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

    // Extract product image URL from HTML for ad creative generation
    let productImageUrl = '';
    try {
      const ogImageMatch = htmlContent.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImageMatch && ogImageMatch[1]) {
        productImageUrl = ogImageMatch[1];
      } else {
        // Fallback: Look for main product images
        const imgMatch = htmlContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          productImageUrl = imgMatch[1];
        }
      }
      // Ensure absolute URL
      if (productImageUrl && !productImageUrl.startsWith('http')) {
        const urlObj = new URL(url);
        productImageUrl = new URL(productImageUrl, urlObj.origin).href;
      }
      console.log('Extracted product image URL:', productImageUrl);
    } catch (error) {
      console.error('Error extracting product image:', error);
    }

    // Extract logo URL from HTML
    let logoUrl = '';
    try {
      // Try multiple common logo patterns
      const logoPatterns = [
        /<meta[^>]*property=["']og:logo["'][^>]*content=["']([^"']+)["']/i,
        /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["']/i,
        /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
        /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*src=["']([^"']*logo[^"']*)["']/i,
      ];
      
      for (const pattern of logoPatterns) {
        const match = htmlContent.match(pattern);
        if (match && match[1]) {
          logoUrl = match[1];
          break;
        }
      }
      
      // Ensure absolute URL
      if (logoUrl && !logoUrl.startsWith('http')) {
        const urlObj = new URL(url);
        logoUrl = new URL(logoUrl, urlObj.origin).href;
      }
      
      // Filter out SVG icons and very small images (likely favicons)
      if (logoUrl && (logoUrl.includes('.svg') || logoUrl.includes('favicon') || logoUrl.includes('icon'))) {
        // Keep it but log
        console.log('Extracted logo URL (may be icon):', logoUrl);
      } else if (logoUrl) {
        console.log('Extracted logo URL:', logoUrl);
      }
    } catch (error) {
      console.error('Error extracting logo:', error);
    }

    // Helper function to scrape competitor products
    const scrapeCompetitorProducts = async (domain: string, category: string) => {
      try {
        const possibleUrls = [
          `https://${domain}/collections/${category}`,
          `https://${domain}/shop/${category}`,
          `https://${domain}/products/${category}`,
          `https://${domain}/${category}`,
          `https://${domain}`
        ];

        for (const testUrl of possibleUrls) {
          try {
            console.log(`Attempting to scrape: ${testUrl}`);
            const response = await fetch(testUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ProductAnalyzer/1.0)',
              },
            });

            if (!response.ok) continue;

            const html = await response.text();
            const products: Array<{
              name: string;
              price: string;
              imageUrl: string;
              productUrl: string;
            }> = [];

            // Extract products using regex patterns
            const productLinkPattern = /<a[^>]*href=["']([^"']*\/products\/[^"']+)["'][^>]*>/gi;
            const links = [...html.matchAll(productLinkPattern)];
            const uniqueLinks = [...new Set(links.map(m => m[1]))].slice(0, 3);

            for (const link of uniqueLinks) {
              const fullUrl = link.startsWith('http') ? link : `https://${domain}${link}`;
              
              try {
                const productResponse = await fetch(fullUrl, {
                  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProductAnalyzer/1.0)' },
                });
                
                if (!productResponse.ok) continue;
                
                const productHtml = await productResponse.text();
                
                // Extract product name
                let name = 'Product';
                const titleMatch = productHtml.match(/<title>([^<]+)<\/title>/i);
                if (titleMatch) {
                  name = titleMatch[1].split('|')[0].trim();
                }
                
                // Extract price
                let price = '';
                const pricePatterns = [
                  /₹\s*[\d,]+(?:\.\d{2})?/,
                  /\$\s*[\d,]+(?:\.\d{2})?/,
                  /price["']\s*:\s*["']([^"']+)["']/i
                ];
                for (const pattern of pricePatterns) {
                  const match = productHtml.match(pattern);
                  if (match) {
                    price = match[0] || match[1];
                    break;
                  }
                }
                
                // Extract image
                let imageUrl = '';
                const imgMatch = productHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                if (imgMatch) {
                  imageUrl = imgMatch[1];
                  if (!imageUrl.startsWith('http')) {
                    imageUrl = `https://${domain}${imageUrl}`;
                  }
                }
                
                if (name && price && imageUrl) {
                  products.push({ name, price, imageUrl, productUrl: fullUrl });
                }
              } catch (err) {
                console.error('Error fetching product:', err);
              }
            }

            if (products.length > 0) {
              console.log(`Successfully scraped ${products.length} products from ${domain}`);
              return products;
            }
          } catch (err) {
            console.error(`Error trying ${testUrl}:`, err);
          }
        }

        return [];
      } catch (error) {
        console.error('Error scraping competitor:', error);
        return [];
      }
    };

    // Prepare the prompt for AI
    const systemPrompt = `You are an AI marketing analyst specializing in landing page analysis and ad campaign strategy. Your role is to provide actionable insights that marketing teams can use to create highly targeted campaigns. Focus on delivering practical, data-driven recommendations based on the landing page content. 

CRITICAL FORMATTING RULES:
- Use ### for subsection headers (e.g., "### Target Personas", "### Demographics")
- Keep each subsection concise with 3-5 bullet points maximum
- Use bullet points (•) for all lists
- Focus on actionable, specific insights
- Avoid verbose paragraphs
- YOU MUST INCLUDE ALL FIVE MAIN SECTIONS: Customer Insight, Campaign Targeting, Media Plan, Competitive Analysis, AND Ad Creative`;
    
    const userPrompt = `Analyze this landing page and provide comprehensive insights for marketing campaigns.

IMPORTANT: You MUST provide ALL FIVE sections below. Do not skip any section.

Structure your response EXACTLY as shown:

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

CRITICAL: Use the bullet format shown above with labels followed by colons (e.g., "• Age: 25-45"). Keep each point concise.

## MEDIA PLAN

CRITICAL: You MUST include this section with a 4-6 week breakdown.

Provide a 4-6 week media plan with $100 weekly budget optimized for ROAS. Use this EXACT format:

### Week 1
• Google - PMax: $40 (40%)
• Google - Search: $10 (10%)
• Meta - Advantage+: $40 (40%)
• Meta - Retargeting: $10 (10%)
**Reasoning:** Initial discovery phase focusing on broad reach through PMax and Advantage+ to identify high-intent audiences. Small search budget for brand protection. Testing messaging with visual platforms ideal for this product category.

### Week 2
• Google - PMax: $35 (35%)
• Google - Search: $25 (25%)
• Meta - Advantage+: $35 (35%)
• Pinterest - Consideration: $5 (5%)
**Reasoning:** Scaling search as brand awareness grows and search volume increases. Testing Pinterest for visual product discovery given the product's visual appeal and target demographic.

### Week 3
• Google - PMax: $30 (30%)
• Google - Search: $25 (25%)
• Meta - Advantage+: $35 (35%)
• Pinterest - Consideration: $10 (10%)
**Reasoning:** Data-driven optimization phase. Scaling Pinterest based on early results from Week 2. Maintaining search presence for growing brand queries.

### Week 4
• Google - PMax: $30 (30%)
• Google - Search: $20 (20%)
• Meta - Advantage+: $35 (35%)
• Meta - Retargeting: $15 (15%)
**Reasoning:** Increasing retargeting budget as pixel matures and cart abandonment data accumulates. For high-ticket items, retargeting becomes crucial in Week 4+ as consideration time is longer.

For each week, you MUST include a "**Reasoning:**" line explaining WHY these specific channels and allocations make sense for THIS product based on the landing page content (target audience, price point, product category, visual appeal, etc.). Continue with Weeks 5-6 if needed.

## COMPETITIVE ANALYSIS

CRITICAL: Identify 3-4 REAL competing brands in the same product category and price range as the analyzed URL.

For each competitor, provide:

### Competitor 1: [Real Brand Name]
• Domain: [www.competitorbrand.com] (MUST be a real, established brand website)
• Category: [product category, e.g., "designer bags", "home decor"]
• Price Point: [their typical pricing range]
• Key Strength: [what they do better than the analyzed page]
• Weakness: [opportunity gap where analyzed page could win]
• Market Position: [premium/mid-range/budget, established/emerging]

### Competitor 2: [Real Brand Name]
• Domain: [www.competitorbrand.com]
• Category: [product category]
• Price Point: [their typical pricing range]
• Key Strength: [what they do better]
• Weakness: [opportunity gap]
• Market Position: [premium/mid-range/budget, established/emerging]

### Competitor 3: [Real Brand Name]
• Domain: [www.competitorbrand.com]
• Category: [product category]
• Price Point: [their typical pricing range]
• Key Strength: [what they do better]
• Weakness: [opportunity gap]
• Market Position: [premium/mid-range/budget, established/emerging]

(Include 4th competitor if highly relevant)

### Your Competitive Advantages
• Advantage 1: [specific differentiator vs competitors]
• Advantage 2: [specific differentiator vs competitors]
• Advantage 3: [specific differentiator vs competitors]

### Areas for Improvement
• Gap 1: [what competitors do better]
• Gap 2: [what competitors do better]
• Gap 3: [what competitors do better]

### Market Positioning Strategy
• Current Position: [where you stand in the market]
• Recommended Position: [strategic positioning recommendation]
• Messaging Angle: [unique angle to emphasize]

### Pricing Analysis
• Your Price: [analyzed page pricing]
• Market Average: [competitive average]
• Strategy: [pricing strategy recommendation]
• Justification: [how to justify your price point]

### Feature Differentiation
• Unique Features: [features you have that competitors don't]
• Missing Features: [features competitors offer that you lack]
• Features to Highlight: [competitive advantages to emphasize in marketing]

### Trust & Credibility Comparison
• Your Trust Signals: [reviews, testimonials, badges on analyzed page]
• Competitor Trust Signals: [what competitors use]
• Recommendations: [how to improve trust signals]

## AD CREATIVE

For each relevant advertising channel, create MULTIPLE placement-specific ad variations optimized for that platform's exact specifications.

### Google Search Ads - Search Placement
• Headline 1: [30 chars max]
• Headline 2: [30 chars max]
• Headline 3: [30 chars max]
• Description 1: [90 chars max]
• Description 2: [90 chars max]
• Image Prompt (1:1 Square): [For Display Network - clean product shot, professional lighting]

### Google Display Ads - Display Placement
• Headline: [25 chars max, concise value prop]
• Description: [90 chars max]
• Image Prompt (1.91:1 Horizontal): [Banner style - product + benefit text overlay]

### Meta Ads - Feed Placement
• Primary Text: [125 chars - hook + value prop]
• Headline: [40 chars - benefit-driven CTA]
• Description: [30 chars - supporting detail]
• Image Prompt (1:1 Square): [Lifestyle imagery with product, authentic feel, mobile-optimized]

### Meta Ads - Story Placement
• Text Overlay: [15 chars max - ultra-short hook]
• CTA: [10 chars - "Shop Now", "Learn More"]
• Image Prompt (9:16 Vertical): [Full-screen immersive, product hero shot with minimal text space]

### Pinterest Ads - Pin Placement
• Pin Title: [100 chars - aspirational + keyword-rich]
• Pin Description: [500 chars - storytelling with benefits]
• Image Prompt (2:3 Vertical): [Visually striking, bright colors, flat lay or styled, Pinterest aesthetic]

### TikTok Ads - In-Feed Placement
• Hook Text: [15 chars - first 3 seconds overlay]
• Main Message: [30 chars - mid-video overlay]
• CTA: [20 chars - end screen]
• Image Prompt (9:16 Vertical): [Dynamic, youth-oriented, mobile-first, bold colors, text overlay space]

### YouTube Ads - Video Placement
• Video Title: [100 chars - curiosity-driven]
• Thumbnail Text: [5-7 words - bold statement]
• Description: [100 chars - above fold]
• Image Prompt (16:9 Horizontal): [Attention-grabbing thumbnail, expressive faces OR dramatic product shot, high contrast]

For each Image Prompt, synthesize insights from:
- Customer Demographics and Psychographics (age, lifestyle, values)
- Pain Points and Decision Triggers (emotions to evoke)
- Competitive Advantages (unique features to highlight)
- Brand colors and style extracted from the landing page
Include specific details about composition, lighting, mood, color palette, and platform-specific best practices.

Landing page content:
${pageContent}

REMEMBER: Include ALL FIVE sections (Customer Insight, Campaign Targeting, Media Plan, Competitive Analysis, AND Ad Creative).`;

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
        max_tokens: 6000,
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
      if (lowerTitle.includes('competitor')) return 'building-2';
      if (lowerTitle.includes('advantage')) return 'shield';
      if (lowerTitle.includes('improvement') || lowerTitle.includes('gap')) return 'alert-circle';
      if (lowerTitle.includes('positioning')) return 'target';
      if (lowerTitle.includes('pricing') || lowerTitle.includes('price')) return 'dollar-sign';
      if (lowerTitle.includes('feature') || lowerTitle.includes('differentiation')) return 'check-circle';
      if (lowerTitle.includes('trust') || lowerTitle.includes('credibility')) return 'award';
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

    // Parse media plan from markdown
    const parseMediaPlan = (content: string) => {
      const weeks: Array<{ 
        weekNumber: number; 
        channels: Array<{ name: string; campaignType: string; budget: number; percentage: number }>; 
        reasoning?: string;
      }> = [];
      const lines = content.split('\n');
      let currentWeek: { 
        weekNumber: number; 
        channels: Array<{ name: string; campaignType: string; budget: number; percentage: number }>; 
        reasoning?: string;
      } | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Detect week headers
        if (trimmed.startsWith('### Week')) {
          if (currentWeek) {
            weeks.push(currentWeek);
          }
          const weekMatch = trimmed.match(/Week (\d+)/i);
          const weekNum = weekMatch ? parseInt(weekMatch[1]) : weeks.length + 1;
          currentWeek = {
            weekNumber: weekNum,
            channels: [],
            reasoning: undefined
          };
        } else if (currentWeek && (trimmed.startsWith('•') || trimmed.startsWith('-'))) {
          // Parse budget line: "• Google - PMax: $40 (40%)"
          const withoutBullet = trimmed.replace(/^[•\-]\s*/, '');
          const match = withoutBullet.match(/^(.+?)\s*-\s*(.+?):\s*\$(\d+(?:\.\d+)?)\s*\((\d+)%\)/);
          
          if (match) {
            const [, channel, campaignType, budget, percentage] = match;
            currentWeek.channels.push({
              name: channel.trim(),
              campaignType: campaignType.trim(),
              budget: parseFloat(budget),
              percentage: parseInt(percentage)
            });
          }
        } else if (currentWeek && trimmed.startsWith('**Reasoning:**')) {
          // Extract reasoning text after "**Reasoning:**"
          const reasoningText = trimmed.replace(/^\*\*Reasoning:\*\*\s*/, '').trim();
          currentWeek.reasoning = reasoningText;
        }
      }

      if (currentWeek) {
        weeks.push(currentWeek);
      }

      return weeks;
    };

    // Parse competitors section and scrape real products
    const parseCompetitors = async (content: string) => {
      const competitors: Array<{ 
        id: string; 
        competitorName: string; 
        url: string;
        domain: string;
        category: string;
        pricePoint: string; 
        keyStrength: string; 
        weakness: string;
        marketPosition: string;
        icon: string;
        products?: Array<{
          name: string;
          price: string;
          imageUrl: string;
          productUrl: string;
        }>;
        adCopyExamples?: Array<{
          platform: string;
          headline: string;
          description: string;
          imageUrl?: string;
        }>;
      }> = [];

      const NON_COMP_SECTION_TITLES = new Set([
        'your competitive advantages',
        'areas for improvement',
        'market positioning strategy',
        'pricing analysis',
        'feature differentiation',
        'trust & credibility comparison',
        'strategic insights',
        'competitive insights'
      ]);

      const lines = content.split('\n');
      let currentCompetitor: any = null;

      // Helper: finalize current competitor and scrape products
      const flushCompetitor = async () => {
        if (currentCompetitor && currentCompetitor.competitorName && currentCompetitor.domain) {
          // Scrape real products from competitor
          console.log(`Scraping products for ${currentCompetitor.competitorName} (${currentCompetitor.domain})...`);
          const products = await scrapeCompetitorProducts(currentCompetitor.domain, currentCompetitor.category || 'products');
          currentCompetitor.products = products;
          
          // Generate realistic ad copy based on their products (if we have them)
          if (products.length > 0 && lovableApiKey) {
            try {
              const adCopyPrompt = `Based on this real competitor brand "${currentCompetitor.competitorName}" and their actual product "${products[0].name}" priced at ${products[0].price}, generate 3 realistic ad copy examples they would likely run on different platforms. Keep it concise and authentic to their brand positioning as ${currentCompetitor.marketPosition}.

Format:
**Platform Name:**
• Headline: [realistic headline]
• Description: [realistic description]

Generate for: Meta Feed, Google Search, and Google Display.`;

              const adCopyResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${lovableApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash',
                  messages: [
                    { role: 'user', content: adCopyPrompt }
                  ],
                  max_tokens: 1000,
                }),
              });

              if (adCopyResponse.ok) {
                const adData = await adCopyResponse.json();
                const adText = adData.choices[0].message.content;
                
                // Parse the ad copy from response
                const adCopyExamples: Array<{ platform: string; headline: string; description: string }> = [];
                const adLines = adText.split('\n');
                let currentAd: any = null;
                
                for (const line of adLines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('**') && trimmed.includes(':')) {
                    if (currentAd) adCopyExamples.push(currentAd);
                    currentAd = { platform: trimmed.replace(/\*\*/g, '').replace(':', '').trim(), headline: '', description: '' };
                  } else if (currentAd && trimmed.startsWith('•')) {
                    const withoutBullet = trimmed.replace(/^•\s*/, '');
                    if (withoutBullet.toLowerCase().includes('headline:')) {
                      currentAd.headline = withoutBullet.split(':')[1].trim();
                    } else if (withoutBullet.toLowerCase().includes('description:')) {
                      currentAd.description = withoutBullet.split(':')[1].trim();
                    }
                  }
                }
                if (currentAd) adCopyExamples.push(currentAd);
                
                currentCompetitor.adCopyExamples = adCopyExamples;
              }
            } catch (error) {
              console.error('Error generating ad copy:', error);
            }
          }
          
          competitors.push(currentCompetitor);
          console.log('parseCompetitors: pushed competitor', currentCompetitor.competitorName);
        }
        currentCompetitor = null;
      };

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        const trimmed = line.trim();
        const lower = trimmed.toLowerCase();

        // Skip the section title line itself (e.g., ## COMPETITIVE ANALYSIS)
        if (/^##\s*competitive analysis\b/i.test(lower)) {
          continue;
        }

        // Detect explicit competitor headers like "### Competitor 2: Brand"
        if (/^#{2,6}\s*competitor\b/i.test(lower) || /^(?:\*\*|__)\s*competitor\b/i.test(lower)) {
          await flushCompetitor();

          // Extract competitor name after optional number and delimiter
          let name = 'Unknown Competitor';
          const headerMatch = trimmed.match(/^#{2,6}\s*Competitor(?:\s+\d+)?\s*[:\-–—]?\s*(.+)/i);
          const boldMatch = trimmed.match(/^(?:\*\*|__)\s*Competitor(?:\s+\d+)?\s*[:\-–—]?\s*(.+?)(?:\*\*|__)\s*$/i);
          if (headerMatch && headerMatch[1]) name = headerMatch[1].trim();
          else if (boldMatch && boldMatch[1]) name = boldMatch[1].trim();

          // Normalize: remove any leading 'Competitor N:' fragments that slipped through
          name = name.replace(/^Competitor\s*\d+\s*[:\-–—]\s*/i, '').trim();

          currentCompetitor = {
            id: `competitor-${competitors.length + 1}`,
            competitorName: name,
            url: '',
            domain: '',
            category: '',
            pricePoint: '',
            keyStrength: '',
            weakness: '',
            marketPosition: '',
            icon: 'building-2',
            products: [],
            adCopyExamples: []
          };
          console.log('parseCompetitors: started competitor', name);
          continue;
        }

        // Parse competitor detail bullets
        if (currentCompetitor && (/^[•\-\*]\s*/.test(trimmed))) {
          const withoutBullet = trimmed.replace(/^[•\-\*]\s*/, '');
          const colonIndex = withoutBullet.indexOf(':');
          if (colonIndex > 0) {
            const label = withoutBullet.substring(0, colonIndex).trim().toLowerCase();
            const value = withoutBullet.substring(colonIndex + 1).trim();
            if (label.includes('domain')) {
              currentCompetitor.domain = value.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            } else if (label.includes('category')) {
              currentCompetitor.category = value;
            } else if (label.includes('price')) {
              currentCompetitor.pricePoint = value;
            } else if (label.includes('strength')) {
              currentCompetitor.keyStrength = value;
            } else if (label.includes('weakness')) {
              currentCompetitor.weakness = value;
            } else if (label.includes('position')) {
              currentCompetitor.marketPosition = value;
            }
          }
          continue;
        }

        // Any other new top-level header ends the current competitor
        if (/^#{2,6}\s+/.test(trimmed) && currentCompetitor) {
          const headerTitle = trimmed.replace(/^#{2,6}\s+/, '').trim().toLowerCase();
          if (NON_COMP_SECTION_TITLES.has(headerTitle)) {
            await flushCompetitor();
          }
          continue;
        }
      }

      // Flush any remaining blocks
      await flushCompetitor();

      console.log('parseCompetitors: total competitors', competitors.length);
      return competitors;
    };

    // Parse ad creatives section
    const parseAdCreatives = (content: string): Array<{
      id: string;
      channel: string;
      channelType: string;
      placement: string;
      headlines: string[];
      descriptions: string[];
      imagePrompt: string;
      imageAspectRatio?: string;
    }> => {
      const creatives: Array<any> = [];
      const lines = content.split('\n');
      let currentCreative: any = null;

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Detect channel headers: "### Google Search Ads - Search Placement"
        if (trimmed.startsWith('### ')) {
          if (currentCreative && currentCreative.channel) {
            creatives.push(currentCreative);
          }
          const fullHeader = trimmed.replace(/^###\s*/, '').trim();
          
          // Parse "Google Search Ads - Search Placement" -> channel + placement
          const parts = fullHeader.split('-').map(p => p.trim());
          const channelName = parts[0];
          const placementRaw = parts.length > 1 ? parts.slice(1).join(' ') : 'default';
          const placement = placementRaw.toLowerCase().replace(/\s+placement$/i, '').trim();
          
          const channelType = channelName.toLowerCase().includes('google') ? 'google'
            : channelName.toLowerCase().includes('meta') ? 'meta'
            : channelName.toLowerCase().includes('pinterest') ? 'pinterest'
            : channelName.toLowerCase().includes('tiktok') ? 'tiktok'
            : channelName.toLowerCase().includes('youtube') ? 'youtube'
            : 'default';
          
          // Determine aspect ratio based on placement
          let aspectRatio = '1:1'; // default square
          if (placement.includes('story') || placement.includes('in-feed') || channelType === 'tiktok') {
            aspectRatio = '9:16';
          } else if (placement.includes('pin') || channelType === 'pinterest') {
            aspectRatio = '2:3';
          } else if (placement.includes('video') || placement.includes('youtube') || channelType === 'youtube') {
            aspectRatio = '16:9';
          } else if (placement.includes('display') && channelType === 'google') {
            aspectRatio = '1.91:1';
          }
          
          currentCreative = {
            id: `${channelName}-${placement}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            channel: channelName,
            channelType,
            placement,
            headlines: [],
            descriptions: [],
            imagePrompt: '',
            imageAspectRatio: aspectRatio
          };
        } else if (currentCreative && (trimmed.startsWith('•') || trimmed.startsWith('-'))) {
          const withoutBullet = trimmed.replace(/^[•\-]\s*/, '');
          const colonIndex = withoutBullet.indexOf(':');
          
          if (colonIndex > 0) {
            const label = withoutBullet.substring(0, colonIndex).trim();
            const value = withoutBullet.substring(colonIndex + 1).trim();
            const lowerLabel = label.toLowerCase();
            
            if (lowerLabel.includes('headline') || lowerLabel.includes('primary text') || 
                lowerLabel.includes('pin title') || lowerLabel.includes('hook') || 
                lowerLabel.includes('main message') || lowerLabel.includes('video title') || 
                lowerLabel.includes('thumbnail text') || lowerLabel.includes('text overlay')) {
              currentCreative.headlines.push(value);
            } else if (lowerLabel.includes('description') || lowerLabel.includes('pin description') || 
                       lowerLabel.includes('cta')) {
              currentCreative.descriptions.push(value);
            } else if (lowerLabel.includes('image prompt')) {
              currentCreative.imagePrompt = value;
            }
          }
        }
      }

      if (currentCreative && currentCreative.channel) {
        creatives.push(currentCreative);
      }

      return creatives;
    };

    // Generate images for ad creatives using Gemini with product image as base
    const generateAdImages = async (
      creatives: Array<any>,
      apiKey: string,
      baseProductImageUrl: string,
      brandLogoUrl: string
    ): Promise<Array<any>> => {
      const updatedCreatives: Array<any> = [];
      
      for (const creative of creatives) {
        if (creative.imagePrompt) {
          try {
            console.log(`Generating image for ${creative.channel}...`);
            
            // Enhanced prompt with aspect ratio instructions
            const aspectRatioMap: Record<string, string> = {
              '1:1': 'square 1:1 format, centered composition',
              '9:16': 'vertical 9:16 format for mobile stories, full-screen immersive',
              '2:3': 'vertical 2:3 Pinterest-optimized format',
              '16:9': 'horizontal 16:9 landscape format for YouTube thumbnails',
              '1.91:1': 'horizontal 1.91:1 banner format for display ads'
            };
            const aspectInstruction = aspectRatioMap[creative.imageAspectRatio || '1:1'];
            
            const enhancedPrompt = `CRITICAL: Generate in ${aspectInstruction}. You MUST keep the main product from the base image EXACTLY as it is - 100% unchanged, same colors, same design, same shape, completely recognizable and intact. DO NOT modify, alter, or reimagine the product itself in any way. ONLY add creative background elements, lighting effects, lifestyle context, or platform-specific styling AROUND the product to make it suitable for ${creative.channel} ${creative.placement} advertising. The product is the hero and must remain perfectly preserved. ${creative.imagePrompt}`;
            
            // Build message content with product image if available
            const messageContent: any[] = [
              {
                type: 'text',
                text: enhancedPrompt
              }
            ];
            
            // Add product image as base for editing/composition
            if (baseProductImageUrl) {
              messageContent.push({
                type: 'image_url',
                image_url: {
                  url: baseProductImageUrl
                }
              });
            }
            
            const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [
                  {
                    role: 'user',
                    content: messageContent
                  }
                ],
                modalities: ['image', 'text']
              }),
            });
            
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              
              if (generatedImage) {
                console.log(`Successfully generated image for ${creative.channel}`);
                updatedCreatives.push({
                  ...creative,
                  imageUrl: generatedImage,
                  logoUrl: brandLogoUrl
                });
              } else {
                console.log(`No image in response for ${creative.channel}`);
                updatedCreatives.push(creative);
              }
            } else {
              console.error(`Failed to generate image for ${creative.channel}: ${imageResponse.status}`);
              updatedCreatives.push(creative);
            }
          } catch (error) {
            console.error(`Error generating image for ${creative.channel}:`, error);
            updatedCreatives.push(creative);
          }
        } else {
          updatedCreatives.push(creative);
        }
      }
      
      return updatedCreatives;
    };

    // Structure the markdown response into sections
    const lower = analysisText.toLowerCase();
    const ciIdx = lower.indexOf('## customer insight');
    const ctIdx = lower.indexOf('## campaign targeting');
    const mpIdx = lower.indexOf('## media plan');
    const caIdx = lower.indexOf('## competitive analysis');
    const acIdx = lower.indexOf('## ad creative');

    let customerInsightCards: Array<{ id: string; title: string; content: string; icon: string; subItems?: Array<{ label: string; value: string }> }> = [];
    let campaignTargetingCards: Array<{ id: string; title: string; content: string; icon: string; channel?: string; subItems?: Array<{ label: string; value: string }> }> = [];
    let mediaPlanWeeks: Array<{ weekNumber: number; channels: Array<{ name: string; campaignType: string; budget: number; percentage: number }> }> = [];
    let competitiveAnalysisData: { competitors: any[]; insights: any[] } | undefined = undefined;
    let adCreatives: Array<any> = [];

    if (ciIdx !== -1 && ctIdx !== -1) {
      const ciContent = analysisText.slice(ciIdx, ctIdx).trim();
      const ctContent = mpIdx !== -1 ? analysisText.slice(ctIdx, mpIdx).trim() : analysisText.slice(ctIdx).trim();
      customerInsightCards = parseSubsections(ciContent, false);
      campaignTargetingCards = parseSubsections(ctContent, true);
      
      // Parse media plan if exists
      if (mpIdx !== -1) {
        const mpContent = caIdx !== -1 ? analysisText.slice(mpIdx, caIdx).trim() : analysisText.slice(mpIdx).trim();
        mediaPlanWeeks = parseMediaPlan(mpContent);
      }
      
      // Parse competitive analysis if exists
      if (caIdx !== -1) {
        const caContent = acIdx !== -1 ? analysisText.slice(caIdx, acIdx).trim() : analysisText.slice(caIdx).trim();
        const competitors = await parseCompetitors(caContent);
        console.log('Competitive Analysis parsing result:', {
          total: competitors.length,
          items: competitors.map(c => ({ name: c.competitorName, products: c.products?.length || 0, adCopy: c.adCopyExamples?.length || 0 }))
        });
        
        // Parse non-competitor subsections as insights
        const insights = parseSubsections(caContent, false).filter(card => 
          !card.title.toLowerCase().includes('competitor')
        );
        
        competitiveAnalysisData = {
          competitors,
          insights
        };
      }

    // Parse ad creative if exists
    if (acIdx !== -1) {
      const acContent = analysisText.slice(acIdx).trim();
      const parsedCreatives = parseAdCreatives(acContent);
      adCreatives = await generateAdImages(parsedCreatives, lovableApiKey, productImageUrl, logoUrl);
    }
    } else {
      customerInsightCards = parseSubsections(analysisText, false);
    }

    const structuredData = {
      customerInsight: customerInsightCards,
      campaignTargeting: campaignTargetingCards,
      mediaPlan: mediaPlanWeeks,
      competitiveAnalysis: competitiveAnalysisData,
      adCreatives: adCreatives.length > 0 ? adCreatives : undefined
    };
    
    console.log('Structured response ready:', {
      customerInsightCards: customerInsightCards.length,
      campaignTargetingCards: campaignTargetingCards.length,
      mediaPlanWeeks: mediaPlanWeeks.length,
      competitiveAnalysis: competitiveAnalysisData ? {
        competitors: competitiveAnalysisData.competitors.length,
        insights: competitiveAnalysisData.insights.length
      } : 'not included',
      adCreatives: adCreatives.length
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
