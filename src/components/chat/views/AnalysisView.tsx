import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Share2 } from 'lucide-react';
import { TrendCard } from '@/components/TrendCard';
import { GoogleSearchAdPreview } from '@/components/ad-previews/GoogleSearchAdPreview';
import { MetaFeedAdPreview } from '@/components/ad-previews/MetaFeedAdPreview';
import { GoogleDisplayAdPreview } from '@/components/ad-previews/GoogleDisplayAdPreview';
import { InstagramStoryAdPreview } from '@/components/ad-previews/InstagramStoryAdPreview';
import { TikTokAdPreview } from '@/components/ad-previews/TikTokAdPreview';
import { YouTubeThumbnailPreview } from '@/components/ad-previews/YouTubeThumbnailPreview';
import { PinterestPinPreview } from '@/components/ad-previews/PinterestPinPreview';
import { VisualCanvasData } from '@/types/visual-canvas';

interface AnalysisViewProps {
  data?: VisualCanvasData;
  onSendChatMessage?: (msg: any) => void;
}

export function AnalysisView({ data, onSendChatMessage }: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState('media-plan');
  const [dailyBudget, setDailyBudget] = useState(15);
  const [numberOfWeeks, setNumberOfWeeks] = useState(4);
  
  if (!data?.analysisData) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No analysis data available
      </div>
    );
  }
  
  const analysis = data.analysisData;
  
  const handleBudgetChange = (newBudget: number) => {
    setDailyBudget(newBudget);
    onSendChatMessage?.({
      role: 'assistant',
      content: `I've updated your media plan to $${newBudget}/day. The budget allocation has been recalculated across all platforms.`
    });
  };
  
  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid grid-cols-5 w-full">
          <TabsTrigger value="media-plan">Media Plan</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="creatives">Creatives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="media-plan" className="space-y-4">
          {/* Budget controls */}
          <Card>
            <CardHeader>
              <CardTitle>Adjust Budget</CardTitle>
              <CardDescription>Customize your campaign budget and duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Daily Budget: ${dailyBudget}</Label>
                <Slider
                  value={[dailyBudget]}
                  onValueChange={([v]) => handleBudgetChange(v)}
                  min={5}
                  max={500}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Campaign Duration</Label>
                <Select value={numberOfWeeks.toString()} onValueChange={(v) => setNumberOfWeeks(Number(v))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 week</SelectItem>
                    <SelectItem value="2">2 weeks</SelectItem>
                    <SelectItem value="4">4 weeks</SelectItem>
                    <SelectItem value="8">8 weeks</SelectItem>
                    <SelectItem value="12">12 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Render media plan weeks */}
          {analysis.mediaPlan?.map((week: any, idx: number) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>Week {week.weekNumber || idx + 1}</CardTitle>
                <CardDescription>Total Budget: ${week.totalBudget}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {week.channels?.map((ch: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{ch.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({ch.campaignType})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{ch.percentage}%</Badge>
                      <span className="font-semibold">${ch.budget}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          
          {/* Export actions */}
          <div className="flex gap-3">
            <Button className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {analysis.customerInsights?.map((insight: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {insight.icon && <span>{insight.icon}</span>}
                    {insight.persona || insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insight.description && (
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  )}
                  {insight.painPoints && insight.painPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Pain Points</h4>
                      <ul className="text-sm space-y-1">
                        {insight.painPoints.map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insight.decisionTriggers && insight.decisionTriggers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Decision Triggers</h4>
                      <ul className="text-sm space-y-1">
                        {insight.decisionTriggers.map((trigger: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{trigger}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="competitors" className="space-y-4">
          <div className="grid gap-4">
            {analysis.competitors?.map((comp: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{comp.name}</CardTitle>
                  <CardDescription>{comp.positioning}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comp.strengths && comp.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1">
                        {comp.strengths.map((strength: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {comp.weaknesses && comp.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Weaknesses</h4>
                      <ul className="text-sm space-y-1">
                        {comp.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-muted-foreground">-</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {analysis.trends?.map((trend: any, idx: number) => (
              <TrendCard key={idx} trend={trend} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="creatives" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.adCreatives?.map((creative: any, idx: number) => {
              if (creative.channelType === 'google' && creative.placement === 'Search') {
                return <GoogleSearchAdPreview key={idx} creative={creative} />;
              }
              if (creative.channelType === 'google' && creative.placement === 'Display') {
                return <GoogleDisplayAdPreview key={idx} creative={creative} />;
              }
              if (creative.channelType === 'meta' && creative.placement === 'Feed') {
                return <MetaFeedAdPreview key={idx} creative={creative} />;
              }
              if (creative.channelType === 'meta' && creative.placement === 'Story') {
                return <InstagramStoryAdPreview key={idx} creative={creative} />;
              }
              if (creative.channelType === 'tiktok') {
                return <TikTokAdPreview key={idx} creative={creative} />;
              }
              if (creative.channelType === 'youtube') {
                return <YouTubeThumbnailPreview key={idx} creative={creative} />;
              }
              if (creative.channelType === 'pinterest') {
                return <PinterestPinPreview key={idx} creative={creative} />;
              }
              return null;
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
