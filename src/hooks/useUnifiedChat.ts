import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, AnalysisData, ConversationContext, ActionPrompt } from '@/types/unified-chat';
import { toast } from 'sonner';

const ANALYSIS_STATUS_MESSAGES: Record<string, { title: string; description: string }> = {
  customer_insights: { title: 'Understanding Your Customers', description: 'Analyzing target demographics and pain points...' },
  competitor_research: { title: 'Competitive Research', description: 'Identifying key competitors and market positioning...' },
  trend_analysis: { title: 'Market Trends', description: 'Discovering relevant trends and opportunities...' },
  creative_generation: { title: 'Generating Creatives', description: 'Creating platform-specific ad copy and visuals...' },
  media_planning: { title: 'Optimizing Media Plan', description: 'Calculating budget allocation and ROI projections...' },
};

export function useUnifiedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext>('general');
  const [currentAnalysisData, setCurrentAnalysisData] = useState<AnalysisData | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const isURL = (text: string): boolean => {
    try {
      new URL(text.trim());
      return text.trim().startsWith('http');
    } catch {
      return false;
    }
  };

  const detectIntent = (message: string): 'url_analysis' | 'analytics_query' | 'campaign_modification' | 'general_chat' => {
    if (isURL(message)) return 'url_analysis';
    
    const analyticsKeywords = ['performance', 'campaigns', 'metrics', 'roi', 'spend', 'conversions', 'show me', 'view'];
    if (analyticsKeywords.some(kw => message.toLowerCase().includes(kw))) {
      return 'analytics_query';
    }
    
    const modKeywords = ['change', 'modify', 'adjust', 'increase', 'decrease', 'budget'];
    if (modKeywords.some(kw => message.toLowerCase().includes(kw)) && currentAnalysisData) {
      return 'campaign_modification';
    }
    
    return 'general_chat';
  };

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>): string => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg));
  }, []);

  const handleUrlAnalysis = async (url: string) => {
    setConversationContext('campaign_creation');
    setIsLoading(true);

    try {
      // Add confirmation message
      addMessage({ role: 'assistant', content: `Got it! Analyzing ${url}...` });

      // Start analysis
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-landing-page', {
        body: { url },
      });

      if (error) throw error;

      const progressId = analysisResult.progressId;

      // Add reasoning container
      const reasoningMsgId = addMessage({
        role: 'assistant',
        content: '',
        isReasoningContainer: true,
        reasoningSteps: [
          { phase: 'scan', status: 'in-progress', text: 'Scanning product page structure...' }
        ]
      });

      // Poll for progress
      let displayedSteps = new Set<string>();
      const pollInterval = setInterval(async () => {
        const { data: progress } = await supabase
          .from('analysis_progress')
          .select('*')
          .eq('id', progressId)
          .single();

        if (!progress) return;

        // Update reasoning based on progress
        const steps = [];
        const progressData = progress.data as any;
        
        if (progress.progress_percentage >= 10) {
          steps.push({ phase: 'scan', status: 'complete' as 'complete', text: '✓ Page structure analyzed' });
        }
        if (progress.progress_percentage >= 25) {
          const customerStatus: 'complete' | 'in-progress' = progress.progress_percentage >= 40 ? 'complete' : 'in-progress';
          steps.push({ 
            phase: 'customer', 
            status: customerStatus,
            text: progress.progress_percentage >= 40 ? '✓ Customer analysis complete' : 'Identifying target demographics...'
          });
          
          if (progressData?.customerInsights && !displayedSteps.has('customer')) {
            displayedSteps.add('customer');
            addMessage({
              role: 'assistant',
              content: '',
              customerInsights: progressData.customerInsights
            });
          }
        }
        if (progress.progress_percentage >= 45) {
          const competitorStatus: 'complete' | 'in-progress' = progress.progress_percentage >= 60 ? 'complete' : 'in-progress';
          steps.push({
            phase: 'competitors',
            status: competitorStatus,
            text: progress.progress_percentage >= 60 ? '✓ Competitive research complete' : 'Researching market positioning...'
          });
          
          if (progressData?.competitors && !displayedSteps.has('competitors')) {
            displayedSteps.add('competitors');
            addMessage({
              role: 'assistant',
              content: '',
              competitors: progressData.competitors
            });
          }
        }
        if (progress.progress_percentage >= 65) {
          const trendStatus: 'complete' | 'in-progress' = progress.progress_percentage >= 80 ? 'complete' : 'in-progress';
          steps.push({
            phase: 'trends',
            status: trendStatus,
            text: progress.progress_percentage >= 80 ? '✓ Market trends identified' : 'Scanning industry trends...'
          });
          
          if (progressData?.trends && !displayedSteps.has('trends')) {
            displayedSteps.add('trends');
            addMessage({
              role: 'assistant',
              content: '',
              trends: progressData.trends
            });
          }
        }
        if (progress.progress_percentage >= 85) {
          const mediaPlanStatus: 'complete' | 'in-progress' = progress.status === 'complete' ? 'complete' : 'in-progress';
          steps.push({
            phase: 'media-plan',
            status: mediaPlanStatus,
            text: progress.status === 'complete' ? '✓ Media plan optimized' : 'Building weekly campaign structure...'
          });
        }

        updateMessage(reasoningMsgId, { reasoningSteps: steps });

        if (progress.status === 'complete') {
          clearInterval(pollInterval);
          
          const analysisData: AnalysisData = {
            customerInsights: progressData.customerInsights,
            competitors: progressData.competitors,
            trends: progressData.trends,
            mediaPlan: progressData.mediaPlan,
            url: url
          };
          
          setCurrentAnalysisData(analysisData);

          const actionPrompts: ActionPrompt[] = [
            { category: 'deep_dive', icon: '👥', label: 'Explain customer insights', action: 'Tell me more about the customer personas you identified' },
            { category: 'deep_dive', icon: '🎯', label: 'Competitive breakdown', action: 'Deep dive into the competitive analysis' },
            { category: 'deep_dive', icon: '📈', label: 'Trend opportunities', action: 'Explain the trend opportunities in detail' },
            { category: 'make_changes', icon: '💰', label: 'Adjust budgets', action: 'I want to modify the platform budget allocation' },
            { category: 'take_action', icon: '📄', label: 'Export PDF', action: 'Export this campaign plan as PDF' },
          ];

          addMessage({
            role: 'assistant',
            content: '✅ Your complete media plan is ready!',
            mediaPlan: progressData.mediaPlan,
            actionPrompts
          });
          
          toast.success('Campaign analysis complete!');
        }
      }, 3000);

      setTimeout(() => clearInterval(pollInterval), 300000); // 5 min timeout

    } catch (error) {
      console.error('URL analysis error:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error analyzing this URL. Please make sure it\'s a valid product page and try again.'
      });
      toast.error('Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneralChat = async (message: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('unified-chat-assistant', {
        body: {
          message,
          conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          context: { type: conversationContext }
        }
      });

      if (error) throw error;

      addMessage({
        role: 'assistant',
        content: data.response,
        actionPrompts: data.followUpQuestions?.map((q: string) => ({
          category: 'deep_dive',
          icon: '💡',
          label: q,
          action: q
        }))
      });

    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (userMessage: string) => {
    addMessage({ role: 'user', content: userMessage });

    const intent = detectIntent(userMessage);

    switch (intent) {
      case 'url_analysis':
        await handleUrlAnalysis(userMessage);
        break;
      case 'general_chat':
      default:
        await handleGeneralChat(userMessage);
        break;
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationContext('general');
    setCurrentAnalysisData(null);
    setConversationId(null);
  };

  return {
    messages,
    isLoading,
    conversationContext,
    sendMessage,
    startNewConversation,
  };
}
