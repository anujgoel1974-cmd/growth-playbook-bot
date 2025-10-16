import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAnalysisChatbot } from '@/hooks/useAnalysisChatbot';
import { format } from 'date-fns';

interface AnalysisChatInterfaceProps {
  analysisData: any;
}

const SMB_FOUNDER_PROMPTS = [
  {
    category: "Launch Readiness",
    icon: "🚀",
    questions: [
      "Which platform should I start with as a beginner?",
      "What's the minimum budget I need to test this campaign?",
      "Walk me through setting up my first campaign",
    ],
  },
  {
    category: "Creative Strategy",
    icon: "🎨",
    questions: [
      "Which ad creative is most likely to convert?",
      "How do I adapt these headlines for my brand voice?",
      "What images work best for my target audience?",
    ],
  },
  {
    category: "Budget & ROI",
    icon: "💰",
    questions: [
      "How should I split my $500/month budget?",
      "When should I expect to see results?",
      "What's a realistic ROI for my first 30 days?",
    ],
  },
  {
    category: "Competitor Insights",
    icon: "🎯",
    questions: [
      "How can I differentiate from my main competitor?",
      "What are they doing that I should avoid?",
      "Which gap in the market should I target?",
    ],
  },
];

export function AnalysisChatInterface({ analysisData }: AnalysisChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useAnalysisChatbot(analysisData);

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

  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading) return;
    await sendMessage(question);
  };

  return (
    <Card className="flex flex-col h-[600px] animate-fade-in border-primary/20 shadow-lg">
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Campaign Strategy Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask me anything about your campaign analysis</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary/60 flex items-center justify-center shadow-xl animate-pulse">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Ready to Launch Your Campaign?</h4>
              <p className="text-sm text-muted-foreground">
                I'll help you understand your analysis and launch your first campaign with confidence
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id} className="space-y-3">
              <div
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/70'
                      : 'bg-gradient-to-br from-accent to-accent/70'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-accent-foreground" />
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
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(message.timestamp, 'HH:mm')}
                  </span>
                </div>
              </div>

              {/* Follow-up questions - only for last assistant message */}
              {message.role === 'assistant' && 
               index === messages.length - 1 && 
               message.followUpQuestions && 
               message.followUpQuestions.length > 0 && (
                <div className="ml-11 space-y-2 animate-fade-in">
                  <p className="text-xs text-muted-foreground font-medium">
                    You might also want to ask:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {message.followUpQuestions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => handleSuggestedQuestion(question)}
                        disabled={isLoading}
                        className="text-left text-xs p-2.5 rounded-lg border border-primary/20 
                                   bg-background hover:bg-primary/5 hover:border-primary/40 
                                   transition-all duration-200 shadow-sm hover:shadow-md
                                   group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-primary group-hover:text-primary/80 mr-1.5">→</span>
                        <span className="text-muted-foreground group-hover:text-foreground">
                          {question}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
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

      {/* SMB Founder Question Templates */}
      {messages.length === 0 && (
        <div className="px-4 pb-4 border-t bg-muted/10">
          <h4 className="text-sm font-semibold mb-3 mt-3 text-muted-foreground">Common Questions from Founders</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SMB_FOUNDER_PROMPTS.map((template) => (
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
            placeholder="Ask about your analysis, targeting strategy, or how to launch..."
            disabled={isLoading}
            className="flex-1 border-primary/20 focus:border-primary shadow-sm"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
