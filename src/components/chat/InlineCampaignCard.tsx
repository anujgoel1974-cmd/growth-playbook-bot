import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, DollarSign, Target } from 'lucide-react';

interface Campaign {
  name: string;
  campaignType: string;
  budget: number;
  percentage: number;
}

interface InlineCampaignCardProps {
  campaign: Campaign;
  onViewDetails: () => void;
}

export function InlineCampaignCard({ campaign, onViewDetails }: InlineCampaignCardProps) {
  return (
    <Card className="border-l-4 border-l-primary/30 hover:border-l-primary transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">{campaign.name}</h4>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {campaign.campaignType}
              </Badge>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span className="font-medium">${campaign.budget}/week</span>
              </div>
              <span>({campaign.percentage}% of budget)</span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onViewDetails}
            className="shrink-0"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}