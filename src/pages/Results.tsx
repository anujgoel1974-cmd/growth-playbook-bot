import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, ArrowLeft, Copy, Download,
  Users, Brain, Zap, MessageCircle, TrendingUp,
  Target, UsersRound, Search, Palette, DollarSign, Megaphone, FileText,
  Share2, Image, Music, Video, Briefcase, Hash, Building2, Shield, 
  AlertCircle, CheckCircle, Award, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generatePDF } from "@/utils/pdfExport";
import { toast as sonnerToast } from "sonner";

interface InsightCard {
  id: string;
  title: string;
  content: string;
  icon: string;
  channel?: string;
  subItems?: Array<{ label: string; value: string }>;
}

interface MediaPlanWeek {
  weekNumber: number;
  channels: Array<{
    name: string;
    campaignType: string;
    budget: number;
    percentage: number;
  }>;
  reasoning?: string;
}

interface CompetitorCard {
  id: string;
  competitorName: string;
  url: string;
  pricePoint: string;
  keyStrength: string;
  weakness: string;
  icon: string;
}

interface AdCreative {
  id: string;
  channel: string;
  channelType: string;
  headlines: string[];
  descriptions: string[];
  imagePrompt: string;
  imageUrl?: string;
}

interface AnalysisData {
  customerInsight: InsightCard[];
  campaignTargeting: InsightCard[];
  mediaPlan?: MediaPlanWeek[];
  competitiveAnalysis?: {
    competitors: CompetitorCard[];
    insights: InsightCard[];
  };
  adCreatives?: AdCreative[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'users': Users,
  'brain': Brain,
  'zap': Zap,
  'message-circle': MessageCircle,
  'trending-up': TrendingUp,
  'target': Target,
  'users-round': UsersRound,
  'search': Search,
  'palette': Palette,
  'dollar-sign': DollarSign,
  'megaphone': Megaphone,
  'file-text': FileText,
  'share-2': Share2,
  'image': Image,
  'music': Music,
  'video': Video,
  'briefcase': Briefcase,
  'hash': Hash,
  'building-2': Building2,
  'shield': Shield,
  'alert-circle': AlertCircle,
  'check-circle': CheckCircle,
  'award': Award,
  'external-link': ExternalLink,
};

const channelColors: Record<string, { bg: string; border: string; icon: string }> = {
  'google': { 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    border: 'border-blue-200 dark:border-blue-800', 
    icon: 'text-blue-600 dark:text-blue-400' 
  },
  'meta': { 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    border: 'border-purple-200 dark:border-purple-800', 
    icon: 'text-purple-600 dark:text-purple-400' 
  },
  'pinterest': { 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    border: 'border-red-200 dark:border-red-800', 
    icon: 'text-red-600 dark:text-red-400' 
  },
  'tiktok': { 
    bg: 'bg-cyan-50 dark:bg-cyan-950/30', 
    border: 'border-cyan-200 dark:border-cyan-800', 
    icon: 'text-cyan-600 dark:text-cyan-400' 
  },
  'youtube': { 
    bg: 'bg-rose-50 dark:bg-rose-950/30', 
    border: 'border-rose-200 dark:border-rose-800', 
    icon: 'text-rose-600 dark:text-rose-400' 
  },
  'linkedin': { 
    bg: 'bg-sky-50 dark:bg-sky-950/30', 
    border: 'border-sky-200 dark:border-sky-800', 
    icon: 'text-sky-600 dark:text-sky-400' 
  },
  'default': { 
    bg: 'bg-card', 
    border: 'border-border', 
    icon: 'text-primary' 
  },
};

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const url = searchParams.get("url");
  
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!url) {
      navigate("/");
      return;
    }

    const analyzeUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Calling analyze-landing-page function...');
        const { data, error } = await supabase.functions.invoke('analyze-landing-page', {
          body: { url }
        });

        if (error) {
          console.error('Function error:', error);
          throw error;
        }

        if (!data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        console.log('Analysis successful:', data);
        setAnalysis(data.analysis);
      } catch (err) {
        console.error('Error analyzing URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze URL');
        toast({
          title: "Analysis Failed",
          description: err instanceof Error ? err.message : 'Failed to analyze URL',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    analyzeUrl();
  }, [url, navigate, toast]);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${section} copied to clipboard`,
    });
  };

  const AdCreativeCard = ({ creative }: { creative: AdCreative }) => {
    const creativeChannelColors: Record<string, { bg: string; border: string; text: string }> = {
      google: { bg: 'from-blue-500/10 to-sky-500/10', border: 'border-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
      meta: { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', text: 'text-purple-700 dark:text-purple-400' },
      pinterest: { bg: 'from-red-500/10 to-rose-500/10', border: 'border-red-500/20', text: 'text-red-700 dark:text-red-400' },
      tiktok: { bg: 'from-cyan-500/10 to-teal-500/10', border: 'border-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-400' },
      youtube: { bg: 'from-red-600/10 to-orange-500/10', border: 'border-red-600/20', text: 'text-red-700 dark:text-red-400' },
      default: { bg: 'from-gray-500/10 to-slate-500/10', border: 'border-gray-500/20', text: 'text-gray-700 dark:text-gray-400' },
    };
    
    const colors = creativeChannelColors[creative.channelType] || creativeChannelColors.default;
    
    return (
      <Card className={`shadow-card hover:shadow-card-hover transition-all border-2 ${colors.border} bg-gradient-to-br ${colors.bg}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className={colors.text}>{creative.channel}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const copyText = `${creative.channel}\n\nHeadlines:\n${creative.headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nDescriptions:\n${creative.descriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
                handleCopy(copyText, creative.channel);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {creative.imageUrl ? (
            <div className="relative rounded-lg overflow-hidden aspect-[4/3] bg-muted/30">
              <img 
                src={creative.imageUrl} 
                alt={`${creative.channel} ad creative`}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2 shadow-lg"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = creative.imageUrl!;
                  link.download = `${creative.channel.toLowerCase().replace(/\s+/g, '-')}-ad-image.png`;
                  link.click();
                  sonnerToast.success('Image downloaded!');
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          ) : (
            <div className="aspect-[4/3] bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-xs">Image generation in progress...</p>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Headlines
            </h4>
            <div className="space-y-2">
              {creative.headlines.map((headline, idx) => (
                <div key={idx} className="p-2 bg-white/60 dark:bg-black/20 rounded border text-sm">
                  <span className="text-xs text-muted-foreground font-semibold mr-2">H{idx + 1}:</span>
                  {headline}
                </div>
              ))}
            </div>
          </div>
          
          {creative.descriptions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descriptions
              </h4>
              <div className="space-y-2">
                {creative.descriptions.map((desc, idx) => (
                  <div key={idx} className="p-2 bg-white/60 dark:bg-black/20 rounded border text-xs">
                    <span className="text-xs text-muted-foreground font-semibold mr-2">D{idx + 1}:</span>
                    {desc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const InsightCard = ({ card }: { card: InsightCard }) => {
    const IconComponent = iconMap[card.icon] || FileText;
    const colors = card.channel ? channelColors[card.channel] : channelColors.default;
    
    // Gradient colors for sub-cards
    const gradients = [
      'from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800',
      'from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800',
      'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800',
      'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800',
      'from-rose-500/10 to-pink-500/10 border-rose-200 dark:border-rose-800',
      'from-indigo-500/10 to-blue-500/10 border-indigo-200 dark:border-indigo-800',
    ];
    
    return (
      <Card className={`shadow-card hover:shadow-card-hover transition-all hover:scale-[1.02] group border-2 ${colors.border} ${colors.bg}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colors.icon} bg-white/50 dark:bg-black/20 group-hover:scale-110 transition-transform`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(card.content, card.title)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {card.subItems && card.subItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {card.subItems.map((subItem, index) => (
                <div
                  key={subItem.label}
                  className={`p-3 rounded-lg border bg-gradient-to-br ${gradients[index % gradients.length]} hover:shadow-md transition-all`}
                >
                  <div className="font-semibold text-sm mb-1 text-foreground">
                    {subItem.label}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {subItem.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {card.content}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!url) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Analyzing:</span>
            <span className="font-medium truncate max-w-md">{url}</span>
          </div>
        </div>

        {isLoading ? (
          <Card className="shadow-card">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Analyzing your landing page...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take up to 2 minutes</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-destructive mb-4">Error: {error}</p>
              <Button onClick={() => navigate("/")}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="insight" className="w-full">
            <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-5 mb-8">
              <TabsTrigger value="insight">Customer Insight</TabsTrigger>
              <TabsTrigger value="targeting">Campaign Targeting</TabsTrigger>
              <TabsTrigger value="mediaplan">Media Plan</TabsTrigger>
              <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
              <TabsTrigger value="adcreative">Ad Creative</TabsTrigger>
            </TabsList>

            {/* Customer Insight Tab */}
            <TabsContent value="insight" className="animate-fade-in">
              {analysis?.customerInsight && analysis.customerInsight.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysis.customerInsight.map((card) => (
                    <InsightCard key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No customer insight data available
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Campaign Targeting Tab */}
            <TabsContent value="targeting" className="animate-fade-in">
              {analysis?.campaignTargeting && analysis.campaignTargeting.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysis.campaignTargeting.map((card) => (
                    <InsightCard key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No campaign targeting data available
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Media Plan Tab */}
            <TabsContent value="mediaplan" className="animate-fade-in">
              {analysis?.mediaPlan && analysis.mediaPlan.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">4-6 Week Media Plan</h3>
                    <p className="text-muted-foreground">$100 weekly budget optimized for ROAS</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.mediaPlan.map((week) => {
                      const totalBudget = week.channels.reduce((sum, ch) => sum + ch.budget, 0);
                      const channelGroups = week.channels.reduce((acc, ch) => {
                        if (!acc[ch.name]) acc[ch.name] = [];
                        acc[ch.name].push(ch);
                        return acc;
                      }, {} as Record<string, typeof week.channels>);
                      
                      const getChannelStyles = (channelName: string) => {
                        const lower = channelName.toLowerCase();
                        if (lower.includes('google')) return { 
                          bg: 'bg-blue-100 dark:bg-blue-950/30', 
                          border: 'border-blue-200 dark:border-blue-800',
                          text: 'text-blue-700 dark:text-blue-400'
                        };
                        if (lower.includes('meta')) return { 
                          bg: 'bg-purple-100 dark:bg-purple-950/30', 
                          border: 'border-purple-200 dark:border-purple-800',
                          text: 'text-purple-700 dark:text-purple-400'
                        };
                        if (lower.includes('pinterest')) return { 
                          bg: 'bg-red-100 dark:bg-red-950/30', 
                          border: 'border-red-200 dark:border-red-800',
                          text: 'text-red-700 dark:text-red-400'
                        };
                        if (lower.includes('tiktok')) return { 
                          bg: 'bg-cyan-100 dark:bg-cyan-950/30', 
                          border: 'border-cyan-200 dark:border-cyan-800',
                          text: 'text-cyan-700 dark:text-cyan-400'
                        };
                        if (lower.includes('youtube')) return { 
                          bg: 'bg-rose-100 dark:bg-rose-950/30', 
                          border: 'border-rose-200 dark:border-rose-800',
                          text: 'text-rose-700 dark:text-rose-400'
                        };
                        return { 
                          bg: 'bg-gray-100 dark:bg-gray-950/30', 
                          border: 'border-gray-200 dark:border-gray-800',
                          text: 'text-gray-700 dark:text-gray-400'
                        };
                      };
                      
                      return (
                        <Card key={week.weekNumber} className="shadow-card hover:shadow-card-hover transition-all border-2">
                          <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-primary/10">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <span>Week {week.weekNumber}</span>
                              <span className="text-primary font-bold">${totalBudget}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              {Object.entries(channelGroups).map(([channelName, campaigns]) => {
                                const channelTotal = campaigns.reduce((sum, c) => sum + c.budget, 0);
                                const styles = getChannelStyles(channelName);
                                
                                return (
                                  <div key={channelName} className="space-y-2">
                                    <div className={`flex items-center justify-between p-2 rounded-lg ${styles.bg} border ${styles.border}`}>
                                      <span className="font-semibold text-sm">{channelName}</span>
                                      <span className={`${styles.text} font-bold text-sm`}>
                                        ${channelTotal}
                                      </span>
                                    </div>
                                    <div className="pl-3 space-y-1">
                                      {campaigns.map((campaign, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">• {campaign.campaignType}</span>
                                          <span className="font-medium">${campaign.budget} ({campaign.percentage}%)</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {week.reasoning && (
                              <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5">
                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                                      <span className="text-xs font-bold text-primary">?</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-primary mb-1">Why this allocation?</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {week.reasoning}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No media plan data available
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Competitive Analysis Tab */}
            <TabsContent value="competitive" className="animate-fade-in">
              {analysis?.competitiveAnalysis ? (
                <div className="space-y-8">
                  {/* Competitors Section */}
                  {analysis.competitiveAnalysis.competitors && analysis.competitiveAnalysis.competitors.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-center mb-6">Top Competitors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysis.competitiveAnalysis.competitors.map((competitor) => {
                          const IconComponent = iconMap[competitor.icon] || Building2;
                          
                          return (
                            <Card key={competitor.id} className="shadow-card hover:shadow-card-hover transition-all group border-2 border-border">
                              <CardHeader className="pb-3 bg-gradient-to-br from-muted/30 to-muted/10">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                      <IconComponent className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">{competitor.competitorName}</CardTitle>
                                  </div>
                                </div>
                                {competitor.url && (
                                  <CardDescription className="flex items-center gap-1 text-xs mt-2">
                                    <a 
                                      href={competitor.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 hover:underline text-primary"
                                    >
                                      Visit page <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {competitor.pricePoint && (
                                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800">
                                    <div className="font-semibold text-sm mb-1">Price Point</div>
                                    <div className="text-xs text-muted-foreground">{competitor.pricePoint}</div>
                                  </div>
                                )}
                                {competitor.keyStrength && (
                                  <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800">
                                    <div className="font-semibold text-sm mb-1">Key Strength</div>
                                    <div className="text-xs text-muted-foreground">{competitor.keyStrength}</div>
                                  </div>
                                )}
                                {competitor.weakness && (
                                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800">
                                    <div className="font-semibold text-sm mb-1">Weakness / Opportunity</div>
                                    <div className="text-xs text-muted-foreground">{competitor.weakness}</div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Competitive Insights Section */}
                  {analysis.competitiveAnalysis.insights && analysis.competitiveAnalysis.insights.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-center mb-6">Strategic Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.competitiveAnalysis.insights.map((insight) => (
                          <InsightCard key={insight.id} card={insight} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No competitive analysis data available
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ad Creative Tab */}
            <TabsContent value="adcreative" className="animate-fade-in">
              {analysis?.adCreatives && analysis.adCreatives.length > 0 ? (
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Ready-to-Use Ad Creatives</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      AI-generated headlines, descriptions, and images optimized for each advertising platform
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        const allCopy = analysis.adCreatives!.map(c => `
${c.channel}
${'='.repeat(c.channel.length)}

Headlines:
${c.headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Descriptions:
${c.descriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}
                        `).join('\n\n');
                        
                        handleCopy(allCopy.trim(), 'All Ad Creatives');
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All Creatives
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analysis.adCreatives.map((creative) => (
                      <AdCreativeCard key={creative.id} creative={creative} />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ad creative data available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Export Button */}
        {!isLoading && !error && analysis && (
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="gap-2"
              disabled={isGeneratingPdf}
              onClick={async () => {
                if (!url || !analysis) return;
                
                setIsGeneratingPdf(true);
                sonnerToast.loading("Generating PDF...", { id: "pdf-generation" });

                try {
                  // Map data structure for PDF export
                  const pdfData = {
                    customerInsight: {
                      sections: analysis.customerInsight || []
                    },
                    campaignTargeting: {
                      sections: analysis.campaignTargeting || []
                    },
                    mediaPlan: {
                      weeks: (analysis.mediaPlan || []).map(week => ({
                        week: week.weekNumber,
                        channels: week.channels.map(ch => ({
                          name: ch.name,
                          budget: `$${ch.budget}`,
                          campaignType: ch.campaignType,
                          allocation: `${ch.percentage}%`,
                          color: ch.name.toLowerCase().includes('google') ? 'google' :
                                 ch.name.toLowerCase().includes('meta') ? 'meta' :
                                 ch.name.toLowerCase().includes('pinterest') ? 'pinterest' :
                                 ch.name.toLowerCase().includes('tiktok') ? 'tiktok' :
                                 ch.name.toLowerCase().includes('youtube') ? 'youtube' : 'default'
                        })),
                        reasoning: week.reasoning || ''
                      }))
                    },
                    competitiveAnalysis: analysis.competitiveAnalysis ? {
                      competitors: analysis.competitiveAnalysis.competitors || [],
                      insights: analysis.competitiveAnalysis.insights || []
                    } : undefined,
                    adCreatives: analysis.adCreatives || []
                  };

                  await generatePDF(pdfData, url);
                  sonnerToast.success("PDF downloaded successfully!", { id: "pdf-generation" });
                } catch (error) {
                  console.error("PDF generation error:", error);
                  sonnerToast.error("Failed to generate PDF. Please try again.", { id: "pdf-generation" });
                } finally {
                  setIsGeneratingPdf(false);
                }
              }}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Full Playbook as PDF
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
