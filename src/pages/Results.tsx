import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisSection {
  title?: string;
  content?: string;
  raw?: string;
}

interface AnalysisData {
  customerInsight?: Record<string, AnalysisSection>;
  campaignTargeting?: Record<string, AnalysisSection>;
}

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

  const renderSection = (section: AnalysisSection | undefined, sectionName: string) => {
    if (!section) return <p className="text-muted-foreground">No data available</p>;
    
    const content = section.content || section.raw || '';
    return (
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-foreground">{content}</div>
      </div>
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
            <TabsContent value="insight" className="space-y-6 animate-fade-in">
              {analysis?.customerInsight && Object.entries(analysis.customerInsight).map(([key, section]) => (
                <Card key={key} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {section.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(section.content || section.raw || '', section.title || key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderSection(section, key)}
                  </CardContent>
                </Card>
              ))}
              
              {(!analysis?.customerInsight || Object.keys(analysis.customerInsight).length === 0) && (
                <Card className="shadow-card">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No customer insight data available
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Campaign Targeting Tab */}
            <TabsContent value="targeting" className="space-y-6 animate-fade-in">
              {analysis?.campaignTargeting && Object.entries(analysis.campaignTargeting).map(([key, section]) => (
                <Card key={key} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {section.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(section.content || section.raw || '', section.title || key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderSection(section, key)}
                  </CardContent>
                </Card>
              ))}
              
              {(!analysis?.campaignTargeting || Object.keys(analysis.campaignTargeting).length === 0) && (
                <Card className="shadow-card">
                  <CardContent className="py-8 text-center text-muted-foreground">
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
