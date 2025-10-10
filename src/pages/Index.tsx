import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Target, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
              Turn Your Landing Page into a Full Growth Playbook
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Paste any product URL and get structured customer insights + campaign strategy instantly
            </p>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card className="shadow-card-hover border-2">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="Paste your product landing page URL here..."
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
                        Analyzing...
                      </>
                    ) : (
                      "Analyze My Page"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">① Paste Your URL</h3>
                <p className="text-sm text-muted-foreground">
                  Enter any product landing page you want to analyze
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">② AI Scrapes & Analyzes</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI extracts and understands your product positioning
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all hover-scale">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">③ Get Insights + Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Receive detailed personas and ready-to-use campaign strategies
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
