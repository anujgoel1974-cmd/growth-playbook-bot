import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const url = searchParams.get("url");
  
  // Mock data - will be replaced with real API call
  const [isLoading] = useState(false);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${section} copied to clipboard`,
    });
  };

  if (!url) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          <div className="flex items-center gap-2">
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
              </div>
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
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Persona Profiles
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample persona data", "Persona Profiles")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Demographics, psychographics, and behavioral patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">Analysis results will appear here...</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Tonality & Voice
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample tonality data", "Tonality & Voice")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Communication style and personality traits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Pain Points & Motivators
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample pain points", "Pain Points")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Key friction points and buying triggers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Macro Factors
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample macro factors", "Macro Factors")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Industry trends and external influences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaign Targeting Tab */}
            <TabsContent value="targeting" className="space-y-6 animate-fade-in">
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Platform Recommendations
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample platforms", "Platforms")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Recommended advertising platforms and channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Audience Stack
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample audience", "Audience Stack")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Target demographics, interests, and exclusions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Keyword Groups
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample keywords", "Keywords")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Core keywords and negative matches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Creative Kit
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample creative", "Creative Kit")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Sample headlines, copy, and creative briefs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Campaign Strategy & Budget
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("Sample budget", "Budget")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Budget allocation and scaling recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analysis results will appear here...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Export Button */}
        {!isLoading && (
          <div className="mt-8 text-center">
            <Button size="lg" className="gap-2">
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
