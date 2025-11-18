import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/types/analytics';
import { Send, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  sessionId?: string;
}

export function AnalyticsChat({ messages, onSendMessage, isLoading, sessionId }: AnalyticsChatProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sessionId ? "Ask a follow-up: e.g. 'Focus on Meta only', 'Show SKUs with ROAS < 1.5', 'Compare this week vs last week'..." : "Select a template below to start analysis..."}
            className="min-h-[56px] max-h-[120px] resize-none pr-12"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading || !sessionId}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isLoading || !sessionId}
            className="absolute right-2 bottom-2 h-8 w-8"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
      
      {/* System message hint */}
      {sessionId && messages.length === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Ask follow-up questions like "Show only Meta" or "Focus on worst-performing campaigns"
        </p>
      )}
    </div>
  );
}
