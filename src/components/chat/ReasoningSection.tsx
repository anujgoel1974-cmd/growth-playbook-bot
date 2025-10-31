import { useState } from 'react';
import { ChevronDown, CheckCircle2, Loader2, Circle } from 'lucide-react';
import { ReasoningStep } from '@/types/unified-chat';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';

interface ReasoningSectionProps {
  steps: ReasoningStep[];
}

export function ReasoningSection({ steps }: ReasoningSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const allComplete = steps.every(step => step.status === 'complete');

  const getIcon = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-muted/50 rounded-2xl border overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-muted/80"
          >
            <div className="flex items-center gap-2">
              {allComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              )}
              <span className="font-medium">
                {allComplete ? 'Analysis Complete' : 'Analyzing...'}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                {getIcon(step.status)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${step.status === 'complete' ? 'text-muted-foreground' : ''}`}>
                    {step.text}
                  </p>
                  {step.status === 'in-progress' && step.progress !== undefined && (
                    <Progress value={step.progress} className="mt-2 h-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
