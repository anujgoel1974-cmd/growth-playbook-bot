import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Target, Zap, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    
    // Navigate to results page
    setTimeout(() => {
      navigate(`/results?url=${encodeURIComponent(url)}`);
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
          {/* Headline */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
              {isNewToAdvertising 
                ? "Launch Your First Growth Campaign in Minutes"
                : "Turn Your Landing Page into a Full Growth Playbook"
              }
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isNewToAdvertising
                ? "Simply paste your product page URL and we'll create a complete campaign strategy ready to launch"
                : "Paste any product URL and get structured customer insights + campaign strategy instantly"
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
                    placeholder={isNewToAdvertising 
                      ? "Paste your product page URL to launch your campaign..."
                      : "Paste your product landing page URL here..."
                    }
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
                        {isNewToAdvertising ? "Creating Campaign..." : "Analyzing..."}
                      </>
                    ) : (
                      isNewToAdvertising ? "Launch Campaign" : "Analyze My Page"
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
                      {isNewToAdvertising 
                        ? "Launch Campaigns for Multiple Products"
                        : "Analyze Your Entire Product Catalog"
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {isNewToAdvertising
                        ? "Have multiple products? We'll create campaign strategies for your entire catalog at once"
                        : "Extract and categorize all products from your e-commerce site for bulk campaign planning"
                      }
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
                          {isNewToAdvertising ? "Setting Up..." : "Extracting..."}
                        </>
                      ) : (
                        isNewToAdvertising ? "Launch Multi-Product Campaign" : "Extract Catalog"
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
                  {isNewToAdvertising ? "① Share Your Product" : "① Paste Your URL"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isNewToAdvertising 
                    ? "Paste your product page URL - that's all we need to get started"
                    : "Enter any product landing page you want to analyze"
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">
                  {isNewToAdvertising ? "② AI Builds Strategy" : "② AI Scrapes & Analyzes"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isNewToAdvertising
                    ? "Our AI creates your customer personas, targeting, and campaign creatives"
                    : "Our AI extracts and understands your product positioning"
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">
                  {isNewToAdvertising ? "③ Launch & Grow" : "③ Get Insights + Plan"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isNewToAdvertising
                    ? "Get ready-to-use ads for Google, Meta, TikTok and more platforms"
                    : "Receive detailed personas and ready-to-use campaign strategies"
                  }
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
