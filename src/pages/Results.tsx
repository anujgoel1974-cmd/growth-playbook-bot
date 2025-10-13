import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { MetaFeedAdPreview } from "@/components/ad-previews/MetaFeedAdPreview";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { InstagramStoryAdPreview } from "@/components/ad-previews/InstagramStoryAdPreview";
import { GoogleSearchAdPreview } from "@/components/ad-previews/GoogleSearchAdPreview";
import { GoogleDisplayAdPreview } from "@/components/ad-previews/GoogleDisplayAdPreview";
import { PinterestPinPreview } from "@/components/ad-previews/PinterestPinPreview";
import { TikTokAdPreview } from "@/components/ad-previews/TikTokAdPreview";
import { YouTubeThumbnailPreview } from "@/components/ad-previews/YouTubeThumbnailPreview";
import { CampaignPreviewDialog } from "@/components/CampaignPreviewDialog";

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
  // Legacy field for backward compatibility
  creatives?: Array<{
    platform: string;
    headline: string;
    description: string;
    imagePrompt: string;
    imageUrl?: string;
  }>;
}

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
  
  // PHASE 5: Agent Progress Tracking
  const [agentProgress, setAgentProgress] = useState<{
    'customer-insight': 'pending' | 'running' | 'complete',
    'competitive-analysis': 'pending' | 'running' | 'complete',
    'campaign-targeting': 'pending' | 'running' | 'complete',
    'media-plan': 'pending' | 'running' | 'complete',
    'ad-creative': 'pending' | 'running' | 'complete'
  }>({
    'customer-insight': 'pending',
    'competitive-analysis': 'pending',
    'campaign-targeting': 'pending',
    'media-plan': 'pending',
    'ad-creative': 'pending'
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<{
    campaign: MediaPlanWeek['channels'][0];
    weekNumber: number;
  } | null>(null);
  const [dailyBudget, setDailyBudget] = useState<number>(15);
  const [numberOfWeeks, setNumberOfWeeks] = useState<number>(4);
  
  // Ad Creative Customization State
  const [showFilters, setShowFilters] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customizedCreatives, setCustomizedCreatives] = useState<AdCreative[] | null>(null);
  const [adFilters, setAdFilters] = useState({
    brandVoice: 'friendly',
    emotionalHook: 'aspiration',
    cta: 'shop-now',
    emphasis: 'benefits',
    length: 'balanced',
  });
  const [applyToAllChannels, setApplyToAllChannels] = useState(true);

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
        
        // Create a timeout promise for 3 minutes
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Analysis timed out after 3 minutes. The page may have too many competitors to analyze.')), 180000);
        });
        
        // Race between the function call and timeout
        const functionPromise = supabase.functions.invoke('analyze-landing-page', {
          body: { url }
        });
        
        const { data, error } = await Promise.race([
          functionPromise,
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('Function error:', error);
          throw error;
        }

        if (!data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        console.log('Analysis successful:', data);
        setAnalysis(data.analysis);
        setSessionId(data.analysisId || null);
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

  // PHASE 5: Subscribe to agent_context realtime updates
  useEffect(() => {
    if (!sessionId) return;
    
    console.log('Subscribing to agent progress for session:', sessionId);
    
    const channel = supabase
      .channel('agent-progress')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_context',
        filter: `analysis_id=eq.${sessionId}`
      }, (payload: any) => {
        const agentName = payload.new.agent_name;
        console.log(`Agent complete: ${agentName}`);
        setAgentProgress(prev => ({ ...prev, [agentName]: 'complete' }));
      })
      .subscribe();

    return () => { 
      console.log('Unsubscribing from agent progress');
      supabase.removeChannel(channel); 
    };
  }, [sessionId]);

  // Poll for updated ad-creative images
  useEffect(() => {
    if (!sessionId) return;
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('agent_context')
        .select('output_data, created_at')
        .eq('analysis_id', sessionId)
        .eq('agent_name', 'ad-creative')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        const latest = data[0].output_data as unknown as AdCreative[];
        setAnalysis(prev => {
          if (!prev) return prev;
          const current = prev.adCreatives || [];
          const changed = current.length !== latest.length || latest.some((c, i) => {
            const cur = current[i];
            if (!cur) return true;
            const headsChanged = (c.headlines || []).join('|') !== (cur.headlines || []).join('|');
            const descChanged = (c.descriptions || []).join('|') !== (cur.descriptions || []).join('|');
            const imgChanged = (c.imageUrl || '') !== (cur.imageUrl || '');
            return headsChanged || descChanged || imgChanged;
          });
          return changed ? { ...prev, adCreatives: latest } : prev;
        });
      }
    };
    const interval = setInterval(fetchLatest, 4000);
    fetchLatest();
    return () => clearInterval(interval);
  }, [sessionId]);

  // Also poll for campaign targeting details in case initial response missed them
  useEffect(() => {
    if (!sessionId) return;
    const fetchTargeting = async () => {
      const { data, error } = await supabase
        .from('agent_context')
        .select('output_data, created_at')
        .eq('analysis_id', sessionId)
        .eq('agent_name', 'campaign-targeting')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        const latestCards = (data[0].output_data as any)?.cards as unknown as InsightCard[] | undefined;
        if (latestCards && latestCards.length > 0) {
          setAnalysis(prev => {
            if (!prev) return prev;
            const current = prev.campaignTargeting || [];
            const changed = current.length !== latestCards.length;
            return changed ? { ...prev, campaignTargeting: latestCards } : prev;
          });
        }
      }
    };
    const interval = setInterval(fetchTargeting, 5000);
    fetchTargeting();
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    sonnerToast.success(`${label} copied to clipboard!`);
  };

  // Extract recommended channels from media plan
  const getRecommendedChannels = (mediaPlan: MediaPlanWeek[] | undefined): Set<string> => {
    const channels = new Set<string>();
    mediaPlan?.forEach(week => {
      week.channels.forEach(ch => {
        const channelName = ch.name.toLowerCase();
        if (channelName.includes('google')) channels.add('google');
        if (channelName.includes('meta') || channelName.includes('facebook') || channelName.includes('instagram')) {
          channels.add('meta');
        }
        if (channelName.includes('pinterest')) channels.add('pinterest');
        if (channelName.includes('tiktok')) channels.add('tiktok');
        if (channelName.includes('youtube')) channels.add('youtube');
        if (channelName.includes('linkedin')) channels.add('linkedin');
      });
    });
    return channels;
  };

  const recommendedChannels = analysis?.mediaPlan ? getRecommendedChannels(analysis.mediaPlan) : new Set();
  
  // Use customized creatives if available, otherwise use original
  const baseCreatives = customizedCreatives || analysis?.adCreatives || [];
  const filteredCreatives = recommendedChannels.size > 0
    ? baseCreatives.filter((creative) => recommendedChannels.has(creative.channelType))
    : baseCreatives;

  // Calculate adjusted media plan based on user inputs
  const calculateAdjustedMediaPlan = (): MediaPlanWeek[] | undefined => {
    if (!analysis?.mediaPlan || analysis.mediaPlan.length === 0) return undefined;

    const totalBudget = dailyBudget * 7 * numberOfWeeks;
    const budgetPerWeek = totalBudget / numberOfWeeks;

    return Array.from({ length: numberOfWeeks }, (_, i) => {
      const sourceWeek = analysis.mediaPlan[i % analysis.mediaPlan.length];
      
      // Safety check: ensure sourceWeek and channels exist
      if (!sourceWeek || !sourceWeek.channels || sourceWeek.channels.length === 0) {
        return {
          weekNumber: i + 1,
          channels: [],
          reasoning: sourceWeek?.reasoning
        };
      }
      
      const weekOriginalTotal = sourceWeek.channels.reduce((s, ch) => s + ch.budget, 0);
      
      return {
        weekNumber: i + 1,
        reasoning: sourceWeek.reasoning,
        channels: sourceWeek.channels.map(ch => ({
          ...ch,
          budget: Math.round((ch.budget / weekOriginalTotal) * budgetPerWeek),
          percentage: Math.round((ch.budget / weekOriginalTotal) * 100)
        }))
      };
    });
  };

  const adjustedMediaPlan = calculateAdjustedMediaPlan();

  const handleRegenerateAdCopy = async () => {
    if (!analysis?.adCreatives || !url) return;
    
    setIsRegenerating(true);
    sonnerToast.loading("Regenerating ad copy with your preferences...", { id: "regenerate-ads" });

    try {
      // Extract brand info from URL and analysis
      const brandInfo = {
        productName: url.split('/').pop() || 'product',
        productCategory: analysis.customerInsight?.[0]?.content || 'product',
        brandVoice: analysis.customerInsight?.find(c => c.title.toLowerCase().includes('voice'))?.content,
      };

      const { data, error } = await supabase.functions.invoke('regenerate-ad-copy', {
        body: {
          adCreatives: analysis.adCreatives,
          brandInfo,
          filters: adFilters,
          channelsToRegenerate: applyToAllChannels ? undefined : Array.from(recommendedChannels),
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setCustomizedCreatives(data.adCreatives);
        sonnerToast.success(`Successfully regenerated ${data.regeneratedCount} ad creatives!`, { id: "regenerate-ads" });
      } else {
        throw new Error(data.error || 'Failed to regenerate ad copy');
      }
    } catch (error) {
      console.error('Error regenerating ad copy:', error);
      sonnerToast.error(
        error instanceof Error ? error.message : 'Failed to regenerate ad copy',
        { id: "regenerate-ads" }
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleResetToOriginal = () => {
    setCustomizedCreatives(null);
    sonnerToast.success("Reset to original ad copy");
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
            <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
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
        <>
          <AnalysisLoader />
          
          {/* PHASE 5: Agent Progress UI */}
          <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary animate-pulse" />
                🤖 Multi-Agent Analysis in Progress
              </CardTitle>
              <CardDescription>
                Multiple AI agents are working together to analyze your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Customer Insight Agent */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Users className={`h-5 w-5 ${agentProgress['customer-insight'] === 'complete' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Customer Insight Agent</p>
                  <p className="text-xs text-muted-foreground">Analyzing target personas, demographics, and pain points</p>
                </div>
                {agentProgress['customer-insight'] === 'complete' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
              </div>

              {/* Competitive Analysis Agent */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Building2 className={`h-5 w-5 ${agentProgress['competitive-analysis'] === 'complete' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Competitive Analysis Agent</p>
                  <p className="text-xs text-muted-foreground">Identifying competitors and scraping their products</p>
                </div>
                {agentProgress['competitive-analysis'] === 'complete' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
              </div>

              {/* Campaign Targeting Agent */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Target className={`h-5 w-5 ${agentProgress['campaign-targeting'] === 'complete' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Campaign Targeting Agent</p>
                  <p className="text-xs text-muted-foreground">Creating channel-specific strategies based on insights</p>
                </div>
                {agentProgress['campaign-targeting'] === 'complete' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
              </div>

              {/* Media Plan Agent */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <DollarSign className={`h-5 w-5 ${agentProgress['media-plan'] === 'complete' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Media Plan Agent</p>
                  <p className="text-xs text-muted-foreground">Allocating budgets across channels and weeks</p>
                </div>
                {agentProgress['media-plan'] === 'complete' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
              </div>

              {/* Creative Generation Agent */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Palette className={`h-5 w-5 ${agentProgress['ad-creative'] === 'complete' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Creative Generation Agent</p>
                  <p className="text-xs text-muted-foreground">Generating platform-specific ad copy and images</p>
                </div>
                {agentProgress['ad-creative'] === 'complete' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        </>
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
              <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
              <TabsTrigger value="targeting">Campaign Targeting</TabsTrigger>
              <TabsTrigger value="adcreative">Ad Creative</TabsTrigger>
              <TabsTrigger value="mediaplan">Media Plan</TabsTrigger>
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
                  {/* Budget Controls */}
                  <Card className="shadow-card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Campaign Budget Settings</CardTitle>
                      <CardDescription>Adjust your daily budget and campaign duration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="dailyBudget" className="text-sm font-semibold">
                            Daily Budget ($)
                          </Label>
                          <Input
                            id="dailyBudget"
                            type="number"
                            min="1"
                            max="10000"
                            value={dailyBudget}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setDailyBudget(Math.max(1, Math.min(10000, value)));
                            }}
                            className="text-lg font-bold"
                          />
                          <p className="text-xs text-muted-foreground">
                            Weekly: ${dailyBudget * 7}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numberOfWeeks" className="text-sm font-semibold">
                            Number of Weeks
                          </Label>
                          <Input
                            id="numberOfWeeks"
                            type="number"
                            min="1"
                            max="12"
                            value={numberOfWeeks}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              setNumberOfWeeks(Math.max(1, Math.min(12, value)));
                            }}
                            className="text-lg font-bold"
                          />
                          <p className="text-xs text-muted-foreground">
                            Total Budget: ${dailyBudget * 7 * numberOfWeeks}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{numberOfWeeks}-Week Media Plan</h3>
                    <p className="text-muted-foreground">${dailyBudget * 7} weekly budget optimized for ROAS</p>
                    <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Click on any campaign type to preview settings and ad creatives
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adjustedMediaPlan?.map((week) => {
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
                                         <button
                                           key={idx}
                                           onClick={() => setSelectedCampaign({ campaign, weekNumber: week.weekNumber })}
                                           className="w-full flex items-center justify-between text-xs hover:bg-primary/5 p-2 rounded transition-colors cursor-pointer group"
                                         >
                                           <span className="text-muted-foreground group-hover:text-primary flex items-center gap-1">
                                             • {campaign.campaignType}
                                             <svg 
                                               className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                                               fill="none" 
                                               stroke="currentColor" 
                                               viewBox="0 0 24 24"
                                             >
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                             </svg>
                                           </span>
                                           <span className="font-medium group-hover:text-primary">
                                             ${campaign.budget} ({campaign.percentage}%)
                                           </span>
                                         </button>
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
                      <h3 className="text-2xl font-bold text-center mb-6">Real Competitor Brands & Products</h3>
                      <p className="text-muted-foreground text-center mb-8 text-sm">
                        Actual competing brands with their live products scraped from their websites
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {analysis.competitiveAnalysis.competitors.map((competitor) => {
                          const IconComponent = iconMap[competitor.icon] || Building2;
                          
                          return (
                            <Card key={competitor.id} className="shadow-card hover:shadow-card-hover transition-all group border-2 border-border overflow-hidden">
                              <CardHeader className="pb-3 bg-gradient-to-br from-muted/30 to-muted/10">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                      <IconComponent className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg">{competitor.competitorName}</CardTitle>
                                      {competitor.domain && (
                                        <CardDescription className="text-xs mt-1">
                                          <a 
                                            href={`https://${competitor.domain}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:underline text-primary"
                                          >
                                            {competitor.domain} <ExternalLink className="h-3 w-3" />
                                          </a>
                                        </CardDescription>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4">
                                {/* Real Products */}
                                {competitor.products && competitor.products.length > 0 && (
                                  <div className="space-y-3">
                                    <div className="text-sm font-semibold">Actual Products:</div>
                                    <div className="space-y-2">
                                      {competitor.products.slice(0, 2).map((product, idx) => (
                                        <a 
                                          key={idx}
                                          href={product.productUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-border"
                                        >
                                          {product.imageUrl && (
                                            <img 
                                              src={product.imageUrl} 
                                              alt={product.name}
                                              className="w-16 h-16 object-cover rounded"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium truncate">{product.name}</div>
                                            <div className="text-xs text-primary font-semibold mt-1">{product.price}</div>
                                          </div>
                                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Competitor Details */}
                                <div className="space-y-2 pt-2 border-t border-border">
                                  {competitor.marketPosition && (
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800">
                                      <div className="font-semibold text-xs mb-0.5">Market Position</div>
                                      <div className="text-xs text-muted-foreground">{competitor.marketPosition}</div>
                                    </div>
                                  )}
                                  {competitor.pricePoint && (
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800">
                                      <div className="font-semibold text-xs mb-0.5">Price Point</div>
                                      <div className="text-xs text-muted-foreground">{competitor.pricePoint}</div>
                                    </div>
                                  )}
                                  {competitor.keyStrength && (
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800">
                                      <div className="font-semibold text-xs mb-0.5">Key Strength</div>
                                      <div className="text-xs text-muted-foreground">{competitor.keyStrength}</div>
                                    </div>
                                  )}
                                  {competitor.weakness && (
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800">
                                      <div className="font-semibold text-xs mb-0.5">Weakness / Opportunity</div>
                                      <div className="text-xs text-muted-foreground">{competitor.weakness}</div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Competitor Ad Copy Examples Section */}
                  {analysis.competitiveAnalysis.competitors.some(c => c.adCopyExamples && c.adCopyExamples.length > 0) && (
                    <div className="space-y-6 mt-12">
                      <h3 className="text-2xl font-bold text-center mb-6">Realistic Ad Copy Examples</h3>
                      <p className="text-muted-foreground text-center mb-8">
                        AI-generated ad copy based on each competitor's real products and marketing style
                      </p>
                      
                      {analysis.competitiveAnalysis.competitors.map((competitor) => {
                        if (!competitor.adCopyExamples || competitor.adCopyExamples.length === 0) return null;
                        
                        return (
                          <div key={competitor.id} className="space-y-4">
                            <h4 className="text-xl font-bold flex items-center gap-2">
                              {competitor.competitorName}
                              <span className="text-sm font-normal text-muted-foreground">
                                ({competitor.adCopyExamples.length} example{competitor.adCopyExamples.length > 1 ? 's' : ''})
                              </span>
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {competitor.adCopyExamples.map((adCopy, idx) => (
                                <Card key={`${competitor.id}-ad-${idx}`} className="shadow-card overflow-hidden">
                                  <CardHeader className="pb-3 bg-gradient-to-br from-muted/30 to-muted/10">
                                    <CardTitle className="text-sm">{adCopy.platform}</CardTitle>
                                    <CardDescription className="text-xs">Based on real product data</CardDescription>
                                  </CardHeader>
                                  <CardContent className="p-4 space-y-3">
                                    {competitor.products && competitor.products[0] && (
                                      <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden">
                                        <img 
                                          src={competitor.products[0].imageUrl} 
                                          alt={`${competitor.competitorName} product`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-xs font-semibold text-muted-foreground mb-1">Headline</div>
                                      <div className="text-sm font-medium">{adCopy.headline}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-muted-foreground mb-1">Description</div>
                                      <div className="text-xs text-muted-foreground">{adCopy.description}</div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
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
              {filteredCreatives.length > 0 ? (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Ad Creative Previews</h3>
                    <p className="text-muted-foreground">See exactly how your ads will appear on each platform</p>
                    <p className="text-sm text-muted-foreground mt-1">Showing creatives for channels in your Media Plan</p>
                  </div>

                  {/* Customization Panel */}
                  <Card className="shadow-card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Customize Ad Copy
                          </CardTitle>
                          <CardDescription>
                            Adjust messaging tone and style to match your brand - see changes in real-time
                          </CardDescription>
                        </div>
                        <Button
                          variant={showFilters ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="transition-all"
                        >
                          {showFilters ? 'Hide Options' : 'Customize Now'}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {showFilters && (
                      <CardContent className="space-y-6 animate-fade-in">
                        {/* Interactive Preview Banner */}
                        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg p-4 border-2 border-primary/30">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-sm font-semibold">Your Current Selection:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-background/80 rounded-full text-xs font-medium border">
                                  {adFilters.brandVoice.charAt(0).toUpperCase() + adFilters.brandVoice.slice(1)} voice
                                </span>
                                <span className="px-3 py-1 bg-background/80 rounded-full text-xs font-medium border">
                                  {adFilters.emotionalHook.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} hook
                                </span>
                                <span className="px-3 py-1 bg-background/80 rounded-full text-xs font-medium border">
                                  {adFilters.emphasis.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </span>
                                <span className="px-3 py-1 bg-background/80 rounded-full text-xs font-medium border">
                                  {adFilters.length.charAt(0).toUpperCase() + adFilters.length.slice(1)} copy
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Brand Voice */}
                          <div className="space-y-3 group">
                            <Label htmlFor="brandVoice" className="text-sm font-semibold flex items-center gap-2">
                              <MessageCircle className="h-4 w-4 text-primary" />
                              Brand Voice
                            </Label>
                            <Select
                              value={adFilters.brandVoice}
                              onValueChange={(value) => setAdFilters({ ...adFilters, brandVoice: value })}
                            >
                              <SelectTrigger id="brandVoice" className="h-11 transition-all group-hover:border-primary/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background">
                                <SelectItem value="professional" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Professional
                                  </div>
                                </SelectItem>
                                <SelectItem value="friendly" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Friendly
                                  </div>
                                </SelectItem>
                                <SelectItem value="playful" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Playful
                                  </div>
                                </SelectItem>
                                <SelectItem value="luxurious" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Luxurious
                                  </div>
                                </SelectItem>
                                <SelectItem value="educational" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    Educational
                                  </div>
                                </SelectItem>
                                <SelectItem value="urgent" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Urgent
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="bg-muted/50 rounded-lg p-3 min-h-[60px] transition-all">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {adFilters.brandVoice === 'professional' && '💼 Clear, trustworthy, and authoritative messaging that builds credibility'}
                                {adFilters.brandVoice === 'friendly' && '👋 Conversational, warm, and approachable tone that connects personally'}
                                {adFilters.brandVoice === 'playful' && '✨ Fun, creative, and energetic copy that stands out and entertains'}
                                {adFilters.brandVoice === 'luxurious' && '💎 Elegant, sophisticated, and premium language for high-end appeal'}
                                {adFilters.brandVoice === 'educational' && '📚 Informative, helpful, and empowering content that teaches'}
                                {adFilters.brandVoice === 'urgent' && '⚡ Action-oriented, time-sensitive messaging that drives immediate response'}
                              </p>
                            </div>
                          </div>

                          {/* Emotional Hook */}
                          <div className="space-y-3 group">
                            <Label htmlFor="emotionalHook" className="text-sm font-semibold flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              Emotional Hook
                            </Label>
                            <Select
                              value={adFilters.emotionalHook}
                              onValueChange={(value) => setAdFilters({ ...adFilters, emotionalHook: value })}
                            >
                              <SelectTrigger id="emotionalHook" className="h-11 transition-all group-hover:border-primary/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background">
                                <SelectItem value="fomo" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    ⏰ FOMO
                                  </div>
                                </SelectItem>
                                <SelectItem value="aspiration" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    🎯 Aspiration
                                  </div>
                                </SelectItem>
                                <SelectItem value="problem-solution" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    🔧 Problem-Solution
                                  </div>
                                </SelectItem>
                                <SelectItem value="social-proof" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    ⭐ Social Proof
                                  </div>
                                </SelectItem>
                                <SelectItem value="exclusivity" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    👑 Exclusivity
                                  </div>
                                </SelectItem>
                                <SelectItem value="value" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    💰 Value
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="bg-muted/50 rounded-lg p-3 min-h-[60px] transition-all">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {adFilters.emotionalHook === 'fomo' && '⏰ Limited time offers and urgency - "Don\'t miss out on this opportunity"'}
                                {adFilters.emotionalHook === 'aspiration' && '🎯 Achieve goals and transformation - "Become the best version of yourself"'}
                                {adFilters.emotionalHook === 'problem-solution' && '🔧 Address pain points directly - "Solve your biggest challenge today"'}
                                {adFilters.emotionalHook === 'social-proof' && '⭐ Testimonials and popularity - "Join thousands of happy customers"'}
                                {adFilters.emotionalHook === 'exclusivity' && '👑 Limited access and VIP treatment - "Exclusive access for select members"'}
                                {adFilters.emotionalHook === 'value' && '💰 Savings and great deals - "Get more for less, unbeatable value"'}
                              </p>
                            </div>
                          </div>

                          {/* Call to Action */}
                          <div className="space-y-3 group">
                            <Label htmlFor="cta" className="text-sm font-semibold flex items-center gap-2">
                              <Megaphone className="h-4 w-4 text-primary" />
                              Call-to-Action
                            </Label>
                            <Select
                              value={adFilters.cta}
                              onValueChange={(value) => setAdFilters({ ...adFilters, cta: value })}
                            >
                              <SelectTrigger id="cta" className="h-11 transition-all group-hover:border-primary/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background">
                                <SelectItem value="shop-now" className="cursor-pointer">🛍️ Shop Now</SelectItem>
                                <SelectItem value="learn-more" className="cursor-pointer">📖 Learn More</SelectItem>
                                <SelectItem value="get-started" className="cursor-pointer">🚀 Get Started</SelectItem>
                                <SelectItem value="try-free" className="cursor-pointer">✨ Try Free</SelectItem>
                                <SelectItem value="book" className="cursor-pointer">📅 Book Now</SelectItem>
                                <SelectItem value="join" className="cursor-pointer">🤝 Join Us</SelectItem>
                                <SelectItem value="limited-offer" className="cursor-pointer">⚡ Limited Offer</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="bg-muted/50 rounded-lg p-3 min-h-[60px] transition-all">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {adFilters.cta === 'shop-now' && '🛍️ Direct purchase intent - "Shop Now" drives immediate buying action'}
                                {adFilters.cta === 'learn-more' && '📖 Information seeking - "Learn More" for education-focused messaging'}
                                {adFilters.cta === 'get-started' && '🚀 Action-oriented - "Get Started" for onboarding and sign-ups'}
                                {adFilters.cta === 'try-free' && '✨ Low barrier entry - "Try Free" removes risk for conversions'}
                                {adFilters.cta === 'book' && '📅 Appointment focused - "Book Now" for service-based offers'}
                                {adFilters.cta === 'join' && '🤝 Community building - "Join Us" for memberships and groups'}
                                {adFilters.cta === 'limited-offer' && '⚡ Urgency driven - "Limited Offer" creates scarcity'}
                              </p>
                            </div>
                          </div>

                          {/* Emphasis */}
                          <div className="space-y-3 group">
                            <Label htmlFor="emphasis" className="text-sm font-semibold flex items-center gap-2">
                              <Zap className="h-4 w-4 text-primary" />
                              Content Emphasis
                            </Label>
                            <Select
                              value={adFilters.emphasis}
                              onValueChange={(value) => setAdFilters({ ...adFilters, emphasis: value })}
                            >
                              <SelectTrigger id="emphasis" className="h-11 transition-all group-hover:border-primary/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background">
                                <SelectItem value="features" className="cursor-pointer">⚙️ Product Features</SelectItem>
                                <SelectItem value="benefits" className="cursor-pointer">✅ Benefits & Results</SelectItem>
                                <SelectItem value="price" className="cursor-pointer">💵 Price/Value</SelectItem>
                                <SelectItem value="brand-story" className="cursor-pointer">📖 Brand Story</SelectItem>
                                <SelectItem value="sustainability" className="cursor-pointer">🌱 Sustainability</SelectItem>
                                <SelectItem value="craftsmanship" className="cursor-pointer">🎨 Craftsmanship</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="bg-muted/50 rounded-lg p-3 min-h-[60px] transition-all">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {adFilters.emphasis === 'features' && '⚙️ Focus on product specifications and technical details'}
                                {adFilters.emphasis === 'benefits' && '✅ Highlight outcomes and customer results'}
                                {adFilters.emphasis === 'price' && '💵 Emphasize value proposition and savings'}
                                {adFilters.emphasis === 'brand-story' && '📖 Tell your brand\'s unique narrative and mission'}
                                {adFilters.emphasis === 'sustainability' && '🌱 Showcase eco-friendly practices and impact'}
                                {adFilters.emphasis === 'craftsmanship' && '🎨 Celebrate artisan quality and attention to detail'}
                              </p>
                            </div>
                          </div>

                          {/* Length */}
                          <div className="space-y-3 group">
                            <Label htmlFor="length" className="text-sm font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              Copy Length
                            </Label>
                            <Select
                              value={adFilters.length}
                              onValueChange={(value) => setAdFilters({ ...adFilters, length: value })}
                            >
                              <SelectTrigger id="length" className="h-11 transition-all group-hover:border-primary/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background">
                                <SelectItem value="short" className="cursor-pointer">⚡ Short & Punchy</SelectItem>
                                <SelectItem value="balanced" className="cursor-pointer">📝 Balanced</SelectItem>
                                <SelectItem value="detailed" className="cursor-pointer">📚 Detailed</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="bg-muted/50 rounded-lg p-3 min-h-[60px] transition-all">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {adFilters.length === 'short' && '⚡ Concise messaging for quick impact - perfect for mobile'}
                                {adFilters.length === 'balanced' && '📝 Moderate detail for clarity without overwhelming'}
                                {adFilters.length === 'detailed' && '📚 Comprehensive information for informed decisions'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Apply to All Channels Checkbox */}
                        <div className="flex items-center space-x-2 pt-4 border-t">
                          <Checkbox
                            id="applyToAll"
                            checked={applyToAllChannels}
                            onCheckedChange={(checked) => setApplyToAllChannels(checked as boolean)}
                          />
                          <Label
                            htmlFor="applyToAll"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Apply to all channels in Media Plan
                          </Label>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-4 border-t">
                          <div className="flex gap-3">
                            <Button
                              onClick={handleRegenerateAdCopy}
                              disabled={isRegenerating}
                              className="flex-1 h-12 text-base bg-gradient-primary hover:opacity-90 transition-opacity"
                              size="lg"
                            >
                              {isRegenerating ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Regenerating with AI...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-5 w-5 mr-2" />
                                  Regenerate All Ad Copy
                                </>
                              )}
                            </Button>
                            
                            {customizedCreatives && (
                              <Button
                                onClick={handleResetToOriginal}
                                variant="outline"
                                size="lg"
                                className="h-12"
                              >
                                Reset to Original
                              </Button>
                            )}
                          </div>
                          
                          {isRegenerating && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 animate-fade-in">
                              <p className="text-sm text-center text-muted-foreground">
                                ✨ Generating personalized ad copy for all channels...
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {customizedCreatives && (
                          <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Viewing customized ad copy
                            </span>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>

                  <div className="space-y-12">
                    {Array.from(recommendedChannels).map((channelType: string) => {
                      const channelCreatives = filteredCreatives.filter(c => c.channelType === channelType);
                      if (channelCreatives.length === 0) return null;

                      return (
                        <div key={channelType} className="space-y-6">
                          <h4 className="text-xl font-bold capitalize flex items-center gap-2">
                            {channelType} Ads
                            <span className="text-sm font-normal text-muted-foreground">
                              ({channelCreatives.length} placement{channelCreatives.length > 1 ? 's' : ''})
                            </span>
                          </h4>

                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {channelCreatives.map(creative => {
                              const renderPreview = () => {
                                if (creative.channelType === 'meta' && creative.placement === 'feed') return <MetaFeedAdPreview creative={creative} />;
                                if (creative.channelType === 'meta' && creative.placement.includes('story')) return <InstagramStoryAdPreview creative={creative} />;
                                if (creative.channelType === 'google' && creative.placement === 'search') return <GoogleSearchAdPreview creative={creative} />;
                                if (creative.channelType === 'google' && creative.placement === 'display') return <GoogleDisplayAdPreview creative={creative} />;
                                if (creative.channelType === 'pinterest') return <PinterestPinPreview creative={creative} />;
                                if (creative.channelType === 'tiktok') return <TikTokAdPreview creative={creative} />;
                                if (creative.channelType === 'youtube') return <YouTubeThumbnailPreview creative={creative} />;
                                return <AdCreativeCard creative={creative} />;
                              };

                              return (
                                <div key={creative.id} className="space-y-3">
                                  {renderPreview()}
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => {
                                      const copyText = `${creative.channel}\n\nHeadlines:\n${creative.headlines.join('\n')}\n\nDescriptions:\n${creative.descriptions.join('\n')}`;
                                      handleCopy(copyText, creative.channel);
                                    }}>
                                      <Copy className="h-3 w-3 mr-1" />Copy Specs
                                    </Button>
                                    {creative.imageUrl && (
                                      <Button size="sm" variant="outline" onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = creative.imageUrl!;
                                        link.download = `${creative.id}-image.png`;
                                        link.click();
                                        sonnerToast.success('Image downloaded!');
                                      }}>
                                        <Download className="h-3 w-3 mr-1" />Download
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ad creatives available</p>
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

        {/* Campaign Preview Dialog */}
        {selectedCampaign && (
          <CampaignPreviewDialog
            isOpen={!!selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
            campaign={selectedCampaign.campaign}
            weekNumber={selectedCampaign.weekNumber}
            adCreatives={filteredCreatives}
          />
        )}
      </div>
    </div>
  );
};

export default Results;
