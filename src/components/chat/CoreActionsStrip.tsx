import { useState } from 'react';
import { Rocket, FolderOpen, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CoreAction {
  id: 'create' | 'view-all' | 'analyze';
  icon: typeof Rocket;
  title: string;
  description: string;
  gradient: string;
  prompt: string;
}

const coreActions: CoreAction[] = [
  {
    id: 'create',
    icon: Rocket,
    title: 'Create New Campaign',
    description: 'Paste a URL to start',
    gradient: 'from-blue-500 to-blue-600',
    prompt: 'I want to create a new campaign'
  },
  {
    id: 'view-all',
    icon: FolderOpen,
    title: 'See All Previous Campaigns',
    description: 'View your history',
    gradient: 'from-purple-500 to-purple-600',
    prompt: 'Show me all my previous campaigns'
  },
  {
    id: 'analyze',
    icon: BarChart3,
    title: 'Analyze My Campaigns',
    description: 'Performance insights',
    gradient: 'from-green-500 to-green-600',
    prompt: 'Analyze my campaign performance'
  }
];

interface CoreActionsStripProps {
  onActionClick: (action: 'create' | 'view-all' | 'analyze') => void;
  className?: string;
}

export function CoreActionsStrip({ onActionClick, className }: CoreActionsStripProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn("sticky top-14 z-40 bg-background/95 backdrop-blur border-b", className)}>
      <div className="px-4 py-3">
        {/* Mobile toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mb-2 md:hidden flex items-center justify-between"
        >
          <span className="text-sm font-medium">Quick Actions</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {/* Actions grid */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-3 transition-all duration-300",
          !isExpanded && "hidden md:grid"
        )}>
          {coreActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
                onClick={() => onActionClick(action.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                    action.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight mb-0.5">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
