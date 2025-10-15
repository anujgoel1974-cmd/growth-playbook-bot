import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdCreative {
  id: string;
  channel: string;
  channelType: string;
  placement: string;
  headlines: string[];
  descriptions: string[];
  imagePrompt: string;
  imageUrl?: string;
  logoUrl?: string;
  imageAspectRatio?: string;
}

interface RegenerateRequest {
  adCreatives: AdCreative[];
  brandInfo: {
    productName: string;
    productCategory: string;
    brandVoice?: string;
  };
  filters: {
    brandVoice: string;
    emotionalHook: string;
    cta: string;
    emphasis: string;
    length: string;
    trendHeadline?: string;
  };
  channelsToRegenerate?: string[]; // If not provided, regenerate all
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adCreatives, brandInfo, filters, channelsToRegenerate }: RegenerateRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Regenerating ad copy and images with filters:`, filters);
    console.log(`Channels to regenerate: ${channelsToRegenerate ? channelsToRegenerate.join(', ') : 'all'}`);

    // Filter creatives to regenerate
    const creativesToRegenerate = channelsToRegenerate 
      ? adCreatives.filter(c => channelsToRegenerate.includes(c.channelType))
      : adCreatives;

    // Extract product image and logo from first creative (they're the same across all)
    const productImageUrl = adCreatives[0]?.imageUrl || '';
    const logoUrl = adCreatives[0]?.logoUrl || '';

    // Build system prompt based on filters
    const systemPrompt = `You are an expert ad copywriter specializing in digital advertising. Your task is to regenerate ad copy with specific style parameters while maintaining platform constraints.

STYLE PARAMETERS:
- Brand Voice: ${filters.brandVoice}
- Emotional Hook: ${filters.emotionalHook}
- Call-to-Action Style: ${filters.cta}
- Content Emphasis: ${filters.emphasis}
- Copy Length Preference: ${filters.length}

BRAND CONTEXT:
- Product: ${brandInfo.productName}
- Category: ${brandInfo.productCategory}
${brandInfo.brandVoice ? `- Brand Voice Notes: ${brandInfo.brandVoice}` : ''}

BRAND VOICE GUIDELINES:
- Professional: Clear, trustworthy, authoritative tone. Focus on expertise and reliability.
- Friendly: Conversational, warm, approachable. Use casual language and speak directly to the customer.
- Playful: Fun, creative, energetic. Use wordplay, humor, and engaging language.
- Luxurious: Elegant, sophisticated, aspirational. Emphasize quality, exclusivity, and premium experience.
- Educational: Informative, helpful, empowering. Focus on teaching and providing value.
- Urgent: Action-oriented, time-sensitive, compelling. Create FOMO and drive immediate action.

EMOTIONAL HOOK GUIDELINES:
- FOMO: Fear of missing out, limited availability, time-sensitive offers.
- Aspiration: Achieve goals, become better, reach potential, transformation.
- Problem-Solution: Address pain points, provide relief, solve specific problems.
- Social Proof: Testimonials, popularity, trust indicators, community validation.
- Exclusivity: Limited access, VIP treatment, premium membership, special selection.
- Value: Cost savings, smart investment, budget-friendly, great deal.

EMPHASIS GUIDELINES:
- Features: Highlight specific product features, specifications, unique attributes.
- Benefits: Focus on outcomes, results, how it improves life, tangible benefits.
- Price/Value: Emphasize pricing, discounts, savings, ROI, affordability.
- Brand Story: Company heritage, mission, values, craftsmanship story.
- Sustainability: Eco-friendly, ethical practices, environmental impact, social responsibility.
- Craftsmanship: Quality, attention to detail, materials, production process.

LENGTH PREFERENCES:
- Short: Concise, punchy, direct. Use minimum character counts.
- Balanced: Standard length, natural flow, complete thoughts.
- Detailed: Maximum character usage, comprehensive, rich descriptions.
${filters.trendHeadline && filters.trendHeadline !== 'none' 
  ? `\nTREND ALIGNMENT:
- Selected Trend: ${filters.trendHeadline}
- Instruction: Incorporate this trending topic into your ad copy. Reference the trend naturally in headlines or descriptions where relevant. Make the connection clear but not forced. Ensure the trend enhances the message without overshadowing the core product value.` 
  : ''}

CRITICAL PLATFORM CONSTRAINTS:
You MUST maintain the exact same structure and character limits for each platform. Return the EXACT number of headlines and descriptions as the original.`;

    // Helper function to generate style-aware image prompts
    const enhanceImagePrompt = (originalPrompt: string, creative: AdCreative): string => {
      const voiceDescriptors: Record<string, string> = {
        professional: 'clean, corporate, professional lighting, business-appropriate setting',
        friendly: 'warm lighting, approachable atmosphere, inviting composition',
        playful: 'vibrant colors, dynamic composition, fun and energetic mood',
        luxurious: 'premium aesthetic, sophisticated lighting, elegant background',
        educational: 'clear, informative layout, well-lit, instructional feel',
        urgent: 'bold, attention-grabbing, high contrast, dynamic energy'
      };

      const emotionalDescriptors: Record<string, string> = {
        'fomo': 'limited-time visual cues, urgency indicators, countdown elements',
        'aspiration': 'aspirational lifestyle imagery, success-oriented visuals, achievement mood',
        'problem-solution': 'before-after contrast, solution-focused imagery, relief visualization',
        'social-proof': 'crowd appeal, testimonial feel, trust-building elements',
        'exclusivity': 'VIP aesthetic, premium exclusivity, select membership feel',
        'value': 'value proposition highlighted, deal-oriented visuals, savings emphasis'
      };

      const voiceStyle = voiceDescriptors[filters.brandVoice] || '';
      const emotionalStyle = emotionalDescriptors[filters.emotionalHook] || '';

      return `${originalPrompt}. Style: ${voiceStyle}, ${emotionalStyle}. Platform: ${creative.channel}`;
    };

    // Helper function to generate ad images
    const generateAdImage = async (creative: AdCreative, apiKey: string): Promise<string | undefined> => {
      try {
        console.log(`Regenerating image for ${creative.channel}...`);
        
        const aspectRatioMap: Record<string, string> = {
          '1:1': 'square 1:1 format, centered composition',
          '9:16': 'vertical 9:16 format for mobile stories, full-screen immersive',
          '2:3': 'vertical 2:3 Pinterest-optimized format',
          '16:9': 'horizontal 16:9 landscape format for YouTube thumbnails',
          '1.91:1': 'horizontal 1.91:1 banner format for display ads'
        };
        const aspectInstruction = aspectRatioMap[creative.imageAspectRatio || '1:1'];
        
        // Enhance the image prompt with filter-based styling
        const enhancedImagePrompt = enhanceImagePrompt(creative.imagePrompt, creative);
        
        const fullPrompt = `CRITICAL: Generate in ${aspectInstruction}. You MUST keep the main product from the base image EXACTLY as it is - 100% unchanged, same colors, same design, same shape, completely recognizable and intact. DO NOT modify, alter, or reimagine the product itself in any way. ONLY add creative background elements, lighting effects, lifestyle context, or platform-specific styling AROUND the product to make it suitable for ${creative.channel} ${creative.placement} advertising. ${enhancedImagePrompt}`;
        
        const messageContent: any[] = [
          {
            type: 'text',
            text: fullPrompt
          }
        ];
        
        // Add product image as base if available
        if (productImageUrl) {
          messageContent.push({
            type: 'image_url',
            image_url: {
              url: productImageUrl
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
            console.log(`Successfully regenerated image for ${creative.channel}`);
            return generatedImage;
          }
        } else {
          console.error(`Failed to regenerate image for ${creative.channel}: ${imageResponse.status}`);
        }
      } catch (error) {
        console.error(`Error regenerating image for ${creative.channel}:`, error);
      }
      
      return undefined;
    };

    // Generate new copy and images for each creative
    const regeneratedCreatives = await Promise.all(
      creativesToRegenerate.map(async (creative) => {
        try {
          const userPrompt = `Regenerate ad copy for ${creative.channel} (${creative.placement}).

ORIGINAL CREATIVE:
Headlines (${creative.headlines.length} required):
${creative.headlines.map((h, i) => `${i + 1}. "${h}" (${h.length} chars)`).join('\n')}

Descriptions (${creative.descriptions.length} required):
${creative.descriptions.map((d, i) => `${i + 1}. "${d}" (${d.length} chars)`).join('\n')}

CHARACTER CONSTRAINTS:
- You MUST return exactly ${creative.headlines.length} headlines
- You MUST return exactly ${creative.descriptions.length} descriptions
- Match or stay under the original character lengths shown above
- Maintain the same structure and format

Apply the style parameters from the system prompt while respecting these exact constraints.
${filters.trendHeadline && filters.trendHeadline !== 'none' 
  ? `\nIMPORTANT: Align this ad creative with the trending topic: "${filters.trendHeadline}". Reference it naturally in at least one headline or description where it makes sense contextually.` 
  : ''}

Return ONLY a JSON object in this exact format (no markdown, no code blocks, no additional text):
{
  "headlines": ["headline 1", "headline 2", ...],
  "descriptions": ["description 1", "description 2", ...]
}`;

          console.log(`Regenerating ${creative.channel}...`);
          
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`AI API error for ${creative.channel}:`, response.status, errorText);
            throw new Error(`AI API returned ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          const content = data.choices[0].message.content;
          
          // Parse the JSON response
          let parsedContent;
          try {
            // Remove markdown code blocks if present
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsedContent = JSON.parse(cleanContent);
          } catch (parseError) {
            console.error(`Failed to parse response for ${creative.channel}:`, content);
            const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
            throw new Error(`Failed to parse AI response: ${errorMessage}`);
          }

          // Validate response structure
          if (!parsedContent.headlines || !Array.isArray(parsedContent.headlines)) {
            throw new Error('Invalid response: missing headlines array');
          }
          if (!parsedContent.descriptions || !Array.isArray(parsedContent.descriptions)) {
            throw new Error('Invalid response: missing descriptions array');
          }
          if (parsedContent.headlines.length !== creative.headlines.length) {
            throw new Error(`Headline count mismatch: expected ${creative.headlines.length}, got ${parsedContent.headlines.length}`);
          }
          if (parsedContent.descriptions.length !== creative.descriptions.length) {
            throw new Error(`Description count mismatch: expected ${creative.descriptions.length}, got ${parsedContent.descriptions.length}`);
          }

          console.log(`Successfully regenerated copy for ${creative.channel}`);
          
          // Regenerate image with new style-aware prompt
          const newImageUrl = await generateAdImage(creative, LOVABLE_API_KEY);
          
          return {
            ...creative,
            headlines: parsedContent.headlines,
            descriptions: parsedContent.descriptions,
            imageUrl: newImageUrl || creative.imageUrl, // Keep original if regeneration fails
            logoUrl: logoUrl || creative.logoUrl
          };
        } catch (error) {
          console.error(`Error regenerating ${creative.channel}:`, error);
          // Return original creative if regeneration fails
          return creative;
        }
      })
    );

    // Merge regenerated creatives back with originals
    const finalCreatives = adCreatives.map(original => {
      const regenerated = regeneratedCreatives.find(r => r.id === original.id);
      return regenerated || original;
    });

    return new Response(
      JSON.stringify({
        success: true,
        adCreatives: finalCreatives,
        regeneratedCount: regeneratedCreatives.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in regenerate-ad-copy function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to regenerate ad copy',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
