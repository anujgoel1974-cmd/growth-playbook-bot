import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  followUpQuestions?: string[];
  customerInsights?: any[];
  competitors?: any[];
  trends?: any[];
  mediaPlan?: any;
  campaigns?: any[];
  weekNumber?: number;
}

interface AnalysisData {
  customerInsight?: any[];
  competitiveAnalysis?: {
    competitors: any[];
  };
  trendAnalysis?: any[];
  mediaPlan?: any[];
  adCreatives?: any[];
  campaignOptimizations?: any;
}

type ConversationState = 'awaiting_url' | 'analyzing' | 'results_ready' | 'refining';

export function useCampaignChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your AI marketing assistant. Paste your product URL and I'll build a complete campaign strategy for you. 🚀",
      timestamp: new Date(),
      followUpQuestions: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('awaiting_url');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const { toast } = useToast();

  const sendMessage = async (userMessage: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Check if this is a URL
      const urlPattern = /^https?:\/\/.+/i;
      const isUrl = urlPattern.test(userMessage.trim());

      if (isUrl && conversationState === 'awaiting_url') {
        // Handle URL submission - trigger analysis
        await handleUrlAnalysis(userMessage.trim());
      } else {
        // Handle regular chat message
        await handleChatMessage(userMessage);
      }
    } catch (error) {
      console.error('Campaign chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlAnalysis = async (url: string) => {
    // Validate URL
    try {
      new URL(url);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Please provide a valid URL (e.g., https://example.com/product)',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    setConversationState('analyzing');

    // Add analysis start message
    const startMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Got it! Analyzing ${url}...\n\n🔍 Scanning your product page...`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, startMsg]);

    const userRole = localStorage.getItem('userRole') || 'Other';

    try {
      // Start analysis (don't await - let it run in background)
      console.log('📡 Starting analyze-landing-page for:', { url, userRole });
      supabase.functions.invoke('analyze-landing-page', {
        body: { url, userRole }
      }).then(({ data, error }) => {
        if (error) {
          console.error('❌ Error from analyze-landing-page:', error);
        } else {
          console.log('✅ Analysis complete');
        }
      });

      // Poll for progress updates
      const displayedSections = new Set<string>();
      let pollCount = 0;
      const maxPolls = 60; // Max 3 minutes (60 * 3 seconds)

      const pollInterval = setInterval(async () => {
        pollCount++;
        
        if (pollCount > maxPolls) {
          clearInterval(pollInterval);
          const errorMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Analysis is taking longer than expected. Please try again.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          setConversationState('awaiting_url');
          return;
        }

        try {
          const supabaseAny = supabase as any;
          const progressResult = await supabaseAny
            .from('analysis_progress')
            .select('id, status, section_name, progress_percentage, data, updated_at')
            .eq('url', url)
            .order('updated_at', { ascending: false })
            .limit(1);

          if (progressResult.error || !progressResult.data || progressResult.data.length === 0) return;
          
          const progressRecords = progressResult.data;

        const progress = progressRecords[0];
        const progressData = progress.data ? (progress.data as unknown as AnalysisData) : null;
        console.log('📊 Poll progress:', progress.section_name, progress.progress_percentage);

        // Display customer insights
        if (progressData?.customerInsight && 
            !displayedSections.has('customer_insights') &&
            progress.progress_percentage >= 20) {
          displayedSections.add('customer_insights');
          const insightMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "✅ Found your ideal customers! Here's what I discovered:",
            customerInsights: progressData.customerInsight,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, insightMsg]);
          await delay(500);
        }

        // Display competitive analysis
        if (progressData?.competitiveAnalysis?.competitors && 
            !displayedSections.has('competitors') &&
            progress.progress_percentage >= 40) {
          displayedSections.add('competitors');
          const competitorMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `✅ Analyzed ${progressData.competitiveAnalysis.competitors.length} key competitors:`,
            competitors: progressData.competitiveAnalysis.competitors.slice(0, 3),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, competitorMsg]);
          await delay(500);
        }

        // Display trend analysis
        if (progressData?.trendAnalysis && 
            !displayedSections.has('trends') &&
            progress.progress_percentage >= 60) {
          displayedSections.add('trends');
          const trendMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "✅ Identified trending opportunities:",
            trends: progressData.trendAnalysis.slice(0, 3),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, trendMsg]);
          await delay(500);
        }

        // Display final media plan when complete
        if (progress.status === 'complete' && progressData) {
          clearInterval(pollInterval);
          
          setAnalysisData(progressData);
          setConversationState('results_ready');

          // Display media plan
          if (progressData.mediaPlan && progressData.mediaPlan.length > 0) {
            const mediaPlanMsg: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: "✅ Your complete media plan is ready!",
              mediaPlan: progressData.mediaPlan[0],
              campaigns: progressData.mediaPlan[0].channels,
              weekNumber: 1,
              followUpQuestions: [
                "Why did you allocate the budget this way?",
                "Which platform will give me the best ROI?",
                "Can you adjust the Google budget?",
                "Show me the ad creatives"
              ],
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, mediaPlanMsg]);
          }
        }
        } catch (pollError) {
          console.error('Poll error:', pollError);
        }
      }, 3000); // Poll every 3 seconds

    } catch (error) {
      console.error('Analysis error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble analyzing that URL. Please try again or check if the URL is accessible.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setConversationState('awaiting_url');
    }
  };

  const handleChatMessage = async (message: string) => {
    // Get user role for personalized response
    const userRole = localStorage.getItem('userRole') || 'Other';
    
    // Prepare conversation history
    const conversationHistory = messages
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    const { data, error } = await supabase.functions.invoke('campaign-chat-assistant', {
      body: {
        message,
        conversationHistory,
        analysisData,
        conversationState,
        userRole,
      },
    });

    if (error) throw error;

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.response,
      followUpQuestions: data.followUpQuestions || [],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    // Handle action types
    if (data.actionType === 'update_campaign' && data.updatedData) {
      // Update analysis data with changes
      setAnalysisData((prev) => ({
        ...prev,
        ...data.updatedData,
      }));
    }
  };

  return {
    messages,
    isLoading,
    conversationState,
    analysisData,
    sendMessage,
  };
}

// Helper function
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
