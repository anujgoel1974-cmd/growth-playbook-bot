import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to scrape competitor products
async function scrapeCompetitorProducts(domain: string, limit: number = 3) {
  try {
    console.log(`[Research Agent] Scraping products from: ${domain}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`https://${domain}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MarketingAnalysisBot/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`[Research Agent] Failed to fetch ${domain}: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const products: Array<{
      name: string;
      price: string;
      imageUrl: string;
      productUrl: string;
    }> = [];
    
    // Try multiple common selectors for product listings
    const productSelectors = [
      'article.product',
      '.product-item',
      '[itemtype*="Product"]',
      '.product-card',
      '[data-product]'
    ];
    
    let foundProducts = false;
    for (const selector of productSelectors) {
      if (foundProducts) break;
      
      $(selector).slice(0, limit).each((_, element) => {
        const $el = $(element);
        
        // Extract product name
        const name = $el.find('h2, h3, .product-title, [itemprop="name"]')
          .first()
          .text()
          .trim()
          .substring(0, 100) || 'Unknown Product';
        
        // Extract price
        const priceText = $el.find('.price, [itemprop="price"], .product-price')
          .first()
          .text()
          .trim()
          .replace(/\s+/g, ' ') || 'Price unavailable';
        
        // Extract image
        const img = $el.find('img').first();
        let imageUrl = img.attr('src') || img.attr('data-src') || '';
        
        // Handle relative URLs
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = imageUrl.startsWith('//') 
            ? `https:${imageUrl}` 
            : `https://${domain}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        
        // Extract product URL
        const link = $el.find('a').first();
        let productUrl = link.attr('href') || '';
        if (productUrl && !productUrl.startsWith('http')) {
          productUrl = `https://${domain}${productUrl.startsWith('/') ? '' : '/'}${productUrl}`;
        }
        
        if (name && name !== 'Unknown Product') {
          products.push({
            name,
            price: priceText,
            imageUrl: imageUrl || '',
            productUrl: productUrl || `https://${domain}`
          });
          foundProducts = true;
        }
      });
    }
    
    console.log(`[Research Agent] Found ${products.length} products from ${domain}`);
    return products;
    
  } catch (error) {
    console.error(`[Research Agent] Error scraping ${domain}:`, error.message);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, competitors } = await req.json();
    console.log('[Research Agent] Starting background enhancement for session:', sessionId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to show agent is working
    await supabase.from('analysis_progress').update({
      status: 'enhancing',
      progress_percentage: 50
    }).eq('session_id', sessionId).eq('section_name', 'competitive_analysis');

    console.log('[Research Agent] Scraping competitor products...');

    // Scrape competitor products in parallel (max 3 products per competitor)
    const enrichedCompetitors = await Promise.all(
      competitors.slice(0, 5).map(async (comp: any) => {
        const products = await scrapeCompetitorProducts(comp.domain, 3);
        return { ...comp, products };
      })
    );

    console.log('[Research Agent] Product scraping completed');

    // Get existing insights from the progress table
    const { data: existingProgress } = await supabase
      .from('analysis_progress')
      .select('data')
      .eq('session_id', sessionId)
      .eq('section_name', 'competitive_analysis')
      .single();

    const existingInsights = existingProgress?.data?.insights || [];

    // Update with enriched data
    await supabase.from('analysis_progress').update({
      status: 'completed',
      progress_percentage: 100,
      data: {
        competitors: enrichedCompetitors,
        insights: existingInsights
      },
      completed_at: new Date().toISOString()
    }).eq('session_id', sessionId).eq('section_name', 'competitive_analysis');

    console.log('[Research Agent] Enhancement complete');

    return new Response(JSON.stringify({
      success: true,
      enrichedCount: enrichedCompetitors.filter(c => c.products?.length > 0).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Research Agent] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Research enhancement failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
