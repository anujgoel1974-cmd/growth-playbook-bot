import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar } from 'lucide-react';

interface Trend {
  id: string;
  headline: string;
  overview: string;
  productAlignment: string;
  timeframe: 'past' | 'upcoming';
  relevanceScore: number;
  category: string;
}

interface InlineTrendCardProps {
  trend: Trend;
}

export function InlineTrendCard({ trend }: InlineTrendCardProps) {
  return (
    <Card className="border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-all animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm flex-1">{trend.headline}</h4>
              <Badge 
                variant={trend.timeframe === 'upcoming' ? 'default' : 'secondary'}
                className="text-xs flex-shrink-0"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {trend.timeframe === 'upcoming' ? 'Upcoming' : 'Past'}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">{trend.overview}</p>
            
            <div className="bg-muted/50 rounded-lg p-2.5 mt-2">
              <p className="text-xs">
                <span className="font-medium text-foreground">How it applies:</span>{' '}
                <span className="text-muted-foreground">{trend.productAlignment}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs">
                {trend.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {trend.relevanceScore}% relevant
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
