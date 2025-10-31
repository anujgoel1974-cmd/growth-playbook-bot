import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Competitor {
  id: string;
  competitorName: string;
  domain: string;
  category: string;
  pricePoint: string;
  keyStrength: string;
  weakness: string;
}

interface InlineCompetitorCardProps {
  competitor: Competitor;
}

export function InlineCompetitorCard({ competitor }: InlineCompetitorCardProps) {
  return (
    <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-all animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm">{competitor.competitorName}</h4>
                <p className="text-xs text-muted-foreground">{competitor.domain}</p>
              </div>
              <a
                href={`https://${competitor.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {competitor.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {competitor.pricePoint}
              </Badge>
            </div>
            
            <div className="space-y-1.5 pt-1">
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-green-600 dark:text-green-400">✓</span>
                <p className="text-xs text-muted-foreground flex-1">{competitor.keyStrength}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">!</span>
                <p className="text-xs text-muted-foreground flex-1">{competitor.weakness}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
