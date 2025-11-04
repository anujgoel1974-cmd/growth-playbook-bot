import { ActionPrompt } from '@/types/unified-chat';
import { Button } from '@/components/ui/button';

interface ActionPromptChipsProps {
  prompts: ActionPrompt[];
  onPromptClick: (action: string) => void;
}

export function ActionPromptChips({ prompts, onPromptClick }: ActionPromptChipsProps) {
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = [];
    }
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<string, ActionPrompt[]>);

  const categoryLabels = {
    deep_dive: '🔍 Deep dive into:',
    make_changes: '✏️ Make changes:',
    take_action: '🚀 Take action:',
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm font-medium text-muted-foreground">What would you like to do next?</p>
      
      {Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
        <div key={category} className="space-y-2.5">
          <p className="text-xs text-muted-foreground/70">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => onPromptClick(prompt.action)}
                className="h-auto py-2 px-4 rounded-full border border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:shadow-soft hover:scale-[1.02] transition-all duration-200 text-xs font-medium"
              >
                <span className="mr-1.5">{prompt.icon}</span>
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
