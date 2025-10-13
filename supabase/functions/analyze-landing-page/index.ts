import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-authorization, X-Client-Info, X-Supabase-Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// ===============================
// PHASE 2: Helper Functions
// ===============================

// Helper: Store agent output in Supabase
async function storeAgentOutput(
  analysisId: string,
  agentName: string,
  outputData: any
) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/agent_context`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        analysis_id: analysisId,
        agent_name: agentName,
        output_data: outputData
      })
    });
    
    if (!response.ok) {
      console.error(`Failed to store ${agentName} output:`, await response.text());
    } else {
      console.log(`✓ Stored ${agentName} output for analysis ${analysisId}`);
    }
  } catch (error) {
    console.error(`Error storing ${agentName} output:`, error);
  }
}

// Helper: Retrieve agent output from Supabase
async function getAgentOutput(
  analysisId: string,
  agentName: string
): Promise<any> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/agent_context?analysis_id=eq.${analysisId}&agent_name=eq.${agentName}&select=output_data`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        console.log(`✓ Retrieved ${agentName} output for analysis ${analysisId}`);
        return data[0].output_data;
      }
    }
    console.log(`No ${agentName} output found for analysis ${analysisId}`);
    return null;
  } catch (error) {
    console.error(`Error retrieving ${agentName} output:`, error);
    return null;
  }
}

// Helper: Call Lovable AI
async function callAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid AI response structure');
  }
  
  return data.choices[0].message.content;
}

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

    // Helper function to fetch with timeout
    const fetchWithTimeout = async (url: string, timeout = 5000, options: RequestInit = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
    };

    // Helper function to scrape competitor products (optimized with timeouts and limits)
    const scrapeCompetitorProducts = async (domain: string, category: string) => {
      try {
        const categorySlug = (category || 'products').toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        // Reduced from 6 to 3 most common URL patterns for faster execution
        const possibleUrls = [
          `https://${domain}/collections/${categorySlug}`,
          `https://${domain}/shop/${categorySlug}`,
          `https://${domain}`
        ];

        // Common product href patterns across platforms (Shopify, Magento, custom)
        const productHrefPatterns = [
          /<a[^>]*href=["']([^"']*\/products\/[^"']+)["'][^>]*>/gi,
          /<a[^>]*href=["']([^"']*\/product\/[^"']+)["'][^>]*>/gi,
          /<a[^>]*href=["']([^"']*\/p\/[^"']+)["'][^>]*>/gi,
          /<a[^>]*href=["']([^"']*\/item\/[^"']+)["'][^>]*>/gi,
          /<a[^>]*href=["']([^"']*productId=[^"']+)["'][^>]*>/gi,
        ];

        for (const testUrl of possibleUrls) {
          try {
            console.log(`Attempting to scrape: ${testUrl}`);
            // Use fetchWithTimeout with 5 second timeout
            const response = await fetchWithTimeout(testUrl, 5000, {
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

            // Gather potential product links
            const linkSet = new Set<string>();
            for (const pattern of productHrefPatterns) {
            const matches = [...html.matchAll(pattern)];
              matches.forEach(m => linkSet.add(m[1]));
              if (linkSet.size >= 4) break; // Reduced from 6 to 4
            }
            const uniqueLinks = [...linkSet].slice(0, 2); // Reduced from 3 to 2 products per competitor

            for (const link of uniqueLinks) {
              const fullUrl = link.startsWith('http') ? link : `https://${domain}${link.startsWith('/') ? '' : '/'}${link}`;
              try {
                // Use fetchWithTimeout for product pages too
                const productResponse = await fetchWithTimeout(fullUrl, 5000, {
                  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProductAnalyzer/1.0)' },
                });
                if (!productResponse.ok) continue;

                const productHtml = await productResponse.text();

                // Extract product name
                let name = 'Product';
                const titleMatch = productHtml.match(/<title>([^<]+)<\/title>/i) || productHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i) || productHtml.match(/itemprop=["']name["'][^>]*content=["']([^"']+)["']/i);
                if (titleMatch) {
                  name = (titleMatch[1] || '').split('|')[0].trim();
                }

                // Extract price
                let price = '';
                const pricePatterns = [
                  /₹\s*[\d,]+(?:\.\d{2})?/i,
                  /rs\.?\s*[\d,]+(?:\.\d{2})?/i,
                  /inr\s*[\d,]+(?:\.\d{2})?/i,
                  /\$\s*[\d,]+(?:\.\d{2})?/i,
                  /€\s*[\d,]+(?:\.\d{2})?/i,
                  /£\s*[\d,]+(?:\.\d{2})?/i,
                  /itemprop=["']price["'][^>]*content=["']([^"']+)["']/i,
                  /data-price=["']([^"']+)["']/i
                ];
                for (const pattern of pricePatterns) {
                  const match = productHtml.match(pattern);
                  if (match) { price = match[0] || match[1]; break; }
                }

                // Extract image
                let imageUrl = '';
                const ogImg = productHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                const productImg = productHtml.match(/<img[^>]*class=["'][^"']*(product|primary|main)[^"']*["'][^>]*src=["']([^"']+)["']/i);
                const anyImg = productHtml.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
                if (ogImg) imageUrl = ogImg[1];
                else if (productImg) imageUrl = productImg[2];
                else if (anyImg) imageUrl = anyImg[1];
                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = `https://${domain}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                }

                if (name && price && imageUrl) {
                  products.push({ name, price, imageUrl, productUrl: fullUrl });
                }
                
                // Early exit if we have 2 products (faster completion)
                if (products.length >= 2) {
                  break;
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
            // Continue to next URL even on timeout
            continue;
          }
        }

        return [];
      } catch (error) {
        console.error('Error scraping competitor:', error);
        return [];
      }
    };

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

    // Parse competitors section and scrape real products (optimized with parallel scraping)
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

      // Helper: finalize current competitor (WITHOUT scraping - we'll do that in parallel later)
      const flushCompetitor = () => {
        if (currentCompetitor && currentCompetitor.competitorName && currentCompetitor.domain) {
          competitors.push(currentCompetitor);
          console.log('parseCompetitors: queued competitor', currentCompetitor.competitorName);
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
          flushCompetitor();

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
            if (label.includes('domain') || label.includes('website') || label.includes('site') || label.includes('url')) {
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
            flushCompetitor();
          }
          continue;
        }
      }

      // Flush any remaining competitor data
      flushCompetitor();

      console.log('parseCompetitors: total competitors', competitors.length);
      
      // OPTIMIZATION: Now scrape all competitors in PARALLEL instead of sequentially
      if (competitors.length > 0) {
        console.log('Starting parallel scraping for all competitors...');
        
        const scrapingPromises = competitors.map(async (comp, index) => {
          console.log(`parseCompetitors: started competitor ${comp.competitorName}`);
          const catSlug = (comp.category || 'products').toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
          
          try {
            // Scrape products
            const products = await scrapeCompetitorProducts(comp.domain, catSlug);
            comp.products = products;
            
            // Generate ad copy if we have products
            if (products.length > 0 && lovableApiKey) {
              try {
                const adCopyPrompt = `Based on this real competitor brand "${comp.competitorName}" and their actual product "${products[0].name}" priced at ${products[0].price}, generate 3 realistic ad copy examples they would likely run on different platforms. Keep it concise and authentic to their brand positioning as ${comp.marketPosition}.

Format:
**Platform Name:**
• Headline: [realistic headline]
• Description: [realistic description]

Generate for: Meta Feed, Google Search, and Google Display.`;

                const adCopyResponse = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', 10000, {
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
                  
                  comp.adCopyExamples = adCopyExamples;
                }
              } catch (error) {
                console.error(`Error generating ad copy for ${comp.competitorName}:`, error);
              }
            }
            
            console.log(`parseCompetitors: pushed competitor ${comp.competitorName}`);
            return { success: true, competitor: comp };
          } catch (error) {
            console.error(`Error scraping competitor ${comp.competitorName}:`, error);
            // Return competitor with empty products on error (graceful degradation)
            comp.products = [];
            comp.adCopyExamples = [];
            return { success: false, competitor: comp };
          }
        });
        
        // Wait for all scraping to complete (or fail)
        const results = await Promise.allSettled(scrapingPromises);
        
        // Log results
        const successful = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Competitive Analysis parsing result: {
  total: ${competitors.length},
  items: [
    ${competitors.map(c => `{ name: "${c.competitorName}", products: ${c.products?.length || 0}, adCopy: ${c.adCopyExamples?.length || 0} }`).join(',\n    ')}
  ]
}`);
      }
      
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
          
          // Find the LAST colon to handle labels like "Image Prompt (1:1 Square): value"
          const colonIndex = withoutBullet.lastIndexOf(':');
          
          if (colonIndex > 0) {
            const label = withoutBullet.substring(0, colonIndex).trim();
            const value = withoutBullet.substring(colonIndex + 1).trim();
            const lowerLabel = label.toLowerCase();
            
            console.log(`🔍 Parsing line - Label: "${label}" | Value: "${value}"`);
            
            // More flexible headline matching - handles "Headline", "Headline 1", "Headlines", "H1", etc.
            if (lowerLabel.includes('headline') || 
                lowerLabel.includes('primary') ||
                lowerLabel.match(/^h\d+$/) ||  // Matches "H1", "H2", etc.
                lowerLabel.includes('title') ||
                lowerLabel.includes('hook') ||
                lowerLabel.includes('main message') ||
                lowerLabel.includes('video title') ||
                lowerLabel.includes('thumbnail text') ||
                lowerLabel.includes('text overlay') ||
                lowerLabel.includes('pin title')) {
              console.log(`✓ Matched headline label: "${label}" -> "${value}"`);
              currentCreative.headlines.push(value);
            } else if (lowerLabel.includes('description') || 
                       lowerLabel.includes('pin description') ||
                       lowerLabel.includes('cta')) {
              console.log(`✓ Matched description label: "${label}" -> "${value}"`);
              currentCreative.descriptions.push(value);
            } else if (lowerLabel.includes('image prompt')) {
              console.log(`✓ Matched image prompt: "${label}" -> "${value}"`);
              currentCreative.imagePrompt = value;
            } else {
              console.log(`⚠ Unmatched label: "${label}"`);
            }
          }
        }
      }

      if (currentCreative && currentCreative.channel) {
        creatives.push(currentCreative);
      }

      // Add validation and fallbacks if needed
      for (const creative of creatives) {
        if (creative.headlines.length === 0) {
          console.warn(`⚠ No headlines parsed for ${creative.channel} - ${creative.placement}. Adding fallback.`);
          creative.headlines.push('Quality Product Available Now');
        }
        if (creative.descriptions.length === 0) {
          console.warn(`⚠ No descriptions parsed for ${creative.channel} - ${creative.placement}. Adding fallback.`);
          creative.descriptions.push('Discover our premium collection today.');
        }
      }

      return creatives;
    };

    // Upload base64 image to Supabase Storage
    const uploadImageToStorage = async (
      base64Image: string,
      filename: string
    ): Promise<string | null> => {
      try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        // Convert base64 to blob
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Upload to storage
        const uploadResponse = await fetch(
          `${SUPABASE_URL}/storage/v1/object/ad-creatives/${filename}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'image/png',
            },
            body: buffer
          }
        );
        
        if (uploadResponse.ok) {
          // Return public URL
          return `${SUPABASE_URL}/storage/v1/object/public/ad-creatives/${filename}`;
        } else {
          const errorText = await uploadResponse.text();
          console.error(`Failed to upload image: ${errorText}`);
          return null;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        return null;
      }
    };

    // Generate images for ad creatives using Gemini
    const generateAdImages = async (
      creatives: Array<any>,
      apiKey: string,
      analysisId: string
    ): Promise<Array<any>> => {
      const updatedCreatives: Array<any> = [];
      
      console.log(`🖼️ Starting image generation for ${creatives.length} creatives`);
      
      for (const creative of creatives) {
        if (creative.imagePrompt && creative.imagePrompt.trim().length > 0) {
          try {
            console.log(`🎨 Generating image for ${creative.channel} - ${creative.placement}...`);
            
            // Enhanced prompt with aspect ratio instructions
            const aspectRatioMap: Record<string, string> = {
              '1:1': 'square 1:1 format, centered composition',
              '9:16': 'vertical 9:16 format for mobile stories, full-screen immersive',
              '2:3': 'vertical 2:3 Pinterest-optimized format',
              '16:9': 'horizontal 16:9 landscape format for YouTube thumbnails',
              '1.91:1': 'horizontal 1.91:1 banner format for display ads'
            };
            const aspectInstruction = aspectRatioMap[creative.imageAspectRatio || '1:1'];
            const enhancedPrompt = `${aspectInstruction}. Ultra high resolution. ${creative.imagePrompt}`;
            
            console.log(`   Prompt: ${enhancedPrompt.substring(0, 100)}...`);
            
            const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [{
                  role: 'user',
                  content: [{ type: 'text', text: enhancedPrompt }]
                }],
                modalities: ['image', 'text']
              }),
            });
            
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const generatedBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              
              if (generatedBase64) {
                // Upload to storage
                const filename = `${analysisId}/${creative.channelType}-${creative.placement.replace(/\s+/g, '-')}-${Date.now()}.png`;
                const publicUrl = await uploadImageToStorage(generatedBase64, filename);
                
                if (publicUrl) {
                  console.log(`✅ Image generated and stored for ${creative.channel}`);
                  updatedCreatives.push({ ...creative, imageUrl: publicUrl });
                } else {
                  console.warn(`⚠ Image generated but upload failed for ${creative.channel}`);
                  updatedCreatives.push(creative);
                }
              } else {
                console.warn(`⚠ No image in AI response for ${creative.channel}`);
                updatedCreatives.push(creative);
              }
            } else {
              const errorText = await imageResponse.text();
              console.error(`❌ AI generation failed for ${creative.channel}: ${imageResponse.status} - ${errorText}`);
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

    // ===============================
    // PHASE 3 & 4: Agent Functions + Orchestration
    // ===============================

    // Generate analysis ID for this agentic flow
    const analysisId = crypto.randomUUID();
    console.log('🎯 Starting agentic analysis:', analysisId);

    // AGENT 1: Customer Insight Agent
    const runCustomerInsightAgent = async (pageContent: string) => {
      console.log('🤖 [Customer Insight Agent] Starting...');
      
      const systemPrompt = `You are a customer insight specialist. Your role is to analyze landing pages and extract ONLY customer insights. Focus on delivering practical, data-driven insights about the target audience.`;
      
      const userPrompt = `Analyze this landing page and provide ONLY customer insights. Use ### for subsection headers.

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

Landing page content:
${pageContent}`;

      const response = await callAI(systemPrompt, userPrompt, lovableApiKey);
      
      // Parse the response
      const lower = response.toLowerCase();
      const ciIdx = lower.indexOf('## customer insight');
      const ciContent = ciIdx !== -1 ? response.slice(ciIdx).trim() : response;
      const insightCards = parseSubsections(ciContent, false);
      
      const insightData = {
        rawText: response,
        cards: insightCards
      };
      
      await storeAgentOutput(analysisId, 'customer-insight', insightData);
      console.log('✓ [Customer Insight Agent] Complete');
      
      return insightData;
    };

    // AGENT 2: Competitive Analysis Agent
    const runCompetitiveAnalysisAgent = async (pageContent: string) => {
      console.log('🤖 [Competitive Analysis Agent] Starting...');
      
      const systemPrompt = `You are a competitive intelligence analyst. Your role is to identify real competing brands and analyze their market positioning.`;
      
      const userPrompt = `Identify 3-4 REAL competing brands in the same product category and price range as the analyzed URL. For each competitor, provide their domain, category, price point, key strength, weakness, and market position.

Structure your response EXACTLY as shown:

## COMPETITIVE ANALYSIS

### Competitor 1: [Real Brand Name]
• Domain: [www.competitorbrand.com] (MUST be a real, established brand website)
• Category: [product category]
• Price Point: [their typical pricing range]
• Key Strength: [what they do better]
• Weakness: [opportunity gap]
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

### Your Competitive Advantages
• Advantage 1: [specific differentiator]
• Advantage 2: [specific differentiator]
• Advantage 3: [specific differentiator]

### Areas for Improvement
• Gap 1: [what competitors do better]
• Gap 2: [what competitors do better]

Landing page content:
${pageContent}`;

      const response = await callAI(systemPrompt, userPrompt, lovableApiKey);
      
      // Parse competitors
      const lower = response.toLowerCase();
      const caIdx = lower.indexOf('## competitive analysis');
      const caContent = caIdx !== -1 ? response.slice(caIdx).trim() : response;
      const competitors = await parseCompetitors(caContent);
      
      // Parse non-competitor insights
      const insights = parseSubsections(caContent, false).filter(card => 
        !card.title.toLowerCase().includes('competitor')
      );
      
      const competitiveData = {
        rawText: response,
        competitors,
        insights
      };
      
      await storeAgentOutput(analysisId, 'competitive-analysis', competitiveData);
      console.log('✓ [Competitive Analysis Agent] Complete');
      
      return competitiveData;
    };

    // AGENT 3: Campaign Targeting Agent
    const runCampaignTargetingAgent = async (
      pageContent: string,
      customerInsight: any,
      competitive: any
    ) => {
      console.log('🤖 [Campaign Targeting Agent] Starting...');
      console.log('📥 Using customer insight data:', !!customerInsight);
      console.log('📥 Using competitive data:', !!competitive);
      
      const systemPrompt = `You are a campaign strategist. Create channel-specific campaign strategies based on customer insights and competitive analysis provided.`;
      
      const userPrompt = `Given these customer insights and competitive analysis, create targeting strategies for relevant advertising channels.

CUSTOMER INSIGHTS:
${JSON.stringify(customerInsight, null, 2)}

COMPETITIVE ANALYSIS:
${JSON.stringify(competitive, null, 2)}

Structure your response EXACTLY as shown:

## CAMPAIGN TARGETING

### Google Ads
• Keywords: [top search terms based on pain points]
• Audience: [targeting parameters based on demographics]
• Campaign Type: [search/display/shopping]
• Budget: [recommended allocation]

### Meta Ads
• Platforms: [Facebook/Instagram focus]
• Audience: [detailed targeting based on psychographics]
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

Make sure to directly reference the customer insights (demographics, psychographics, pain points) and competitive advantages in your strategy recommendations.

Landing page content:
${pageContent}`;

      const response = await callAI(systemPrompt, userPrompt, lovableApiKey);
      
      // Parse targeting
      const lower = response.toLowerCase();
      const ctIdx = lower.indexOf('## campaign targeting');
      const ctContent = ctIdx !== -1 ? response.slice(ctIdx).trim() : response;
      const targetingCards = parseSubsections(ctContent, true);
      
      const targetingData = {
        rawText: response,
        cards: targetingCards
      };
      
      await storeAgentOutput(analysisId, 'campaign-targeting', targetingData);
      console.log('✓ [Campaign Targeting Agent] Complete');
      
      return targetingData;
    };

    // Media Plan Agent (simplified - can be enhanced later)
    const runMediaPlanAgent = async (pageContent: string) => {
      console.log('💰 [Media Plan Agent] Starting...');
      
      const systemPrompt = `You are a media planning specialist. Create a 4-6 week media plan with budget allocations.`;
      
      const userPrompt = `Provide a 4-6 week media plan with $100 weekly budget optimized for ROAS. Use this EXACT format:

## MEDIA PLAN

### Week 1
• Google - PMax: $40 (40%)
• Google - Search: $10 (10%)
• Meta - Advantage+: $40 (40%)
• Meta - Retargeting: $10 (10%)
**Reasoning:** [Explain why these channels and allocations for THIS product]

### Week 2
• Google - PMax: $35 (35%)
• Google - Search: $25 (25%)
• Meta - Advantage+: $35 (35%)
• Pinterest - Consideration: $5 (5%)
**Reasoning:** [Explain strategy]

Continue with Weeks 3-6 as needed.

Landing page content:
${pageContent}`;

      const response = await callAI(systemPrompt, userPrompt, lovableApiKey);
      
      // Parse media plan
      const lower = response.toLowerCase();
      const mpIdx = lower.indexOf('## media plan');
      const mpContent = mpIdx !== -1 ? response.slice(mpIdx).trim() : response;
      const mediaPlanWeeks = parseMediaPlan(mpContent);
      
      const mediaPlanData = {
        rawText: response,
        weeks: mediaPlanWeeks
      };
      
      await storeAgentOutput(analysisId, 'media-plan', mediaPlanData);
      console.log('✓ [Media Plan Agent] Complete');
      
      return mediaPlanData;
    };

    // AGENT 4: Creative Generation Agent
    const runCreativeGenerationAgent = async (
      analysisId: string,
      customerInsight: any,
      competitive: any,
      targeting: any,
      productImageUrl: string,
      logoUrl: string
    ) => {
      console.log('🎨 [Creative Generation Agent] Starting...');
      console.log('📥 Using customer insight data:', !!customerInsight);
      console.log('📥 Using competitive data:', !!competitive);
      console.log('📥 Using targeting data:', !!targeting);
      
      // Helper function to extract clean text from cards
      const extractCardContent = (cards: any[], keyword: string): string => {
        const card = cards?.find((c: any) => c.title.toLowerCase().includes(keyword));
        if (!card) return 'Not available';
        
        if (card.subItems && card.subItems.length > 0) {
          return card.subItems.map((item: any) => `${item.label}: ${item.value}`).join(', ');
        }
        return card.content || 'Not available';
      };

      const demographics = extractCardContent(customerInsight?.cards || [], 'demographic');
      const psychographics = extractCardContent(customerInsight?.cards || [], 'psychographic');
      const painPoints = extractCardContent(customerInsight?.cards || [], 'pain');
      const decisionTriggers = extractCardContent(customerInsight?.cards || [], 'trigger');
      const communicationStyle = extractCardContent(customerInsight?.cards || [], 'communication');
      
      const advantages = competitive?.insights?.find((i: any) => i.title.toLowerCase().includes('advantage'))?.subItems
        ?.map((item: any) => `${item.label}: ${item.value}`).join(', ') || 'Not available';
      
      const marketPosition = competitive?.competitors?.map((c: any) => `${c.competitorName}: ${c.marketPosition}`).join(', ') || 'Not available';
      
      const channelStrategies = targeting?.cards?.map((ch: any) => 
        `- ${ch.title}: ${ch.subItems?.map((item: any) => `${item.label}: ${item.value}`).join(', ')}`
      ).join('\n') || 'Not available';
      
      const systemPrompt = `You are an expert ad copywriter. Generate platform-specific ad creatives that directly leverage customer insights, competitive advantages, and channel strategies.`;
      
      const userPrompt = `Generate platform-specific ad creatives using these insights:

CUSTOMER PROFILE:
Demographics: ${demographics}
Psychographics: ${psychographics}
Pain Points: ${painPoints}
Decision Triggers: ${decisionTriggers}
Communication Style: ${communicationStyle}

COMPETITIVE POSITIONING:
Our Advantages: ${advantages}
Market Position: ${marketPosition}

CHANNEL STRATEGIES:
${channelStrategies}

Create ad copy for each relevant channel that:
1. Addresses the specific pain points identified
2. Emphasizes our competitive advantages
3. Uses the decision triggers
4. Follows the channel-specific strategy
5. Matches the communication style

## AD CREATIVE

CRITICAL FORMATTING RULES (FOLLOW EXACTLY):
1. Each platform MUST start with "### [Platform Name] - [Placement]" (e.g., "### Google Search Ads - Search Placement")
2. Each field MUST use bullet format: "• [Field Name]: [Value]"
3. Field names MUST match EXACTLY as shown below (use "Headline 1", NOT "Headlines" or "Headline")
4. Do NOT add extra text before/after the value
5. Do NOT use variations or plurals in field names

EXAMPLE (follow this format exactly):
### Google Search Ads - Search Placement
• Headline 1: Premium Leather Messenger Bag
• Headline 2: Professional Work Bag for Men
• Headline 3: 15" Laptop Compartment
• Description 1: Full-grain leather messenger bag with organized interior. Perfect for professionals who value quality.
• Description 2: Durable construction meets timeless style. Free shipping on orders over $100.
• Image Prompt (1:1 Square): Professional dark brown leather messenger bag on white background, studio lighting

For each relevant advertising channel, create MULTIPLE placement-specific ad variations optimized for that platform's exact specifications:

### Google Search Ads - Search Placement
• Headline 1: [30 chars max]
• Headline 2: [30 chars max]
• Headline 3: [30 chars max]
• Description 1: [90 chars max]
• Description 2: [90 chars max]
• Image Prompt (1:1 Square): [For Display Network - clean product shot, professional lighting]

### Google Display Ads - Display Placement
• Headline 1: [25 chars max, concise value prop]
• Description 1: [90 chars max]
• Image Prompt (1.91:1 Horizontal): [Banner style - product + benefit text overlay]

### Meta Ads - Feed Placement
• Headline 1: [125 chars - hook + value prop]
• Headline 2: [40 chars - benefit-driven CTA]
• Description 1: [30 chars - supporting detail]
• Image Prompt (1:1 Square): [Lifestyle imagery with product, authentic feel, mobile-optimized]

### Meta Ads - Story Placement
• Headline 1: [15 chars max - ultra-short hook]
• Description 1: [10 chars - "Shop Now", "Learn More"]
• Image Prompt (9:16 Vertical): [Full-screen immersive, product hero shot with minimal text space]

### Pinterest Ads - Pin Placement
• Headline 1: [100 chars - aspirational + keyword-rich]
• Description 1: [500 chars - storytelling with benefits]
• Image Prompt (2:3 Vertical): [Visually striking, bright colors, flat lay or styled, Pinterest aesthetic]

### TikTok Ads - In-Feed Placement
• Headline 1: [15 chars - first 3 seconds overlay]
• Headline 2: [30 chars - mid-video overlay]
• Description 1: [20 chars - end screen]
• Image Prompt (9:16 Vertical): [Dynamic, youth-oriented, mobile-first, bold colors, text overlay space]

### YouTube Ads - Video Placement
• Headline 1: [100 chars - curiosity-driven]
• Headline 2: [5-7 words - bold statement]
• Description 1: [100 chars - above fold]
• Image Prompt (16:9 Horizontal): [Attention-grabbing thumbnail, expressive faces OR dramatic product shot, high contrast]

For each Image Prompt, synthesize insights from the customer profile to create visuals that resonate with the target audience.`;

      const response = await callAI(systemPrompt, userPrompt, lovableApiKey);
      
      // Log the raw response for debugging
      console.log('🔍 Raw AI Response (first 500 chars):', response.substring(0, 500));
      console.log('🔍 Raw AI Response (last 500 chars):', response.substring(Math.max(0, response.length - 500)));
      
      // Parse ad creatives
      const lower = response.toLowerCase();
      const acIdx = lower.indexOf('## ad creative');
      console.log('📍 Found "## ad creative" at index:', acIdx);
      
      const acContent = acIdx !== -1 ? response.slice(acIdx).trim() : response;
      console.log('📝 Content to parse (first 1000 chars):', acContent.substring(0, 1000));
      
      const parsedCreatives = parseAdCreatives(acContent);
      
      console.log(`📊 Parsed ${parsedCreatives.length} ad creatives`);
      parsedCreatives.forEach((c, i) => {
        console.log(`  [${i}] ${c.channel} - ${c.placement}: ${c.headlines.length} headlines, ${c.descriptions.length} descriptions`);
      });
      
      // Generate images
      const creativesWithImages = await generateAdImages(parsedCreatives, lovableApiKey, analysisId);
      
      await storeAgentOutput(analysisId, 'ad-creative', creativesWithImages);
      console.log('✓ [Creative Generation Agent] Complete');
      
      return creativesWithImages;
    };

    // ===============================
    // ORCHESTRATION: Run agents in sequence
    // ===============================

    // PHASE 1: Run Customer Insight & Competitive Analysis in PARALLEL
    console.log('📊 Phase 1: Running Customer Insight & Competitive Analysis in parallel...');
    const [customerInsightData, competitiveData] = await Promise.all([
      runCustomerInsightAgent(pageContent),
      runCompetitiveAnalysisAgent(pageContent)
    ]);

    // PHASE 2: Run Campaign Targeting (needs outputs from Phase 1)
    console.log('🎯 Phase 2: Running Campaign Targeting...');
    const targetingData = await runCampaignTargetingAgent(
      pageContent,
      customerInsightData,
      competitiveData
    );

    // PHASE 3: Run Media Plan (can run independently)
    console.log('💰 Phase 3: Running Media Plan...');
    const mediaPlanData = await runMediaPlanAgent(pageContent);

    // PHASE 4: Run Creative Generation (needs ALL prior outputs)
    console.log('🎨 Phase 4: Running Creative Generation...');
    const creativesData = await runCreativeGenerationAgent(
      analysisId,
      customerInsightData,
      competitiveData,
      targetingData,
      productImageUrl,
      logoUrl
    );

    // Convert agent outputs to frontend format
    const analysis = {
      customerInsight: customerInsightData.cards,
      campaignTargeting: targetingData.cards,
      mediaPlan: mediaPlanData.weeks,
      competitiveAnalysis: {
        competitors: competitiveData.competitors,
        insights: competitiveData.insights
      },
      adCreatives: creativesData
    };

    console.log('✅ Agentic analysis complete:', analysisId);
    console.log('Structured response ready:', {
      customerInsightCards: analysis.customerInsight.length,
      campaignTargetingCards: analysis.campaignTargeting.length,
      mediaPlanWeeks: analysis.mediaPlan.length,
      competitiveAnalysis: { 
        competitors: analysis.competitiveAnalysis.competitors.length, 
        insights: analysis.competitiveAnalysis.insights.length 
      },
      adCreatives: analysis.adCreatives.length
    });

    return new Response(
      JSON.stringify({ success: true, analysis, url, analysisId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-landing-page function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
