import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, ArrowLeft, Copy, Download,
  Users, Brain, Zap, MessageCircle, TrendingUp,
  Target, UsersRound, Search, Palette, DollarSign, Megaphone, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InsightCard {
  id: string;
  title: string;
  content: string;
  icon: string;
}

interface AnalysisData {
  customerInsight: InsightCard[];
  campaignTargeting: InsightCard[];
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
    
    return (
      <Card className="shadow-card hover:shadow-card-hover transition-all hover:scale-[1.02] group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
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
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {card.content}
          </div>
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
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="insight">Customer Insight</TabsTrigger>
              <TabsTrigger value="targeting">Campaign Targeting</TabsTrigger>
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
