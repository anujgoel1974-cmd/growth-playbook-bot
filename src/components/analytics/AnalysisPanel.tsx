import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { AnalyticsRunResponse } from '@/types/analytics';
import { SectionRenderer } from './SectionRenderer';
import { RecommendationCard } from './RecommendationCard';

interface AnalysisPanelProps {
  response: AnalyticsRunResponse | null;
  isLoading: boolean;
  platforms?: string[];
  timeRange?: string;
}

export function AnalysisPanel({ response, isLoading, platforms = [], timeRange = '' }: AnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow-pulse mx-auto">
              <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Analyzing your account...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Running analysis across platforms and campaigns
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Select a template to get started</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose an analytics template from the left to see insights and recommendations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Context Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-medium">
              {response.templateId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {timeRange && (
              <Badge variant="secondary" className="text-xs">
                {timeRange}
              </Badge>
            )}
            {platforms.length > 0 && platforms.map(platform => (
              <Badge key={platform} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Session: {response.sessionId.split('_')[1]}
          </span>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{response.summary}</p>
          </CardContent>
        </Card>

        {/* Sections */}
        {response.sections.map((section, idx) => (
          <SectionRenderer key={idx} section={section} />
        ))}

        {/* Recommendations */}
        {response.recommendations && response.recommendations.length > 0 && (
          <RecommendationCard recommendations={response.recommendations} />
        )}
      </div>
    </div>
  );
}
