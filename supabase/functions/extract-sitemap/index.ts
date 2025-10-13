import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-authorization, X-Client-Info, X-Supabase-Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface ProductLink {
  url: string;
  title: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  variants?: string[];
  sku?: string;
}

interface Subcategory {
  name: string;
  products: ProductLink[];
}

interface Category {
  name: string;
  subcategories: Subcategory[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error("Homepage URL is required");
    }

    console.log("Fetching homepage:", url);
    
    // Fetch homepage HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LandingPageAnalyzer/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    console.log("HTML fetched, length:", html.length);

    // Extract product links from HTML
    const productLinks = extractProductLinks(html, url);
    console.log("Extracted product links:", productLinks.length);

    if (productLinks.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No products found on this page. Please ensure this is an e-commerce homepage." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch detailed product information for each link
    console.log("Fetching detailed product information...");
    const enrichedProducts = await enrichProductDetails(productLinks);
    console.log("Enriched products:", enrichedProducts.length);

    // Use AI to categorize products
    const categories = await categorizeWithAI(enrichedProducts);
    console.log("Categorized into", categories.length, "categories");

    return new Response(
      JSON.stringify({
        success: true,
        sitemap: {
          homepageUrl: url,
          totalProducts: enrichedProducts.length,
          categories: categories,
          extractedAt: new Date().toISOString(),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in extract-sitemap:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to extract sitemap" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractProductLinks(html: string, baseUrl: string): ProductLink[] {
  const products: ProductLink[] = [];
  const seenUrls = new Set<string>();

  // Extract links that look like product pages
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].trim();

    // Filter for product-like URLs
    if (
      (href.includes('/product') || 
       href.includes('/item') || 
       href.includes('/shop/') ||
       href.includes('/collections/')) &&
      !href.includes('#') &&
      !href.includes('cart') &&
      !href.includes('checkout')
    ) {
      try {
        const fullUrl = new URL(href, baseUrl).href;
        
        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          products.push({
            url: fullUrl,
            title: text || 'Product',
            imageUrl: '',
          });
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }
  }

  // Limit to 50 products for MVP (due to individual page fetching)
  return products.slice(0, 50);
}

async function enrichProductDetails(products: ProductLink[]): Promise<ProductLink[]> {
  const enrichedProducts: ProductLink[] = [];
  
  // Process products in batches to avoid overwhelming the server
  const batchSize = 10;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (product) => {
      try {
        console.log(`Fetching details for: ${product.url}`);
        const response = await fetch(product.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LandingPageAnalyzer/1.0)',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${product.url}: ${response.statusText}`);
          return product; // Return original if fetch fails
        }

        const html = await response.text();
        
        // Extract detailed product information
        const enriched = extractProductDetails(html, product);
        return enriched;
      } catch (error) {
        console.error(`Error enriching product ${product.url}:`, error);
        return product; // Return original if error
      }
    });

    const batchResults = await Promise.all(batchPromises);
    enrichedProducts.push(...batchResults);
  }

  return enrichedProducts;
}

function extractProductDetails(html: string, originalProduct: ProductLink): ProductLink {
  const product = { ...originalProduct };

  // Extract title from multiple possible sources
  const titleMatch = 
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
    html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<title>([^<]+)<\/title>/i);
  
  if (titleMatch && titleMatch[1]) {
    product.title = titleMatch[1].trim();
  }

  // Extract description
  const descMatch = 
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  
  if (descMatch && descMatch[1]) {
    product.description = descMatch[1].trim();
  }

  // Extract price - multiple patterns for different e-commerce platforms
  const priceMatch = 
    html.match(/["']price["']:\s*["']?(\d+\.?\d*)["']?/i) ||
    html.match(/<span[^>]*class=["'][^"']*price[^"']*["'][^>]*>[\s\S]*?([\$£€]\d+\.?\d*)/i) ||
    html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i);
  
  if (priceMatch && priceMatch[1]) {
    product.price = priceMatch[1].trim();
  }

  // Extract main product image
  const imgMatch = 
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<img[^>]*class=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["']/i);
  
  if (imgMatch && imgMatch[1]) {
    let imageUrl = imgMatch[1];
    // Ensure absolute URL
    if (!imageUrl.startsWith('http')) {
      const urlObj = new URL(originalProduct.url);
      imageUrl = new URL(imageUrl, urlObj.origin).href;
    }
    product.imageUrl = imageUrl;
  }

  // Extract SKU
  const skuMatch = 
    html.match(/["']sku["']:\s*["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*property=["']product:retailer_item_id["'][^>]*content=["']([^"']+)["']/i);
  
  if (skuMatch && skuMatch[1]) {
    product.sku = skuMatch[1].trim();
  }

  // Extract variants (sizes, colors, etc.)
  const variants: string[] = [];
  const variantMatches = html.matchAll(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi);
  
  for (const match of variantMatches) {
    const variantText = match[2].trim();
    if (variantText && !variantText.toLowerCase().includes('select') && variantText.length < 50) {
      variants.push(variantText);
    }
  }
  
  if (variants.length > 0) {
    product.variants = variants.slice(0, 10); // Limit to 10 variants
  }

  return product;
}

async function categorizeWithAI(products: ProductLink[]): Promise<Category[]> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!lovableApiKey) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const productList = products.map((p, i) => {
    let details = `${i + 1}. ${p.title}`;
    if (p.price) details += ` ($${p.price})`;
    if (p.sku) details += ` [SKU: ${p.sku}]`;
    if (p.description) details += ` - ${p.description.substring(0, 100)}`;
    if (p.variants && p.variants.length > 0) details += ` (Variants: ${p.variants.join(', ')})`;
    return details;
  }).join('\n');

  const prompt = `You are an e-commerce analyst. Below are ${products.length} product URLs from a website. Categorize them into logical categories and subcategories.

RULES:
1. Create 3-8 main categories
2. Each category should have 2-5 subcategories
3. Distribute products evenly
4. Use clear, concise category names
5. Return ONLY valid JSON, no other text

PRODUCTS:
${productList}

Return JSON in this exact format:
{
  "categories": [
    {
      "name": "Category Name",
      "subcategories": [
        {
          "name": "Subcategory Name",
          "productIndices": [0, 1, 2]
        }
      ]
    }
  ]
}

Use productIndices to reference products by their number (0-indexed).`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI categorization failed: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  // Parse AI response
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  // Map indices back to actual products
  const categories: Category[] = parsed.categories.map((cat: any) => ({
    name: cat.name,
    subcategories: cat.subcategories.map((sub: any) => ({
      name: sub.name,
      products: sub.productIndices.map((idx: number) => products[idx]).filter(Boolean),
    })),
  }));

  return categories;
}
