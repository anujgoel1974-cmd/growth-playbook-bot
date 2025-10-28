import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MetaFeedAdPreview } from "./ad-previews/MetaFeedAdPreview";
import { InstagramStoryAdPreview } from "./ad-previews/InstagramStoryAdPreview";
import { GoogleSearchAdPreview } from "./ad-previews/GoogleSearchAdPreview";
import { GoogleDisplayAdPreview } from "./ad-previews/GoogleDisplayAdPreview";
import { PinterestPinPreview } from "./ad-previews/PinterestPinPreview";
import { TikTokAdPreview } from "./ad-previews/TikTokAdPreview";
import { YouTubeThumbnailPreview } from "./ad-previews/YouTubeThumbnailPreview";
import { Copy, Download, Target, DollarSign, TrendingUp, HelpCircle } from "lucide-react";
import { toast as sonnerToast } from "sonner";

interface CampaignPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    name: string;
    campaignType: string;
    budget: number;
    percentage: number;
  };
  weekNumber: number;
  adCreatives: Array<{
    id: string;
    channel: string;
    channelType: string;
    placement: string;
    headlines: string[];
    descriptions: string[];
    imageUrl?: string;
    logoUrl?: string;
    imageAspectRatio?: string;
  }>;
  campaignSettingsRationale?: Record<string, any>;
}

export const CampaignPreviewDialog = ({
  isOpen,
  onClose,
  campaign,
  weekNumber,
  adCreatives,
  campaignSettingsRationale,
}: CampaignPreviewDialogProps) => {
  const rationale = campaignSettingsRationale || {};
  
  // Debug logging
  console.log('Campaign name:', campaign.name);
  console.log('Campaign settings rationale received:', campaignSettingsRationale);
  console.log('Rationale for this campaign:', rationale);
  // Map campaign types to ad creative placements
  const getCampaignRecommendedPlacements = () => {
    const channelType = campaign.name.toLowerCase();
    const campaignTypeLower = campaign.campaignType.toLowerCase();

    // Filter creatives by channel
    let relevantCreatives = adCreatives.filter(
      (creative) => creative.channelType === channelType || creative.channel.toLowerCase().includes(channelType)
    );

    // Further filter by campaign type if specific
    if (campaignTypeLower.includes('search')) {
      relevantCreatives = relevantCreatives.filter(c => c.placement.includes('search'));
    } else if (campaignTypeLower.includes('display')) {
      relevantCreatives = relevantCreatives.filter(c => c.placement.includes('display'));
    } else if (campaignTypeLower.includes('story') || campaignTypeLower.includes('stories')) {
      relevantCreatives = relevantCreatives.filter(c => c.placement.includes('story'));
    } else if (campaignTypeLower.includes('feed')) {
      relevantCreatives = relevantCreatives.filter(c => c.placement.includes('feed'));
    }

    return relevantCreatives;
  };

  const relevantCreatives = getCampaignRecommendedPlacements();

  const getCampaignSettings = () => {
    const channelType = campaign.name.toLowerCase();
    const campaignTypeLower = campaign.campaignType.toLowerCase();

    // Return campaign-specific settings based on type
    if (channelType.includes('google')) {
      if (campaignTypeLower.includes('pmax') || campaignTypeLower.includes('performance')) {
        return {
          objective: "Maximize conversions with automated bidding",
          targeting: "All Google inventory (Search, Display, YouTube, Gmail, Discover)",
          bidStrategy: "Target ROAS or Maximize Conversion Value",
          bidAmount: "$2.50 - $5.00 CPA target",
          assets: "Requires headlines, descriptions, images, logos, and videos",
          placements: "Automated across all Google properties",
          keywords: ["luxury ceramics", "artisan pottery", "home decor", "handcrafted mugs", "designer tableware"],
          interests: ["Home & Garden", "Interior Design", "Luxury Lifestyle", "Artisan Crafts"],
          locations: ["United States", "United Kingdom", "Canada", "Australia"],
          demographics: "Age 25-54, All genders, HHI $75k+",
        };
      } else if (campaignTypeLower.includes('search')) {
        return {
          objective: "Drive high-intent traffic through search",
          targeting: "Keyword-based targeting on Google Search",
          bidStrategy: "Manual CPC or Target CPA",
          bidAmount: "$1.50 - $3.00 per click",
          assets: "3 headlines (30 chars each), 2 descriptions (90 chars each)",
          placements: "Google Search Results, Search Partners",
          keywords: ["buy ceramic mugs online", "luxury pottery", "artisan ceramics", "designer tableware", "handmade mugs"],
          interests: ["Shopping", "Home Decor Enthusiasts"],
          locations: ["United States", "United Kingdom", "Canada"],
          demographics: "Age 25-64, All genders, Purchase intent: High",
        };
      } else if (campaignTypeLower.includes('display')) {
        return {
          objective: "Build awareness through visual ads",
          targeting: "Contextual, audience, and placement targeting",
          bidStrategy: "Target CPA or Maximize Conversions",
          bidAmount: "$0.50 - $1.50 per click",
          assets: "Responsive display ads with images and headlines",
          placements: "Google Display Network (3M+ websites)",
          keywords: ["home decor", "interior design", "luxury goods", "artisan products"],
          interests: ["Home & Garden", "Art & Design", "Luxury Shoppers"],
          locations: ["United States", "Europe", "Australia"],
          demographics: "Age 25-54, All genders, Affinity: Home Decor",
        };
      }
    } else if (channelType.includes('meta')) {
      if (campaignTypeLower.includes('advantage') || campaignTypeLower.includes('advantage+')) {
        return {
          objective: "Sales with AI-powered optimization",
          targeting: "Automated targeting with Advantage+ audience",
          bidStrategy: "Highest volume or value optimization",
          bidAmount: "$15 - $30 CPA target",
          assets: "Up to 5 headlines, 5 descriptions, 10 images/videos",
          placements: "Facebook, Instagram Feed, Stories, Reels (auto)",
          keywords: [],
          interests: ["Home Decor", "Interior Design", "Luxury Goods", "Art Collectors", "Sustainable Living"],
          locations: ["United States", "United Kingdom", "Canada", "Australia", "New Zealand"],
          demographics: "Age 25-54, All genders, Income: Top 25%",
        };
      } else if (campaignTypeLower.includes('retarget')) {
        return {
          objective: "Re-engage website visitors and cart abandoners",
          targeting: "Custom audiences (website visitors, app users, customer lists)",
          bidStrategy: "Lowest cost per result",
          bidAmount: "$10 - $25 CPA target",
          assets: "Dynamic product ads or custom creative",
          placements: "Facebook & Instagram Feed, Stories",
          keywords: [],
          interests: ["Engaged with your business"],
          locations: ["Worldwide (based on visitor data)"],
          demographics: "Age 18-65+, All genders, Website visitors (last 30 days)",
        };
      }
    } else if (channelType.includes('pinterest')) {
      return {
        objective: "Drive consideration and traffic",
        targeting: "Interest-based, keyword, and actalike audiences",
        bidStrategy: "Automatic or custom bidding",
        bidAmount: "$0.75 - $2.00 per click",
        assets: "Vertical images (2:3), Pin title, description",
        placements: "Home feed, search results, related pins",
        keywords: ["ceramic mugs", "home decor ideas", "pottery inspiration", "artisan gifts", "luxury tableware"],
        interests: ["Home Decor", "DIY & Crafts", "Interior Design", "Sustainable Living"],
        locations: ["United States", "United Kingdom", "Canada"],
        demographics: "Age 25-54, 80% Female, Interest in home improvement",
      };
    } else if (channelType.includes('tiktok')) {
      return {
        objective: "Engagement and traffic from Gen Z/Millennials",
        targeting: "Interest, behavior, and lookalike audiences",
        bidStrategy: "Lowest cost or cost cap",
        bidAmount: "$1.00 - $2.50 per click",
        assets: "9:16 vertical video, hook text, CTA",
        placements: "TikTok feed, TopView, branded effects",
        keywords: [],
        interests: ["Home Decor", "Aesthetic Lifestyle", "Small Business Support", "Artisan Products"],
        locations: ["United States", "United Kingdom", "Canada"],
        demographics: "Age 18-34, All genders, Video completion rate: 50%+",
      };
    } else if (channelType.includes('youtube')) {
      return {
        objective: "Video views and brand awareness",
        targeting: "Demographic, affinity, in-market, and custom intent",
        bidStrategy: "Maximum CPV or Target CPM",
        bidAmount: "$0.10 - $0.30 per view",
        assets: "Video ads (skippable/non-skippable), thumbnails",
        placements: "YouTube videos, search results, home feed",
        keywords: ["home decor haul", "pottery making", "luxury lifestyle", "interior design tips"],
        interests: ["Home & Garden", "Design & Architecture", "DIY & Crafts"],
        locations: ["United States", "United Kingdom", "Canada", "Australia"],
        demographics: "Age 25-54, All genders, In-market: Home Decor",
      };
    }

    return {
      objective: "Drive results for your business",
      targeting: "Optimized audience targeting",
      bidStrategy: "Automated bidding strategy",
      bidAmount: "Platform optimized",
      assets: "Platform-specific creative assets",
      placements: "Recommended placements for this channel",
      keywords: [],
      interests: [],
      locations: [],
      demographics: "Broad targeting",
    };
  };

  const settings = getCampaignSettings();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    sonnerToast.success(`${label} copied to clipboard!`);
  };

  const renderAdPreview = (creative: typeof relevantCreatives[0]) => {
    if (creative.channelType === 'meta' && creative.placement === 'feed') {
      return <MetaFeedAdPreview creative={creative} />;
    } else if (creative.channelType === 'meta' && creative.placement.includes('story')) {
      return <InstagramStoryAdPreview creative={creative} />;
    } else if (creative.channelType === 'google' && creative.placement === 'search') {
      return <GoogleSearchAdPreview creative={creative} />;
    } else if (creative.channelType === 'google' && creative.placement === 'display') {
      return <GoogleDisplayAdPreview creative={creative} />;
    } else if (creative.channelType === 'pinterest') {
      return <PinterestPinPreview creative={creative} />;
    } else if (creative.channelType === 'tiktok') {
      return <TikTokAdPreview creative={creative} />;
    } else if (creative.channelType === 'youtube') {
      return <YouTubeThumbnailPreview creative={creative} />;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <TooltipProvider>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span>{campaign.name}</span>
            <Badge variant="secondary" className="text-base">
              {campaign.campaignType}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Week {weekNumber} Campaign Preview
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Campaign Budget Overview */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/20">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-2xl font-bold">${campaign.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/20">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allocation</p>
                    <p className="text-2xl font-bold">{campaign.percentage}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Creatives</p>
                    <p className="text-2xl font-bold">{relevantCreatives.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Campaign Settings</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-muted-foreground">Objective</p>
                        {rationale?.objective && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">{rationale.objective}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm">{settings.objective}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-muted-foreground">Bid Strategy</p>
                        {rationale?.bidStrategy && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">{rationale.bidStrategy}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm">{settings.bidStrategy}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-muted-foreground">Bid Amount</p>
                        {rationale?.bidAmount && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">{rationale.bidAmount}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm font-semibold">{settings.bidAmount}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-muted-foreground">Demographics</p>
                        {rationale?.demographics && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">{rationale.demographics}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-sm">{settings.demographics}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-muted-foreground">Targeting</p>
                      {rationale?.targeting && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">{rationale.targeting}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-sm">{settings.targeting}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-muted-foreground">Placements</p>
                      {rationale?.placements && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">{rationale.placements}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-sm">{settings.placements}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Required Assets</p>
                    <p className="text-sm">{settings.assets}</p>
                  </div>
                  {settings.locations && settings.locations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Target Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {settings.locations.map((location, idx) => (
                          <Badge key={idx} variant="outline">{location}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {settings.interests && settings.interests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Target Interests</p>
                        {rationale?.interests && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">{rationale.interests}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.interests.map((interest, idx) => (
                          <Badge key={idx} variant="secondary">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {settings.keywords && settings.keywords.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Target Keywords</p>
                        {rationale?.keywords && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">{rationale.keywords}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.keywords.map((keyword, idx) => (
                          <Badge key={idx} className="bg-primary/10 text-primary hover:bg-primary/20">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Creatives Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Ad Creative Previews ({relevantCreatives.length})
            </h3>
            {relevantCreatives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relevantCreatives.map((creative) => (
                  <div key={creative.id} className="space-y-3">
                    {renderAdPreview(creative)}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const copyText = `${creative.channel} - ${creative.placement}\n\nHeadlines:\n${creative.headlines.join('\n')}\n\nDescriptions:\n${creative.descriptions.join('\n')}`;
                          handleCopy(copyText, 'Ad specs');
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      {creative.imageUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = creative.imageUrl!;
                            link.download = `${creative.id}-image.png`;
                            link.click();
                            sonnerToast.success('Image downloaded!');
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No ad creatives available for this campaign type.</p>
                  <p className="text-sm mt-2">
                    Try selecting a campaign that matches available ad placements.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Approve Campaign
            </Button>
          </div>
        </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
