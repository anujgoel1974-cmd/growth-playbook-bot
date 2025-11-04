import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Loader2, Link as LinkIcon } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Type a message or paste a product URL...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isURL = (text: string) => {
    try {
      new URL(text.trim());
      return true;
    } catch {
      return false;
    }
  };

  const hasURL = isURL(message.trim());

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 w-full border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[52px] max-h-[120px] resize-none pr-12 rounded-2xl shadow-soft focus:shadow-glow transition-shadow duration-200"
              rows={1}
            />
            {hasURL && (
              <div className="absolute right-3 top-3 text-primary animate-slide-in-smooth">
                <LinkIcon className="h-4 w-4" />
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="h-[52px] w-[52px] rounded-2xl shrink-0 shadow-soft hover:shadow-glow transition-all duration-200 hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground/70 text-center mt-2.5">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
