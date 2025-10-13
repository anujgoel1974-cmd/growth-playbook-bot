import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, Target, Zap, TrendingUp, BarChart3 } from "lucide-react";

const analysisSteps = [
  {
    icon: Users,
    title: "Understanding Your Customers",
    description: "Analyzing demographics, behaviors, and pain points from your landing page content",
    duration: 25
  },
  {
    icon: Target,
    title: "Researching Competitors",
    description: "Identifying competing brands, scraping their products, and analyzing their market positioning",
    duration: 30
  },
  {
    icon: Zap,
    title: "Defining Campaign Strategy",
    description: "Building audience segments, crafting targeting parameters, and setting campaign objectives",
    duration: 20
  },
  {
    icon: TrendingUp,
    title: "Creating Ad Creatives",
    description: "Generating compelling headlines, descriptions, and visual concepts for each platform",
    duration: 20
  },
  {
    icon: BarChart3,
    title: "Optimizing Media Plan",
    description: "Calculating budget allocations, channel mix, and weekly rollout strategy for maximum ROAS",
    duration: 25
  }
];

export function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const estimatedDuration = 90000; // 90 seconds estimated time
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Use logarithmic progression to slow down as it approaches 100%
      // This ensures it never quite reaches 100% until the actual load completes
      const rawProgress = (elapsed / estimatedDuration) * 100;
      const newProgress = Math.min(rawProgress * (1 - rawProgress / 200), 95); // Cap at 95%
      setProgress(newProgress);

      // Calculate which step we should be on based on progress
      if (newProgress < 15) {
        setCurrentStep(0);
      } else if (newProgress < 35) {
        setCurrentStep(1);
      } else if (newProgress < 55) {
        setCurrentStep(2);
      } else if (newProgress < 75) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-card">
      <CardContent className="py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Analyzing Your Landing Page</h3>
            <p className="text-muted-foreground">AI is processing your content across 5 key areas</p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={step.title}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                    isActive
                      ? "border-primary bg-primary/5 scale-105"
                      : isCompleted
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-muted bg-muted/20"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <Icon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold mb-1 ${
                        isActive ? "text-primary" : isCompleted ? "text-green-600 dark:text-green-400" : ""
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {isActive && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>This comprehensive analysis typically takes 1-2 minutes</p>
            <p className="mt-1">Please keep this tab open while we work our magic ✨</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
