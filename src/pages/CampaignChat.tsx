import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useCampaignChat } from '@/hooks/useCampaignChat';
import { format } from 'date-fns';
import { CampaignPreviewDialog } from '@/components/CampaignPreviewDialog';
import { InlineCustomerInsightCard } from '@/components/chat/InlineCustomerInsightCard';
import { InlineCompetitorCard } from '@/components/chat/InlineCompetitorCard';
import { InlineTrendCard } from '@/components/chat/InlineTrendCard';
import { InlineMediaPlanCard } from '@/components/chat/InlineMediaPlanCard';
import { InlineCampaignCard } from '@/components/chat/InlineCampaignCard';

const CampaignChat = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const { messages, isLoading, conversationState, sendMessage, analysisData } = useCampaignChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const hasCompleted = localStorage.getItem("hasCompletedOnboarding");
    if (!hasCompleted) {
      navigate("/onboarding");
    }
  }, [navigate]);

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
    setInput('');
    await sendMessage(question);
  };

  const handleCampaignClick = (campaign: any, weekNumber: number) => {
    setSelectedCampaign({ campaign, weekNumber });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="flex flex-col h-[calc(100vh-8rem)] shadow-2xl border-primary/20">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">AI Campaign Builder</h1>
              <p className="text-sm text-muted-foreground">Let's create your perfect campaign strategy</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-background to-muted/10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } animate-fade-in`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-primary'
                      : 'bg-gradient-to-br from-secondary to-secondary/70'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Bot className="h-5 w-5 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={`flex-1 space-y-2 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  } flex flex-col max-w-[85%]`}
                >
                  <div className="w-full">
                    {message.content && (
                      <div
                        className={`rounded-xl px-5 py-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-primary text-primary-foreground ml-auto'
                            : 'bg-card border border-border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    )}
                    
                    {/* Inline Cards */}
                    {message.customerInsights && message.customerInsights.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {message.customerInsights.map((insight) => (
                          <InlineCustomerInsightCard key={insight.id} insight={insight} />
                        ))}
                      </div>
                    )}
                    
                    {message.competitors && message.competitors.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {message.competitors.map((competitor) => (
                          <InlineCompetitorCard key={competitor.id} competitor={competitor} />
                        ))}
                      </div>
                    )}
                    
                    {message.trends && message.trends.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {message.trends.map((trend) => (
                          <InlineTrendCard key={trend.id} trend={trend} />
                        ))}
                      </div>
                    )}
                    
                    {message.mediaPlan && (
                      <div className="mt-4">
                        <InlineMediaPlanCard mediaPlan={message.mediaPlan} />
                      </div>
                    )}
                    
                    {message.campaigns && message.campaigns.length > 0 && (
                      <div className="grid gap-3 mt-4 md:grid-cols-2">
                        {message.campaigns.map((campaign, idx) => (
                          <InlineCampaignCard
                            key={idx}
                            campaign={campaign}
                            weekNumber={message.weekNumber || 1}
                            onClick={() => handleCampaignClick(campaign, message.weekNumber || 1)}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Follow-up questions */}
                    {message.role === 'assistant' && 
                     messages.indexOf(message) === messages.length - 1 && 
                     message.followUpQuestions && 
                     message.followUpQuestions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          💡 You might also want to ask:
                        </p>
                        <div className="grid gap-2">
                          {message.followUpQuestions.map((question, qIndex) => (
                            <button
                              key={qIndex}
                              onClick={() => handleSuggestedQuestion(question)}
                              className="text-left text-sm p-3 rounded-lg border border-primary/20 
                                       bg-background hover:bg-primary/5 hover:border-primary/40 
                                       transition-all duration-200 shadow-sm hover:shadow-md group"
                            >
                              <span className="text-primary group-hover:text-primary/80 mr-2">→</span>
                              <span className="text-muted-foreground group-hover:text-foreground">
                                {question}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(message.timestamp, 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-md">
                  <Bot className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="bg-card border border-border rounded-xl px-5 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-gradient-to-t from-muted/20 to-transparent">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  conversationState === 'awaiting_url'
                    ? "Paste your product URL to get started..."
                    : "Ask me anything or request changes..."
                }
                disabled={isLoading}
                className="flex-1 h-12 border-primary/20 focus:border-primary shadow-sm text-base"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                size="lg"
                className="px-6 bg-gradient-primary hover:opacity-90 shadow-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaign Preview Dialog */}
      {selectedCampaign && analysisData?.adCreatives && (
        <CampaignPreviewDialog
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          campaign={selectedCampaign.campaign}
          weekNumber={selectedCampaign.weekNumber}
          adCreatives={analysisData.adCreatives.filter(
            (creative) => creative.channel === selectedCampaign.campaign.name
          )}
          campaignSettingsRationale={
            analysisData?.campaignOptimizations?.campaignSettingsRationale?.[selectedCampaign.campaign.name]
          }
        />
      )}
    </div>
  );
};

export default CampaignChat;
