import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface InlineLoadingCardProps {
  title: string;
  description: string;
}

export function InlineLoadingCard({ title, description }: InlineLoadingCardProps) {
  return (
    <Card className="border-l-4 border-l-primary shadow-soft animate-fade-in-up">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center animate-glow-pulse">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm tracking-tight">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
