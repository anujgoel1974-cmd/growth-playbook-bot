import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsTemplate } from '@/types/analytics';
import { Play } from 'lucide-react';

interface TemplateCardProps {
  template: AnalyticsTemplate;
  onRun: (templateId: string) => void;
}

export function TemplateCard({ template, onRun }: TemplateCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Overview": "bg-primary/10 text-primary border-primary/20",
      "Spend & Efficiency": "bg-accent/10 text-accent-foreground border-accent/20",
      "Funnel & Pixel": "bg-secondary/10 text-secondary-foreground border-secondary/20",
      "Creative & SKU": "bg-muted text-muted-foreground border-border",
      "Health & Anomalies": "bg-destructive/10 text-destructive border-destructive/20"
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold leading-tight">{template.name}</CardTitle>
          <Badge variant="outline" className={getCategoryColor(template.category)}>
            {template.category}
          </Badge>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={() => onRun(template.id)}
          variant="secondary"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          <Play className="h-3.5 w-3.5 mr-2" />
          Run Analysis
        </Button>
      </CardContent>
    </Card>
  );
}
