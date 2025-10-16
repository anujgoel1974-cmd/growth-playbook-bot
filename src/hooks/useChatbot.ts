import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AggregateMetrics } from '@/utils/mockCampaignData';
import { ChartConfig } from '@/types/chart';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chart?: ChartConfig;
  followUpQuestions?: string[];
}

export function useChatbot(
  aggregateMetrics: AggregateMetrics,
  onChartGenerated?: (chart: ChartConfig) => void
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const userRole = localStorage.getItem('userRole') || 'Other';
      
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: userMessage,
          metrics: aggregateMetrics,
          userRole: userRole,
        },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        chart: data.chart || undefined,
        followUpQuestions: data.followUpQuestions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Notify parent component if a chart was generated
      if (data.chart && onChartGenerated) {
        onChartGenerated(data.chart);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
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

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
