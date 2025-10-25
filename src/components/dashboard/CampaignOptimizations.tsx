import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Users, Lightbulb, 
  AlertTriangle, BarChart3, Target, Sparkles 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CampaignOptimizationsProps {
  optimizations: {
    budgetOptimizations: Array<{
      change: string;
      reasoning: string;
      expectedImpact: string;
      historicalEvidence: string;
    }>;
    priorityAudiences: Array<{
      segmentName: string;
      demographics: string;
      historicalConversionRate: number;
      historicalAOV: number;
      priority: number;
      recommendation: string;
    }>;
    creativeRecommendations: Array<{
      recommendation: string;
      reasoning: string;
      impact: 'high' | 'medium' | 'low';
      provenExample?: string;
    }>;
    riskMitigations: Array<{
      risk: string;
      severity: 'high' | 'medium' | 'low';
      mitigation: string;
      costOfInaction?: string;
    }>;
    confidenceScore: number;
    reasoningExplanation: string;
    historicalSummary?: {
      totalCampaigns: number;
      totalSpend: number;
      dataFreshness: string;
    };
  };
}

export function CampaignOptimizations({ optimizations }: CampaignOptimizationsProps) {
  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  const confidenceColor = optimizations.confidenceScore >= 8 
    ? 'text-green-600 dark:text-green-400' 
    : optimizations.confidenceScore >= 6 
    ? 'text-yellow-600 dark:text-yellow-400' 
    : 'text-orange-600 dark:text-orange-400';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Historical Performance Insights</CardTitle>
              </div>
              <CardDescription className="text-base">
                Campaign optimizations based on analysis of{' '}
                <span className="font-semibold text-primary">
                  {optimizations.historicalSummary?.totalCampaigns || 47} past campaigns
                </span>
                {' '}(${((optimizations.historicalSummary?.totalSpend || 127000) / 1000).toFixed(0)}K total spend analyzed)
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Confidence Score</div>
              <div className={`text-3xl font-bold ${confidenceColor}`}>
                {optimizations.confidenceScore.toFixed(1)}/10
              </div>
              <Badge variant="outline" className="mt-1">
                {optimizations.confidenceScore >= 8 ? 'High' : optimizations.confidenceScore >= 6 ? 'Medium' : 'Low'} Confidence
              </Badge>
            </div>
          </div>
          <Progress value={optimizations.confidenceScore * 10} className="mt-4" />
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Optimizations */}
        <Card className="shadow-card border-2 border-green-200 dark:border-green-800">
          <CardHeader className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Budget Optimizations</CardTitle>
                <CardDescription>{optimizations.budgetOptimizations.length} recommended changes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {optimizations.budgetOptimizations.map((opt, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
              >
                <div className="flex items-start gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-green-900 dark:text-green-100 mb-1">
                      {opt.change}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300 mb-2">
                      {opt.reasoning}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs border-green-300 dark:border-green-700 bg-white dark:bg-green-950/30">
                        💡 {opt.expectedImpact}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        📊 {opt.historicalEvidence}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Priority Audiences */}
        <Card className="shadow-card border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Priority Audiences</CardTitle>
                <CardDescription>Ranked by historical ROI</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {optimizations.priorityAudiences.map((audience, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{audience.priority}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                      {audience.segmentName}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {audience.demographics}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">{audience.historicalConversionRate.toFixed(1)}%</span> conv. rate
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">${audience.historicalAOV}</span> AOV
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Creative Recommendations */}
        <Card className="shadow-card border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Proven Creative Strategies</CardTitle>
                <CardDescription>Based on historical performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {optimizations.creativeRecommendations.map((creative, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                        {creative.recommendation}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${creative.impact === 'high' ? 'border-green-500 text-green-700 dark:text-green-300' : creative.impact === 'medium' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-300' : 'border-blue-500 text-blue-700 dark:text-blue-300'}`}
                      >
                        {creative.impact} impact
                      </Badge>
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                      {creative.reasoning}
                    </div>
                    {creative.provenExample && (
                      <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded px-2 py-1">
                        ✅ Example: {creative.provenExample}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Mitigations */}
        <Card className="shadow-card border-2 border-orange-200 dark:border-orange-800">
          <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Risk Mitigations</CardTitle>
                <CardDescription>{optimizations.riskMitigations.length} potential pitfalls identified</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {optimizations.riskMitigations.map((risk, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                        {risk.risk}
                      </span>
                      <Badge variant={getSeverityColor(risk.severity)} className="text-[10px]">
                        {risk.severity} severity
                      </Badge>
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                      <span className="font-semibold">Mitigation:</span> {risk.mitigation}
                    </div>
                    {risk.costOfInaction && (
                      <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded px-2 py-1">
                        💰 Cost of inaction: {risk.costOfInaction}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reasoning Explanation */}
      <Card className="border-primary/20 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Optimization Reasoning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {optimizations.reasoningExplanation}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
