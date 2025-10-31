import { useEffect, useRef } from 'react';
import { Message } from '@/types/unified-chat';
import { AssistantMessage } from './AssistantMessage';
import { ReasoningSection } from './ReasoningSection';
import { InlineCardsGroup } from './InlineCardsGroup';
import { ActionPromptChips } from './ActionPromptChips';
import { DynamicChart } from '@/components/dashboard/DynamicChart';

interface MessageListProps {
  messages: Message[];
  onPromptClick: (prompt: string) => void;
  onViewCampaignDetails?: () => void;
}

export function MessageList({ messages, onPromptClick, onViewCampaignDetails }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              message.role === 'user' ? 'flex justify-end' : ''
            }`}
          >
            {message.role === 'user' ? (
              <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 max-w-[80%]">
                {message.content}
              </div>
            ) : (
              <div className="space-y-4">
                <AssistantMessage content={message.content} />
                
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
                  <div className="bg-card rounded-2xl p-6 border">
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
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
