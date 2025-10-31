import { ChartConfig } from './chart';

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationContext = 'general' | 'analytics' | 'campaign_creation' | 'history';

export interface ReasoningStep {
  phase: string;
  status: 'pending' | 'in-progress' | 'complete';
  text: string;
  progress?: number;
}

export interface ActionPrompt {
  category: 'deep_dive' | 'make_changes' | 'take_action';
  icon: string;
  label: string;
  action: string;
}

export interface CustomerInsight {
  persona: string;
  description: string;
  painPoints: string[];
  decisionTriggers: string[];
}

export interface Competitor {
  name: string;
  positioning: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Trend {
  title: string;
  description: string;
  relevance: string;
  opportunity: string;
}

export interface MediaPlanChannel {
  name: string;
  campaignType: string;
  budget: number;
  percentage: number;
}

export interface MediaPlan {
  week: number;
  totalBudget: number;
  channels: MediaPlanChannel[];
  reasoning?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  
  // Inline content
  reasoningSteps?: ReasoningStep[];
  customerInsights?: CustomerInsight[];
  competitors?: Competitor[];
  trends?: Trend[];
  mediaPlan?: MediaPlan;
  chart?: ChartConfig;
  actionPrompts?: ActionPrompt[];
  
  // UI state
  isReasoningContainer?: boolean;
}

export interface AnalysisData {
  customerInsights?: CustomerInsight[];
  competitors?: Competitor[];
  trends?: Trend[];
  mediaPlan?: MediaPlan;
  adCopy?: any;
  url?: string;
}
