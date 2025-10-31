import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Target, Zap, Loader2, Package, MessageSquare, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [homepageUrl, setHomepageUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewToAdvertising = localStorage.getItem("hasAdvertisedBefore") === "false";

  useEffect(() => {
    const hasCompleted = localStorage.getItem("hasCompletedOnboarding");
    if (!hasCompleted) {
      navigate("/onboarding");
    }
  }, [navigate]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a landing page URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Get user role for personalized analysis
    const userRole = localStorage.getItem('userRole') || 'Other';
    
    // Navigate to results page with role context
    setTimeout(() => {
      navigate(`/results?url=${encodeURIComponent(url)}&userRole=${encodeURIComponent(userRole)}`);
      setIsAnalyzing(false);
    }, 500);
  };

  const handleExtractCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!homepageUrl) {
      toast({
        title: "URL Required",
        description: "Please enter your homepage URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(homepageUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid homepage URL",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    
    // Navigate to sitemap page
    setTimeout(() => {
      navigate(`/sitemap?url=${encodeURIComponent(homepageUrl)}`);
      setIsExtracting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* NEW: Chat Mode Toggle Banner */}
          <div className="animate-fade-in">
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-md">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">✨ Try Our New Chat-Based Campaign Builder</h3>
                        <Badge variant="secondary" className="text-xs">Experimental</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Build campaigns conversationally with AI guidance</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/campaign-chat')}
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 shadow-md"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Try Chat Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Headline */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
              {isNewToAdvertising 
                ? "Launch Your First Campaign in Minutes"
                : "Launch High-Impact Campaigns Instantly"
              }
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isNewToAdvertising
                ? "Paste your product URL and get a complete campaign strategy with ready-to-use ads for every platform"
                : "Transform any product URL into a full campaign playbook with AI-powered targeting and creative assets"
              }
            </p>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card className="shadow-card-hover border-2">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="Paste your product page URL to create your campaign..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-12 text-base"
                    disabled={isAnalyzing}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="px-8 bg-gradient-primary hover:opacity-90 transition-opacity"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Building Campaign...
                      </>
                    ) : (
                      "Create Campaign"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted-foreground text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Catalog Analysis Option */}
          <div className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Card className="shadow-card-hover border-2 border-dashed border-accent/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Launch Multi-Product Campaigns
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Have multiple products? We'll extract your catalog and create campaign strategies for all products at once
                    </p>
                  </div>
                  <form onSubmit={handleExtractCatalog} className="flex gap-3">
                    <Input
                      type="url"
                      placeholder="Enter your homepage URL (e.g., https://example.com)"
                      value={homepageUrl}
                      onChange={(e) => setHomepageUrl(e.target.value)}
                      className="flex-1 h-12"
                      disabled={isExtracting}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      variant="outline"
                      className="px-6 border-2"
                      disabled={isExtracting}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Building Campaigns...
                        </>
                      ) : (
                        "Launch Catalog Campaigns"
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  ① Enter Product URL
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paste your product page URL—that's all we need to start building your campaign
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">
                  ② AI Creates Strategy
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI builds customer personas, targeting parameters, and generates campaign creatives automatically
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  ③ Launch Campaigns
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get platform-ready ads for Google, Meta, TikTok, and more—download and launch instantly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
