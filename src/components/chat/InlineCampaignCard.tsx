import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight } from 'lucide-react';

interface Campaign {
  name: string;
  campaignType: string;
  budget: number;
  percentage: number;
}

interface InlineCampaignCardProps {
  campaign: Campaign;
  weekNumber: number;
  onClick: () => void;
}

export function InlineCampaignCard({ campaign, weekNumber, onClick }: InlineCampaignCardProps) {
  return (
    <Card 
      className="shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-primary/50 hover:border-l-primary animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{campaign.name}</h4>
                <p className="text-xs text-muted-foreground">{campaign.campaignType}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Week {weekNumber}
            </Badge>
            <div className="text-right">
              <p className="text-sm font-bold">${campaign.budget}</p>
              <p className="text-xs text-muted-foreground">{campaign.percentage}% of budget</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-primary group-hover:text-primary/80 font-medium">
              Click to view full campaign details →
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
