import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
}

export function InlineMediaPlanCard({ mediaPlan }: InlineMediaPlanCardProps) {
  const totalBudget = mediaPlan.channels.reduce((sum, ch) => sum + ch.budget, 0);

  return (
    <Card className="shadow-sm border-primary/20 animate-fade-in">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Week {mediaPlan.weekNumber} Budget Allocation</h4>
              <p className="text-xs text-muted-foreground">Total: ${totalBudget}/week</p>
            </div>
          </div>
        </div>

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

        {mediaPlan.reasoning && (
          <div className="bg-muted/50 rounded-lg p-3 mt-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Strategy:</span> {mediaPlan.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
