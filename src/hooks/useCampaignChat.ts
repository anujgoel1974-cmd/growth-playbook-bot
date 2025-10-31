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
      content: `Got it! Analyzing ${url}...\n\n🔍 Scanning your product page...\n🧠 Identifying your target audience...\n🎯 Researching competitors...`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, startMsg]);

    const userRole = localStorage.getItem('userRole') || 'Other';

    try {
      // Call analyze-landing-page function
      console.log('📡 Calling analyze-landing-page with:', { url, userRole });
      const { data, error } = await supabase.functions.invoke('analyze-landing-page', {
        body: { url, userRole }
      });

      console.log('📦 Response from analyze-landing-page:', { data, error });

      if (error) {
        console.error('❌ Error from analyze-landing-page:', error);
        throw error;
      }

      const analysis = data as AnalysisData;
      setAnalysisData(analysis);
      setConversationState('results_ready');

      // Display customer insights
      if (analysis.customerInsight && analysis.customerInsight.length > 0) {
        const insightMsg: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: "Here's what I found about your ideal customers:",
          customerInsights: analysis.customerInsight,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, insightMsg]);
        await delay(800);
      }

      // Display competitors
      if (analysis.competitiveAnalysis?.competitors && analysis.competitiveAnalysis.competitors.length > 0) {
        const competitorMsg: Message = {
          id: (Date.now() + 3).toString(),
          role: 'assistant',
          content: `I identified ${analysis.competitiveAnalysis.competitors.length} key competitors:`,
          competitors: analysis.competitiveAnalysis.competitors.slice(0, 3),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, competitorMsg]);
        await delay(800);
      }

      // Display trends
      if (analysis.trendAnalysis && analysis.trendAnalysis.length > 0) {
        const trendMsg: Message = {
          id: (Date.now() + 4).toString(),
          role: 'assistant',
          content: "Here are trending topics relevant to your product:",
          trends: analysis.trendAnalysis.slice(0, 3),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, trendMsg]);
        await delay(800);
      }

      // Display media plan
      if (analysis.mediaPlan && analysis.mediaPlan.length > 0) {
        const mediaPlanMsg: Message = {
          id: (Date.now() + 5).toString(),
          role: 'assistant',
          content: "Based on this analysis, here's your recommended media plan for Week 1:",
          mediaPlan: analysis.mediaPlan[0],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, mediaPlanMsg]);
        await delay(800);
      }

      // Display campaigns
      if (analysis.mediaPlan && analysis.mediaPlan.length > 0) {
        const campaignMsg: Message = {
          id: (Date.now() + 6).toString(),
          role: 'assistant',
          content: "I've created optimized campaign strategies for you:",
          campaigns: analysis.mediaPlan[0].channels,
          weekNumber: 1,
          followUpQuestions: [
            "Why did you allocate the budget this way?",
            "Which platform will give me the best ROI?",
            "Can you increase the Google budget to $500?",
            "Show me the ad creatives for Meta"
          ],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, campaignMsg]);
      }

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
