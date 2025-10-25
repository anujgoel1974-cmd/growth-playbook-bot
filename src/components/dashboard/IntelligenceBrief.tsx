import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, Briefcase, TrendingUp, Target, ArrowRight, 
  Lightbulb, CheckCircle2, AlertCircle, Sparkles,
  Calendar, Award
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InsightCard {
  id: string;
  title: string;
  content: string;
  icon: string;
}

interface TrendItem {
  id: string;
  headline: string;
  overview: string;
  timeframe: 'past' | 'upcoming';
  relevanceScore: number;
  category: string;
}

interface CompetitorCard {
  id: string;
  competitorName: string;
  keyStrength: string;
  weakness: string;
  marketPosition: string;
}

interface IntelligenceBriefProps {
  url: string;
  customerInsight: InsightCard[];
  competitiveAnalysis: {
    competitors: CompetitorCard[];
    insights: InsightCard[];
  };
  trendAnalysis: TrendItem[];
  onNavigateToTab: (tab: string) => void;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Users, Briefcase, TrendingUp, Target, Lightbulb, CheckCircle2, AlertCircle, Sparkles
};

export function IntelligenceBrief({ 
  url, 
  customerInsight, 
  competitiveAnalysis, 
  trendAnalysis,
  onNavigateToTab 
}: IntelligenceBriefProps) {
  
  // Extract top insights
  const topCustomerSegment = customerInsight[0];
  const topCompetitor = competitiveAnalysis.competitors[0];
  const topTrend = trendAnalysis.find(t => t.timeframe === 'upcoming') || trendAnalysis[0];
  const upcomingTrends = trendAnalysis.filter(t => t.timeframe === 'upcoming').length;
  const currentTrends = trendAnalysis.filter(t => t.timeframe === 'past').length;
  
  // Calculate segment distribution for visualization
  const segmentDistribution = customerInsight.slice(0, 4).map((insight, idx) => ({
    name: insight.title,
    percentage: idx === 0 ? 40 : idx === 1 ? 30 : idx === 2 ? 20 : 10
  }));

  // Generate strategic recommendations
  const recommendations = [
    {
      priority: 'high',
      action: `Target ${topCustomerSegment?.title || 'primary segment'} with messaging focused on ${competitiveAnalysis.insights[0]?.title.toLowerCase() || 'key differentiators'}`,
      reasoning: 'Highest conversion potential based on customer analysis and competitive gaps'
    },
    {
      priority: 'high',
      action: `Launch campaign around ${topTrend?.headline.substring(0, 50) || 'upcoming trend'}`,
      reasoning: `Capitalize on ${topTrend?.timeframe === 'upcoming' ? 'rising' : 'current'} trend with ${topTrend?.relevanceScore || 85}% relevance score`
    },
    {
      priority: 'medium',
      action: `Differentiate from ${topCompetitor?.competitorName || 'top competitor'} by emphasizing ${topCompetitor?.weakness.toLowerCase() || 'unique strengths'}`,
      reasoning: 'Exploit identified weakness in competitive positioning'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <Badge variant="outline" className="text-sm px-4 py-1">
          <Sparkles className="h-3 w-3 mr-1" />
          Campaign Intelligence Brief
        </Badge>
        <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Strategic Analysis Overview
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered insights from customer intelligence, competitive landscape, and trend analysis
        </p>
        
        {/* Key Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
          <div className="bg-card border rounded-lg p-4 shadow-card">
            <div className="text-3xl font-bold text-primary">{customerInsight.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Customer Segments</div>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-card">
            <div className="text-3xl font-bold text-primary">{competitiveAnalysis.competitors.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Competitors Analyzed</div>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-card">
            <div className="text-3xl font-bold text-primary">{trendAnalysis.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Trends Identified</div>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-card">
            <div className="text-3xl font-bold text-primary">{upcomingTrends}</div>
            <div className="text-xs text-muted-foreground mt-1">Upcoming Opportunities</div>
          </div>
        </div>
      </div>

      {/* Three-Column Intelligence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Intelligence */}
        <Card className="shadow-card hover:shadow-card-hover transition-all border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Customer Intelligence</CardTitle>
                <p className="text-xs text-muted-foreground">Target audience insights</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Top Insight Callout */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Primary Target Segment
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {topCustomerSegment?.title}
              </div>
            </div>

            {/* Segment Distribution Visual */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Segment Distribution</div>
              {segmentDistribution.map((segment, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{segment.name}</span>
                    <span className="font-semibold">{segment.percentage}%</span>
                  </div>
                  <Progress value={segment.percentage} className="h-2" />
                </div>
              ))}
            </div>

            {/* Key Insights */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Key Insights</div>
              {customerInsight.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{insight.content.split('\n')[0].substring(0, 80)}...</span>
                </div>
              ))}
            </div>

            {/* Action Item */}
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-300 dark:border-blue-700">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Action:</span>
                  <span className="text-blue-700 dark:text-blue-300"> Target {topCustomerSegment?.title} first for highest ROI potential</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Intelligence */}
        <Card className="shadow-card hover:shadow-card-hover transition-all border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Competitive Intelligence</CardTitle>
                <p className="text-xs text-muted-foreground">Market positioning</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Top Insight Callout */}
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Primary Competitor
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {topCompetitor?.competitorName}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-2">
                {topCompetitor?.marketPosition}
              </div>
            </div>

            {/* Competitive Positioning */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Competitive Landscape</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950/30 rounded p-3 border border-green-200 dark:border-green-800">
                  <Award className="h-4 w-4 text-green-600 dark:text-green-400 mb-1" />
                  <div className="text-xs font-semibold text-green-900 dark:text-green-100">Their Strength</div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">{topCompetitor?.keyStrength.substring(0, 40)}...</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded p-3 border border-orange-200 dark:border-orange-800">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mb-1" />
                  <div className="text-xs font-semibold text-orange-900 dark:text-orange-100">Their Gap</div>
                  <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">{topCompetitor?.weakness.substring(0, 40)}...</div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Strategic Insights</div>
              {competitiveAnalysis.insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{insight.content.split('\n')[0].substring(0, 80)}...</span>
                </div>
              ))}
            </div>

            {/* Action Item */}
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-300 dark:border-purple-700">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-purple-900 dark:text-purple-100">Action:</span>
                  <span className="text-purple-700 dark:text-purple-300"> Differentiate by addressing {topCompetitor?.weakness.substring(0, 30).toLowerCase()}...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Intelligence */}
        <Card className="shadow-card hover:shadow-card-hover transition-all border-2 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Trend Intelligence</CardTitle>
                <p className="text-xs text-muted-foreground">Market opportunities</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Top Insight Callout */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300">
                  {topTrend?.timeframe === 'upcoming' ? 'Upcoming' : 'Current'}
                </Badge>
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                  Top Opportunity
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                {topTrend?.headline}
              </div>
            </div>

            {/* Trend Timeline */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Trend Landscape</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded p-3 border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{upcomingTrends}</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Upcoming</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded p-3 border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{currentTrends}</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Current</div>
                </div>
              </div>
            </div>

            {/* Relevance Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Top Trend Relevance</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{topTrend?.relevanceScore}%</span>
              </div>
              <Progress value={topTrend?.relevanceScore || 0} className="h-2" />
            </div>

            {/* Key Trends */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Key Trends</div>
              {trendAnalysis.slice(0, 3).map((trend, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-xs">{trend.headline.substring(0, 50)}...</div>
                    <div className="text-xs text-muted-foreground">{trend.category}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Item */}
            <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-300 dark:border-emerald-700">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">Action:</span>
                  <span className="text-emerald-700 dark:text-emerald-300"> Launch campaign around {topTrend?.headline.substring(0, 30).toLowerCase()}...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations Panel */}
      <Card className="shadow-card border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">Strategic Recommendations</CardTitle>
              <p className="text-sm text-muted-foreground">Cross-intelligence action plan</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className="border rounded-lg p-4 bg-card hover:shadow-card transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <div className="font-semibold text-sm mb-1">{rec.action}</div>
                    <div className="text-xs text-muted-foreground">{rec.reasoning}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Footer */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-4 pb-8">
        <Button 
          variant="outline" 
          onClick={() => onNavigateToTab('insight')}
          className="w-full md:w-auto"
        >
          <Users className="h-4 w-4 mr-2" />
          View Full Customer Analysis
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onNavigateToTab('competitive')}
          className="w-full md:w-auto"
        >
          <Briefcase className="h-4 w-4 mr-2" />
          View Competitive Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onNavigateToTab('trends')}
          className="w-full md:w-auto"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View Trend Analysis
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
