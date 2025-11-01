import { TopBar } from '@/components/chat/TopBar';
import { CoreActionsStrip } from '@/components/chat/CoreActionsStrip';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { VisualCanvas } from '@/components/chat/VisualCanvas';
import { useUnifiedChat } from '@/hooks/useUnifiedChat';
import { cn } from '@/lib/utils';

export default function ChatHub() {
  const {
    messages,
    isLoading,
    sendMessage,
    startNewConversation,
    visualCanvasMode,
    visualCanvasData,
    setVisualCanvasMode,
  } = useUnifiedChat();
  
  const userName = localStorage.getItem('userName');
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };
  
  const handleCoreAction = (action: 'create' | 'view-all' | 'analyze') => {
    const prompts = {
      create: 'I want to create a new campaign',
      'view-all': 'Show me all my previous campaigns',
      analyze: 'Analyze my campaign performance'
    };
    
    sendMessage(prompts[action]);
  };
  
  const handleCanvasSendMessage = (message: any) => {
    sendMessage(message.content);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <TopBar onNewConversation={startNewConversation} />
      
      {/* Core Actions Strip - Always visible */}
      <CoreActionsStrip onActionClick={handleCoreAction} />
      
      {/* Split layout container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Area (Top 2/3) */}
        <div className={cn(
          "flex flex-col overflow-hidden",
          visualCanvasMode === 'none' ? 'flex-1' : 'flex-[2]'
        )}>
          {messages.length === 0 ? (
            <WelcomeScreen
              onPromptClick={handlePromptClick}
              userName={userName || undefined}
              isExistingUser={!!hasCompletedOnboarding}
            />
          ) : (
            <MessageList
              messages={messages}
              onPromptClick={handlePromptClick}
            />
          )}
          
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
          />
        </div>
        
        {/* Visual Canvas (Bottom 1/3) */}
        <VisualCanvas
          renderMode={visualCanvasMode}
          data={visualCanvasData}
          onClose={() => setVisualCanvasMode('none')}
          onSendChatMessage={handleCanvasSendMessage}
        />
      </div>
    </div>
  );
}
