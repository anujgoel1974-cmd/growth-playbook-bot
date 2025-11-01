export type VisualCanvasMode = 'none' | 'dashboard' | 'analysis' | 'loading' | 'media-plan' | 'history';

export interface VisualCanvasData {
  // Dashboard mode
  dateRange?: string;
  filters?: any;
  
  // Analysis mode
  url?: string;
  analysisData?: any;
  sessionId?: string;
  
  // Media plan mode
  mediaPlan?: any[];
  analysisId?: string;
  
  // History mode
  analyses?: any[];
}

export interface CanvasControlProps {
  renderMode: VisualCanvasMode;
  data?: VisualCanvasData;
  onClose?: () => void;
  onExpand?: () => void;
  onSendChatMessage?: (message: any) => void;
}
