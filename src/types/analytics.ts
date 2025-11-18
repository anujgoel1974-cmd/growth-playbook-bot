export type AnalyticsTemplateId =
  | "weekly_performance"
  | "wasted_spend"
  | "scaling_opportunities"
  | "funnel_dropoff"
  | "creative_fatigue"
  | "top_bottom_skus"
  | "channel_mix"
  | "geo_performance"
  | "account_anomalies"
  | "roas_drop_explainer";

export type AnalyticsSectionType = 
  | { type: "text"; title?: string; body: string }
  | { type: "table"; title: string; columns: string[]; rows: any[][] }
  | { type: "chart"; title: string; chartType: "line" | "bar" | "pie" | "funnel" | "scatter"; config: any };

export interface Recommendation {
  title: string;
  description: string;
  severity?: "info" | "warning" | "critical";
  tags?: string[];
}

export interface AnalyticsRunRequest {
  templateId: AnalyticsTemplateId;
  dateRange: { from: string; to: string };
  platforms: string[];
  extraFilters?: Record<string, any>;
  followUpQuery?: string;
  sessionId?: string;
}

export interface AnalyticsRunResponse {
  sessionId: string;
  templateId: string;
  summary: string;
  sections: AnalyticsSectionType[];
  recommendations: Recommendation[];
}

export interface AnalyticsTemplate {
  id: AnalyticsTemplateId;
  name: string;
  description: string;
  category: "Overview" | "Spend & Efficiency" | "Funnel & Pixel" | "Creative & SKU" | "Health & Anomalies";
}

export interface AnalyticsSession {
  sessionId: string;
  templateId: AnalyticsTemplateId;
  templateName: string;
  timeRange: string;
  timestamp: Date;
  platforms: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  response?: AnalyticsRunResponse;
}
