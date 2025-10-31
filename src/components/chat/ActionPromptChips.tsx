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
      <p className="font-medium">What would you like to do next?</p>
      
      {Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
        <div key={category} className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => onPromptClick(prompt.action)}
                className="h-auto py-2 px-4 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                <span className="mr-1">{prompt.icon}</span>
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
