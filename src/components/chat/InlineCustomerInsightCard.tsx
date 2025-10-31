import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';

interface CustomerInsight {
  id: string;
  title: string;
  content: string;
  icon?: string;
  subItems?: Array<{ label: string; value: string }>;
}

interface InlineCustomerInsightCardProps {
  insight: CustomerInsight;
}

export function InlineCustomerInsightCard({ insight }: InlineCustomerInsightCardProps) {
  return (
    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm">{insight.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
            
            {insight.subItems && insight.subItems.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {insight.subItems.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    <span className="font-medium">{item.label}:</span>
                    <span className="ml-1">{item.value}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
