import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Download, Share2 } from 'lucide-react';
import { VisualCanvasData } from '@/types/visual-canvas';

interface MediaPlanViewProps {
  data?: VisualCanvasData;
  onSendChatMessage?: (msg: any) => void;
}

export function MediaPlanView({ data, onSendChatMessage }: MediaPlanViewProps) {
  const [dailyBudget, setDailyBudget] = useState(15);
  
  if (!data?.mediaPlan || data.mediaPlan.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No media plan available
      </div>
    );
  }
  
  const handleBudgetChange = (newBudget: number) => {
    setDailyBudget(newBudget);
    onSendChatMessage?.({
      role: 'assistant',
      content: `I've updated your media plan to $${newBudget}/day. Here's how the budget is now allocated across all platforms.`
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Budget controls */}
      <Card>
        <CardHeader>
          <CardTitle>Adjust Your Media Plan</CardTitle>
          <CardDescription>Customize your daily budget to see updated allocations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Daily Budget</Label>
            <Slider
              value={[dailyBudget]}
              onValueChange={([v]) => handleBudgetChange(v)}
              min={5}
              max={500}
              step={5}
              className="mt-2"
            />
            <span className="text-sm text-muted-foreground">${dailyBudget}/day</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Media plan weeks */}
      {data.mediaPlan.map((week: any, idx: number) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>Week {week.weekNumber || idx + 1}</CardTitle>
            <CardDescription>
              Total Budget: ${week.totalBudget} • {week.channels?.length} Platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {week.channels?.map((ch: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex-1">
                  <span className="font-medium">{ch.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({ch.campaignType})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{ch.percentage}%</Badge>
                  <span className="font-semibold">${ch.budget}</span>
                </div>
              </div>
            ))}
            {week.reasoning && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                {week.reasoning}
              </p>
            )}
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
    </div>
  );
}
