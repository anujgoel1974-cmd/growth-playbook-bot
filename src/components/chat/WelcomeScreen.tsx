import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Plus, Lightbulb } from 'lucide-react';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  userName?: string;
  isExistingUser?: boolean;
}

export function WelcomeScreen({ onPromptClick, userName, isExistingUser = false }: WelcomeScreenProps) {
  // Check if user has active campaigns (from localStorage)
  const hasActiveCampaigns = isExistingUser && localStorage.getItem('hasActiveCampaigns') === 'true';
  
  const quickActions = hasActiveCampaigns
    ? [
        { icon: TrendingUp, label: 'Analyze performance', prompt: 'Show me my campaign performance dashboard' },
        { icon: Lightbulb, label: 'Deep dive metrics', prompt: 'Explain my key performance trends' },
        { icon: Plus, label: 'Create new campaign', prompt: 'Create a new campaign' },
      ]
    : isExistingUser
    ? [
        { icon: Plus, label: 'Create first campaign', prompt: 'Create a new campaign' },
        { icon: TrendingUp, label: 'View sample dashboard', prompt: 'Show me a sample campaign dashboard' },
        { icon: Sparkles, label: 'Campaign best practices', prompt: 'What are the best practices for campaign creation?' },
      ]
    : [
        { icon: Plus, label: 'Create my first campaign', prompt: 'Create a new campaign' },
        { icon: Sparkles, label: 'How does this work?', prompt: 'Explain how campaign creation works' },
        { icon: Lightbulb, label: 'Best practices', prompt: 'What are some campaign best practices?' },
      ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-6 animate-glow-pulse shadow-glow">
        <Sparkles className="w-8 h-8 text-primary-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        {userName ? `Welcome back, ${userName}! 👋` : 'Welcome to Campaign AI'}
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
        {hasActiveCampaigns
          ? "Your campaigns are running! Let's analyze performance, optimize budgets, or create something new."
          : isExistingUser 
          ? "Ready to launch your first campaign? I'll guide you through every step."
          : "I'm your AI marketing command center. I can analyze products, create campaigns, optimize your ad spend, and answer questions about your performance."}
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
        {quickActions.map((action, i) => (
          <Button
            key={action.label}
            variant="ghost"
            size="sm"
            onClick={() => onPromptClick(action.prompt)}
            className="h-auto py-2.5 px-4 rounded-full border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-sm shadow-soft hover:shadow-glow hover:scale-105 group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <action.icon className="mr-1.5 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            {action.label}
          </Button>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        {hasActiveCampaigns 
          ? 'Ask me anything about your campaigns, or try a quick action above.'
          : 'Type a message or paste a product URL to get started'}
      </p>
    </div>
  );
}
