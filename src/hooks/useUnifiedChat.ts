import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, AnalysisData, ConversationContext, ActionPrompt } from '@/types/unified-chat';
import { VisualCanvasMode, VisualCanvasData } from '@/types/visual-canvas';
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
  
  // Visual canvas state
  const [visualCanvasMode, setVisualCanvasMode] = useState<VisualCanvasMode>('none');
  const [visualCanvasData, setVisualCanvasData] = useState<VisualCanvasData>({});

  const isURL = (text: string): boolean => {
    try {
      new URL(text.trim());
      return text.trim().startsWith('http');
    } catch {
      return false;
    }
  };

  const detectIntent = (message: string): 'url_analysis' | 'prompt_for_url' | 'show_dashboard' | 'show_history' | 'general_chat' => {
    const lower = message.toLowerCase();
    
    // Core flow: Create new campaign
    if (
      (lower.includes('create') || lower.includes('new')) && lower.includes('campaign') ||
      lower.includes('start campaign')
    ) {
      return 'prompt_for_url';
    }
    
    // Core flow: View all previous campaigns
    if (
      (lower.includes('all') || lower.includes('previous') || lower.includes('past')) &&
      (lower.includes('campaign') || lower.includes('history') || lower.includes('analyses'))
    ) {
      return 'show_history';
    }
    
    // Core flow: Analyze campaigns / show dashboard
    if (
      (lower.includes('analyze') || lower.includes('performance') || lower.includes('how')) &&
      (lower.includes('campaign') || lower.includes('doing'))
    ) {
      return 'show_dashboard';
    }
    
    // URL detection
    if (isURL(message)) {
      return 'url_analysis';
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

  const handlePromptForUrl = async () => {
    addMessage({
      role: 'assistant',
      content: "Great! Let's create a new campaign. Please paste the product or landing page URL you'd like to analyze, and I'll build a complete campaign strategy for you.",
      actionPrompts: [
        {
          category: 'deep_dive',
          icon: '💡',
          label: 'Need help? Show me an example',
          action: 'show-example-url'
        }
      ]
    });
  };

  const handleShowDashboard = async () => {
    addMessage({
      role: 'assistant',
      content: "I've pulled up your complete campaign performance dashboard below. You can see all your metrics, trends, and insights. What would you like to know more about?"
    });
    
    setVisualCanvasMode('dashboard');
    setVisualCanvasData({ dateRange: 'last-30-days' });
  };

  const handleShowHistory = async () => {
    addMessage({
      role: 'assistant',
      content: "Here are all your previous campaign analyses. Click any one to view details or continue working on it."
    });
    
    setVisualCanvasMode('history');
    setVisualCanvasData({});
  };

  const handleUrlAnalysis = async (url: string) => {
    setConversationContext('campaign_creation');
    setIsLoading(true);

    try {
      // Add confirmation message and open loading canvas immediately
      addMessage({ role: 'assistant', content: `Analyzing ${url}... Watch the progress below.` });
      
      // Open visual canvas with loading view immediately
      setVisualCanvasMode('loading');
      setVisualCanvasData({ url });

      // Start analysis
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-landing-page', {
        body: { url },
      });

      if (error) throw error;

      const progressId = analysisResult.progressId;

      // Poll for progress (silently, without chat updates)
      const pollInterval = setInterval(async () => {
        const { data: progress } = await supabase
          .from('analysis_progress')
          .select('*')
          .eq('id', progressId)
          .single();

        if (!progress) return;

        const progressData = progress.data as any;

        if (progress.status === 'complete') {
          clearInterval(pollInterval);
          setIsLoading(false);
          
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
            content: '✅ Analysis complete! Your campaign strategy is ready with customer insights, competitor analysis, market trends, and ad creatives.',
            mediaPlan: progressData.mediaPlan,
            actionPrompts
          });
          
          // Switch visual canvas to analysis view
          setVisualCanvasMode('analysis');
          setVisualCanvasData({
            url,
            analysisData: progressData,
            sessionId: progress.id
          });
          
          toast.success('Campaign analysis complete!');
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setIsLoading(false);
      }, 300000); // 5 min timeout

    } catch (error) {
      console.error('URL analysis error:', error);
      setIsLoading(false);
      setVisualCanvasMode('none');
      
      // Check if it's a timeout or fetch error - the analysis might still be running
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('timeout') || errorMessage.includes('Failed to fetch') || errorMessage.includes('FunctionsFetchError')) {
        addMessage({
          role: 'assistant',
          content: '⏳ The analysis is taking longer than expected. The system is still processing your request in the background. Please wait a moment...'
        });
        
        toast.info('Analysis in progress - please wait...');
      } else {
        addMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error analyzing this URL. Please make sure it\'s a valid product page and try again.'
        });
        toast.error('Analysis failed');
      }
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
      case 'prompt_for_url':
        await handlePromptForUrl();
        break;
      case 'show_dashboard':
        await handleShowDashboard();
        break;
      case 'show_history':
        await handleShowHistory();
        break;
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
    setVisualCanvasMode('none');
    setVisualCanvasData({});
  };

  return {
    messages,
    isLoading,
    conversationContext,
    sendMessage,
    startNewConversation,
    visualCanvasMode,
    visualCanvasData,
    setVisualCanvasMode,
    setVisualCanvasData,
  };
}
