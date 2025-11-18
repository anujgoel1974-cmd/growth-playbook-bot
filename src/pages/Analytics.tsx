import { useState } from 'react';
import { TemplateGallery } from '@/components/analytics/TemplateGallery';
import { AnalysisPanel } from '@/components/analytics/AnalysisPanel';
import { AnalyticsChat } from '@/components/analytics/AnalyticsChat';
import { generateMockAnalyticsResponse, analyticsTemplates } from '@/utils/mockAnalyticsData';
import { AnalyticsRunResponse, AnalyticsSession, ChatMessage } from '@/types/analytics';

export default function Analytics() {
  const [currentResponse, setCurrentResponse] = useState<AnalyticsRunResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recentSessions, setRecentSessions] = useState<AnalyticsSession[]>([]);

  const handleRunTemplate = async (templateId: string, platforms: string[], dateRange: string) => {
    setIsLoading(true);
    setSelectedPlatforms(platforms);
    setSelectedTimeRange(dateRange);
    setMessages([]);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = generateMockAnalyticsResponse(
      templateId as any,
      { from: '', to: '' },
      platforms
    );
    
    setCurrentResponse(response);
    setIsLoading(false);

    // Add system message
    const template = analyticsTemplates.find(t => t.id === templateId);
    if (template) {
      setMessages([{
        id: `msg_${Date.now()}`,
        role: 'system',
        content: `You ran: ${template.name}. Ask a follow-up like 'Show only Meta', 'Focus on worst-performing campaigns', or 'Explain why ROAS dropped on Google.'`,
        timestamp: new Date()
      }]);

      // Add to recent sessions
      const newSession: AnalyticsSession = {
        sessionId: response.sessionId,
        templateId: templateId as any,
        templateName: template.name,
        timeRange: dateRange,
        timestamp: new Date(),
        platforms
      };
      setRecentSessions(prev => [newSession, ...prev].slice(0, 5));
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentResponse) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Generate refined response based on follow-up
    const refinedResponse = generateMockAnalyticsResponse(
      currentResponse.templateId as any,
      { from: '', to: '' },
      selectedPlatforms,
      currentResponse.sessionId
    );

    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: `Updated analysis based on your question. I've refined the data to focus on: "${message}"`,
      timestamp: new Date(),
      response: refinedResponse
    };

    setMessages(prev => [...prev, assistantMessage]);
    setCurrentResponse(refinedResponse);
    setIsLoading(false);
  };

  const handleLoadSession = (session: AnalyticsSession) => {
    const response = generateMockAnalyticsResponse(
      session.templateId,
      { from: '', to: '' },
      session.platforms,
      session.sessionId
    );
    
    setCurrentResponse(response);
    setSelectedPlatforms(session.platforms);
    setSelectedTimeRange(session.timeRange);
    setMessages([{
      id: `msg_${Date.now()}`,
      role: 'system',
      content: `Loaded previous analysis: ${session.templateName}`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Column - Templates */}
      <div className="w-[380px] border-r flex-shrink-0 overflow-hidden">
        <TemplateGallery 
          onRunTemplate={handleRunTemplate}
          recentSessions={recentSessions}
          onLoadSession={handleLoadSession}
        />
      </div>

      {/* Right Column - Analysis + Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Analysis Results (scrollable) */}
        <div className="flex-1 overflow-hidden">
          <AnalysisPanel
            response={currentResponse}
            isLoading={isLoading}
            platforms={selectedPlatforms}
            timeRange={selectedTimeRange}
          />
        </div>

        {/* Chat (fixed height at bottom) */}
        <div className="h-[280px] border-t flex-shrink-0">
          <AnalyticsChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            sessionId={currentResponse?.sessionId}
          />
        </div>
      </div>
    </div>
  );
}
