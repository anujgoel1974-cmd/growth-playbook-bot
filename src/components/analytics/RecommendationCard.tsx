import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recommendation } from '@/types/analytics';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface RecommendationCardProps {
  recommendations: Recommendation[];
}

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  const getIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-primary" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      critical: { variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/20' },
      warning: { variant: 'outline', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' },
      info: { variant: 'default', className: 'bg-primary/10 text-primary border-primary/20' }
    };
    
    const config = variants[severity || 'info'];
    return (
      <Badge variant={config.variant} className={config.className}>
        {severity || 'info'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <CardTitle className="text-base">Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg border bg-card/50">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(rec.severity)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm">{rec.title}</h4>
                  {getSeverityBadge(rec.severity)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>
                {rec.tags && rec.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {rec.tags.map((tag, tagIdx) => (
                      <Badge key={tagIdx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
