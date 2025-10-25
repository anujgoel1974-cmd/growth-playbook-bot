import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, Briefcase, TrendingUp, Target, ArrowRight, 
  Lightbulb, CheckCircle2, AlertCircle, Sparkles,
  Calendar, Award, DollarSign, MapPin, Heart, Zap
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
  
  // Helper function to extract text from bullet points
  const extractBulletPoints = (content: string, limit = 3) => {
    const lines = content.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
    return lines.slice(0, limit).map(line => line.replace(/^[•\-]\s*/, '').trim());
  };

  // Helper function to find section by title
  const findSection = (title: string) => {
    return customerInsight.find(insight => 
      insight.title.toLowerCase().includes(title.toLowerCase())
    );
  };

  // Extract persona information
  const extractPersonaProfile = () => {
    const personasSection = findSection('target persona');
    const demographicsSection = findSection('demographic');
    const psychographicsSection = findSection('psychographic');
    const painPointsSection = findSection('pain point');
    const triggersSection = findSection('decision trigger');
    const communicationSection = findSection('communication');

    // Extract persona name from first persona section
    let personaName = 'Target Audience';
    if (personasSection) {
      const firstLine = personasSection.content.split('\n').find(line => 
        line.includes('Persona') || line.includes(':')
      );
      if (firstLine) {
        const match = firstLine.match(/Persona \d+:\s*(?:The\s+)?["']?([^"'\n-]+)["']?/i);
        if (match) {
          personaName = match[1].trim();
        }
      }
    }

    // Extract demographics
    const demographics = {
      age: '',
      income: '',
      gender: '',
      location: ''
    };

    if (demographicsSection) {
      const content = demographicsSection.content;
      const ageMatch = content.match(/Age:\s*([^\n•]+)/i);
      const incomeMatch = content.match(/Income:\s*([^\n•]+)/i);
      const genderMatch = content.match(/Gender:\s*([^\n•]+)/i);
      const locationMatch = content.match(/Location:\s*([^\n•]+)/i);

      if (ageMatch) demographics.age = ageMatch[1].trim();
      if (incomeMatch) demographics.income = incomeMatch[1].trim();
      if (genderMatch) demographics.gender = genderMatch[1].trim();
      if (locationMatch) demographics.location = locationMatch[1].trim();
    }

    // Extract psychographics
    const values = psychographicsSection ? extractBulletPoints(psychographicsSection.content, 3) : [];
    
    // Extract pain points
    const painPoints = painPointsSection ? extractBulletPoints(painPointsSection.content, 3) : [];

    // Extract decision triggers
    const triggers = triggersSection ? extractBulletPoints(triggersSection.content, 3) : [];

    // Extract communication style
    let communicationTone = '';
    let communicationThemes = '';
    if (communicationSection) {
      const toneMatch = communicationSection.content.match(/Tone[:\s]+([^\n•]+)/i);
      const themesMatch = communicationSection.content.match(/(?:Language|Themes|Messaging)[:\s]+([^\n•]+)/i);
      if (toneMatch) communicationTone = toneMatch[1].trim();
      if (themesMatch) communicationThemes = themesMatch[1].trim();
    }

    return {
      personaName,
      demographics,
      values,
      painPoints,
      triggers,
      communicationTone,
      communicationThemes
    };
  };

  const persona = extractPersonaProfile();
  
  // Extract top insights
  const topCompetitor = competitiveAnalysis.competitors[0];
  const topTrend = trendAnalysis.find(t => t.timeframe === 'upcoming') || trendAnalysis[0];
  const upcomingTrends = trendAnalysis.filter(t => t.timeframe === 'upcoming').length;
  const currentTrends = trendAnalysis.filter(t => t.timeframe === 'past').length;

  // Generate strategic recommendations
  const recommendations = [
    {
      priority: 'high',
      action: `Target "${persona.personaName}" with messaging focused on ${competitiveAnalysis.insights[0]?.title.toLowerCase() || 'key differentiators'}`,
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
                <p className="text-xs text-muted-foreground">Target persona profile</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {/* Persona Hero */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">Primary Persona</div>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {persona.personaName}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {persona.demographics.age && `${persona.demographics.age} • `}
                {persona.demographics.income && `${persona.demographics.income} • `}
                {persona.demographics.location}
              </div>
            </div>

            {/* Demographics Grid */}
            {(persona.demographics.age || persona.demographics.income || persona.demographics.gender || persona.demographics.location) && (
              <div className="grid grid-cols-2 gap-2">
                {persona.demographics.age && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-2 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase">Age</div>
                    </div>
                    <div className="text-xs font-medium text-blue-900 dark:text-blue-100">{persona.demographics.age}</div>
                  </div>
                )}
                {persona.demographics.income && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-2 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase">Income</div>
                    </div>
                    <div className="text-xs font-medium text-blue-900 dark:text-blue-100">{persona.demographics.income}</div>
                  </div>
                )}
                {persona.demographics.gender && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-2 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase">Gender</div>
                    </div>
                    <div className="text-xs font-medium text-blue-900 dark:text-blue-100">{persona.demographics.gender}</div>
                  </div>
                )}
                {persona.demographics.location && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-2 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase">Location</div>
                    </div>
                    <div className="text-xs font-medium text-blue-900 dark:text-blue-100">{persona.demographics.location}</div>
                  </div>
                )}
              </div>
            )}

            {/* Core Profile */}
            <div className="space-y-3">
              {persona.values.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">Values & Motivations</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.values.map((value, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30">
                        {value.length > 40 ? value.substring(0, 40) + '...' : value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {persona.painPoints.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                    <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">Pain Points</div>
                  </div>
                  <div className="space-y-1.5">
                    {persona.painPoints.map((pain, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs">
                        <div className="h-1 w-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                        <span className="text-muted-foreground leading-tight">{pain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Decision Triggers */}
            {persona.triggers.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <div className="text-xs font-semibold text-green-900 dark:text-green-100">Decision Triggers</div>
                </div>
                <div className="space-y-1.5">
                  {persona.triggers.map((trigger, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-green-700 dark:text-green-300 leading-tight">{trigger}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communication Guide */}
            {(persona.communicationTone || persona.communicationThemes) && (
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-300 dark:border-blue-700">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">How to Communicate</div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {persona.communicationTone && (
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Tone:</span>
                      <span className="text-blue-700 dark:text-blue-300 ml-1">{persona.communicationTone}</span>
                    </div>
                  )}
                  {persona.communicationThemes && (
                    <div>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Messaging:</span>
                      <span className="text-blue-700 dark:text-blue-300 ml-1">{persona.communicationThemes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Item */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-950/20 rounded-lg p-3 border border-blue-300 dark:border-blue-700">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Action:</span>
                  <span className="text-blue-700 dark:text-blue-300"> Target "{persona.personaName}" with {persona.communicationTone ? persona.communicationTone.toLowerCase() : 'personalized'} messaging that addresses their core pain points</span>
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
