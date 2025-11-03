import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Plus, Lightbulb } from 'lucide-react';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  userName?: string;
  isExistingUser?: boolean;
}

export function WelcomeScreen({ onPromptClick, userName, isExistingUser = false }: WelcomeScreenProps) {
  const quickActions = isExistingUser
    ? [
        { icon: TrendingUp, label: 'View my campaigns', prompt: 'Show me my campaign performance' },
        { icon: Lightbulb, label: 'Optimize budgets', prompt: 'How can I optimize my budget allocation?' },
        { icon: Plus, label: 'Create new campaign', prompt: 'I want to create a new campaign' },
      ]
    : [
        { icon: Plus, label: 'Create your first campaign', prompt: 'I want to create a new campaign' },
        { icon: Sparkles, label: 'Learn how to use this', prompt: 'How does this platform work?' },
        { icon: TrendingUp, label: 'See example campaign', prompt: 'Show me an example campaign' },
      ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-primary-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">
        {userName ? `Welcome back, ${userName}!` : 'Welcome to Campaign AI'}
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mb-10">
        I'm your AI marketing command center. I can analyze products, create campaigns, 
        optimize your ad spend, and answer questions about your performance.
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            size="sm"
            onClick={() => onPromptClick(action.prompt)}
            className="h-auto py-2 px-4 rounded-full border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm"
          >
            <action.icon className="mr-1.5 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Type a message or paste a product URL to get started
      </p>
    </div>
  );
}
