import { useEffect, useRef } from 'react';
import { Message } from '@/types/unified-chat';
import { AssistantMessage } from './AssistantMessage';
import { ReasoningSection } from './ReasoningSection';
import { InlineCardsGroup } from './InlineCardsGroup';
import { ActionPromptChips } from './ActionPromptChips';
import { DynamicChart } from '@/components/dashboard/DynamicChart';
import { Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  onPromptClick: (prompt: string) => void;
  onViewCampaignDetails?: () => void;
  isAITyping?: boolean;
}

export function MessageList({ messages, onPromptClick, onViewCampaignDetails, isAITyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {messages.map((message, index) => (
          <div
            key={message.id}
            style={{ 
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'both'
            }}
            className={`animate-fade-in-up ${
              message.role === 'user' ? 'flex justify-end' : ''
            }`}
          >
            {message.role === 'user' ? (
              <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 max-w-[80%] shadow-soft hover:shadow-glow transition-all duration-300">
                {message.content}
              </div>
            ) : (
              <div className="space-y-6">
                <AssistantMessage content={message.content} isStreaming={message.isStreaming} />
                
                {message.reasoningSteps && message.reasoningSteps.length > 0 && (
                  <ReasoningSection steps={message.reasoningSteps} />
                )}
                
                {(message.customerInsights || message.competitors || message.trends || message.mediaPlan) && (
                  <InlineCardsGroup
                    customerInsights={message.customerInsights}
                    competitors={message.competitors}
                    trends={message.trends}
                    mediaPlan={message.mediaPlan}
                    onViewCampaignDetails={onViewCampaignDetails}
                  />
                )}
                
                {message.chart && (
                  <div className="bg-card rounded-2xl p-6 border shadow-soft transition-shadow duration-300 hover:shadow-card-hover">
                    <DynamicChart config={message.chart} />
                  </div>
                )}
                
                {message.actionPrompts && message.actionPrompts.length > 0 && (
                  <ActionPromptChips
                    prompts={message.actionPrompts}
                    onPromptClick={onPromptClick}
                  />
                )}
              </div>
            )}
          </div>
        ))}
        
        {isAITyping && (
          <div className="flex items-start gap-3 animate-fade-in-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 bg-card border shadow-soft rounded-2xl px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>AI is thinking</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-breathe" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-breathe" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-breathe" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
