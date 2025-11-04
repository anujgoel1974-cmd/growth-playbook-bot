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
import { LoadingView } from './views/LoadingView';

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
    loading: '🔄 Analyzing Your Campaign',
    'media-plan': '💰 Media Plan',
    history: '📂 Analysis History'
  };

  // Generate breadcrumbs based on mode and data
  const getBreadcrumbs = () => {
    const base = ['Home'];
    
    switch (renderMode) {
      case 'dashboard':
        base.push('Analytics', 'Dashboard');
        if (data?.dateRange) {
          base.push(data.dateRange === 'last-30-days' ? 'Last 30 Days' : data.dateRange);
        }
        break;
      case 'analysis':
        base.push('Campaigns', 'Analysis');
        if (data?.url) {
          const urlObj = new URL(data.url);
          base.push(urlObj.hostname);
        }
        break;
      case 'history':
        base.push('Campaigns', 'History');
        break;
      case 'media-plan':
        base.push('Campaigns', 'Media Plan');
        break;
      case 'loading':
        base.push('Creating Campaign');
        break;
    }
    
    return base;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className={cn(
      "border-t bg-background transition-all duration-500 animate-slide-up",
      isExpanded ? "h-screen" : "h-[66vh]",
      "md:relative",
      "max-md:fixed max-md:inset-0 max-md:z-50 max-md:bg-background max-md:h-screen",
      className
    )}>
      {/* Header */}
      <div className="border-b bg-muted/30">
        {/* Breadcrumbs */}
        <div className="px-4 py-1.5 text-xs text-muted-foreground border-b border-border/40">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                  {crumb}
                </span>
                {i < breadcrumbs.length - 1 && (
                  <span className="text-muted-foreground/50">/</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2">
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
      </div>
      
      {/* Content */}
      <ScrollArea className="h-[calc(100%-48px)]">
        {renderMode === 'dashboard' && <DashboardView data={data} />}
        {renderMode === 'loading' && <LoadingView />}
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
