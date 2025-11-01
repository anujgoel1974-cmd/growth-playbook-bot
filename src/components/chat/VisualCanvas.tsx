import { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { VisualCanvasMode, VisualCanvasData } from '@/types/visual-canvas';
import { DashboardView } from './views/DashboardView';
import { AnalysisView } from './views/AnalysisView';
import { MediaPlanView } from './views/MediaPlanView';
import { HistoryView } from './views/HistoryView';

interface VisualCanvasProps {
  renderMode: VisualCanvasMode;
  data?: VisualCanvasData;
  onClose?: () => void;
  onSendChatMessage?: (message: any) => void;
  className?: string;
}

export function VisualCanvas({
  renderMode,
  data,
  onClose,
  onSendChatMessage,
  className
}: VisualCanvasProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (renderMode === 'none') return null;
  
  const titles = {
    dashboard: '📊 Campaign Performance',
    analysis: '🎯 Campaign Analysis',
    'media-plan': '💰 Media Plan',
    history: '📂 Analysis History'
  };

  return (
    <div className={cn(
      "border-t bg-background transition-all duration-500 animate-slide-up",
      isExpanded ? "h-screen" : "h-[66vh]",
      "md:relative",
      "max-md:fixed max-md:inset-0 max-md:z-50 max-md:bg-background max-md:h-screen",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">
          {titles[renderMode]}
        </h3>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:flex"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="h-[calc(100%-48px)]">
        {renderMode === 'dashboard' && <DashboardView data={data} />}
        {renderMode === 'analysis' && (
          <AnalysisView 
            data={data} 
            onSendChatMessage={onSendChatMessage} 
          />
        )}
        {renderMode === 'media-plan' && (
          <MediaPlanView 
            data={data} 
            onSendChatMessage={onSendChatMessage} 
          />
        )}
        {renderMode === 'history' && <HistoryView data={data} />}
      </ScrollArea>
    </div>
  );
}
