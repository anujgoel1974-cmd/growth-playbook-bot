import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Calendar, Newspaper, Gift, Share2, Users,
  Clock, Sparkles 
} from "lucide-react";

interface TrendCardProps {
  trend: {
    id: string;
    headline: string;
    overview: string;
    productAlignment: string;
    timeframe: 'past' | 'upcoming';
    relevanceScore: number;
    category: string;
    icon: string;
  };
}

const iconMap: Record<string, any> = {
  TrendingUp, Calendar, Newspaper, Gift, Share2, Users,
};

export const TrendCard = ({ trend }: TrendCardProps) => {
  const IconComponent = iconMap[trend.icon] || TrendingUp;
  
  return (
    <Card className="shadow-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <Badge variant={trend.timeframe === 'past' ? 'secondary' : 'default'} className="text-xs">
              {trend.timeframe === 'past' ? (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Recent
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Upcoming
                </>
              )}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {trend.relevanceScore}/10
          </Badge>
        </div>
        <CardTitle className="text-xl leading-tight">{trend.headline}</CardTitle>
        <CardDescription className="text-xs uppercase tracking-wide font-semibold text-primary/70">
          {trend.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            What's Trending
          </h4>
          <p className="text-sm leading-relaxed">{trend.overview}</p>
        </div>
        <div className="pt-3 border-t">
          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Marketing Opportunity
          </h4>
          <p className="text-sm leading-relaxed bg-primary/5 p-3 rounded-md border border-primary/10">
            {trend.productAlignment}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
