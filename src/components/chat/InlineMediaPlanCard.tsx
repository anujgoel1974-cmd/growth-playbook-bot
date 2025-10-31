import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { InlineCampaignCard } from './InlineCampaignCard';

interface MediaPlanChannel {
  name: string;
  campaignType: string;
  budget: number;
  percentage: number;
}

interface MediaPlan {
  weekNumber: number;
  channels: MediaPlanChannel[];
  reasoning?: string;
}

interface InlineMediaPlanCardProps {
  mediaPlan: MediaPlan;
  onViewCampaignDetails?: (campaign: MediaPlanChannel) => void;
}

export function InlineMediaPlanCard({ mediaPlan, onViewCampaignDetails }: InlineMediaPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalBudget = mediaPlan.channels.reduce((sum, ch) => sum + ch.budget, 0);

  return (
    <Card className="shadow-sm border-primary/20 animate-fade-in">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Week {mediaPlan.weekNumber} Media Plan</h4>
              <p className="text-xs text-muted-foreground">Total Budget: ${totalBudget}/week</p>
            </div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="space-y-3">
          {mediaPlan.channels.map((channel, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{channel.name}</span>
                  <span className="text-xs text-muted-foreground">({channel.campaignType})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${channel.budget}</span>
                  <span className="text-xs text-muted-foreground">({channel.percentage}%)</span>
                </div>
              </div>
              <Progress value={channel.percentage} className="h-2" />
            </div>
          ))}
        </div>

        {/* Expanded Campaigns */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <h5 className="text-sm font-semibold">Campaign Details</h5>
            {mediaPlan.channels.map((channel, idx) => (
              <InlineCampaignCard
                key={idx}
                campaign={channel}
                onViewDetails={() => onViewCampaignDetails?.(channel)}
              />
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                // TODO: Implement PDF export
                console.log('Export PDF');
              }}
            >
              <Download className="h-3 w-3 mr-2" />
              Download Full Report
            </Button>
          </div>
        )}

        {/* Strategy Reasoning */}
        {mediaPlan.reasoning && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Strategy:</span> {mediaPlan.reasoning}
            </p>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expand to see campaigns
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
