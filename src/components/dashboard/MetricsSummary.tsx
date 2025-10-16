import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AggregateMetrics } from '@/utils/mockCampaignData';

interface MetricsSummaryProps {
  aggregateMetrics: AggregateMetrics;
  userRole: string;
}

export function MetricsSummary({ aggregateMetrics, userRole }: MetricsSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-metrics-summary', {
        body: { aggregateMetrics, userRole }
      });

      if (functionError) throw functionError;
      
      if (data?.summary) {
        setSummary(data.summary);
      } else {
        throw new Error('No summary received');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      toast({
        title: 'Error',
        description: 'Failed to generate campaign summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateSummary();
  }, []);

  const handleRefresh = () => {
    toast({
      title: 'Refreshing insights...',
      description: 'Generating new analysis',
    });
    generateSummary();
  };

  return (
    <Card className="animate-fade-in border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Campaign Insights</CardTitle>
              <Badge variant="outline" className="mt-1">
                {userRole}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="hover:bg-primary/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">
            <p className="text-destructive mb-2">Failed to generate insights</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : (
          <p className="text-base leading-relaxed text-foreground">
            {summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
