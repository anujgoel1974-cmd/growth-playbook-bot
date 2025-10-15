import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { AggregateMetrics } from '@/utils/mockCampaignData';
import { useChatbot } from '@/hooks/useChatbot';
import { format } from 'date-fns';
import { DynamicChart } from './DynamicChart';

interface ChatInterfaceProps {
  aggregateMetrics: AggregateMetrics;
}

const MARKETING_QUESTION_TEMPLATES = [
  {
    category: "Performance Analysis",
    icon: "📊",
    questions: [
      "Which channel has the best ROI this month?",
      "Show me my top 3 performing campaigns",
      "What's driving my conversion rate changes?",
    ],
  },
  {
    category: "Optimization",
    icon: "🚀",
    questions: [
      "How can I reduce my cost per acquisition?",
      "Which campaigns should I pause or scale?",
      "Suggest budget reallocation strategies",
    ],
  },
  {
    category: "Audience Insights",
    icon: "👥",
    questions: [
      "What demographics are converting best?",
      "Compare weekday vs weekend performance",
      "When should I increase my ad spend?",
    ],
  },
  {
    category: "Competitive Edge",
    icon: "💡",
    questions: [
      "What creative strategies are working?",
      "How do my CTRs compare to benchmarks?",
      "Identify underperforming ad placements",
    ],
  },
];

export function ChatInterface({ aggregateMetrics }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useChatbot(aggregateMetrics);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card className="flex flex-col h-[600px] animate-fade-in border-primary/20 shadow-lg">
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Marketing Assistant</h3>
          <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-xl animate-pulse">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Welcome to Your Marketing Command Center</h4>
              <p className="text-sm text-muted-foreground">
                Ask me anything about your campaign performance, get insights, and optimize your ad spend
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-primary/70'
                    : 'bg-gradient-to-br from-secondary to-secondary/70'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                )}
              </div>
              <div
                className={`flex-1 space-y-1 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                } flex flex-col`}
              >
                <div className="w-full max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-2.5 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.chart && message.role === 'assistant' && (
                    <DynamicChart config={message.chart} />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(message.timestamp, 'HH:mm')}
                </span>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-md">
              <Bot className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Marketing Question Templates */}
      {messages.length === 0 && (
        <div className="px-4 pb-4 border-t bg-muted/10">
          <h4 className="text-sm font-semibold mb-3 mt-3 text-muted-foreground">Quick Start Questions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MARKETING_QUESTION_TEMPLATES.map((template) => (
              <Card key={template.category} className="p-3 hover:shadow-md transition-all hover:border-primary/40 cursor-pointer group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{template.icon}</span>
                  <h5 className="font-semibold text-xs text-primary group-hover:text-primary/80">{template.category}</h5>
                </div>
                <div className="space-y-1.5">
                  {template.questions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded hover:bg-muted/50 flex items-start gap-1.5"
                    >
                      <span className="text-primary mt-0.5">→</span>
                      <span>{question}</span>
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-gradient-to-t from-muted/30 to-transparent">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your campaigns..."
            disabled={isLoading}
            className="flex-1 border-primary/20 focus:border-primary shadow-sm"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
