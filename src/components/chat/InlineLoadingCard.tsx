import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface InlineLoadingCardProps {
  title: string;
  description: string;
}

export function InlineLoadingCard({ title, description }: InlineLoadingCardProps) {
  return (
    <Card className="border-l-4 border-l-primary shadow-sm animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
