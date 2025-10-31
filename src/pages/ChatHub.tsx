import { useState } from 'react';
import { TopBar } from '@/components/chat/TopBar';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useUnifiedChat } from '@/hooks/useUnifiedChat';

export default function ChatHub() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { messages, isLoading, sendMessage, startNewConversation } = useUnifiedChat();
  
  const userName = localStorage.getItem('userName');
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewConversation={startNewConversation}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
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
    </div>
  );
}
