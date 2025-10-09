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
  Share2, Image, Music, Video, Briefcase, Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
}

interface AnalysisData {
  customerInsight: InsightCard[];
  campaignTargeting: InsightCard[];
  mediaPlan?: MediaPlanWeek[];
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
                <p className="text-sm text-muted-foreground mt-2">This may take 30-60 seconds</p>
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
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="insight">Customer Insight</TabsTrigger>
              <TabsTrigger value="targeting">Campaign Targeting</TabsTrigger>
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
          </Tabs>
        )}

        {/* Export Button */}
        {!isLoading && !error && analysis && (
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "PDF export functionality will be available soon",
                });
              }}
            >
              <Download className="h-4 w-4" />
              Download Full Playbook as PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
