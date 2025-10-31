import { CustomerInsight, Competitor, Trend, MediaPlan } from '@/types/unified-chat';
import { InlineCustomerInsightCard } from '@/components/chat/InlineCustomerInsightCard';
import { InlineCompetitorCard } from '@/components/chat/InlineCompetitorCard';
import { InlineTrendCard } from '@/components/chat/InlineTrendCard';
import { InlineMediaPlanCard } from '@/components/chat/InlineMediaPlanCard';

interface InlineCardsGroupProps {
  customerInsights?: CustomerInsight[];
  competitors?: Competitor[];
  trends?: Trend[];
  mediaPlan?: MediaPlan;
  onViewCampaignDetails?: () => void;
}

export function InlineCardsGroup({
  customerInsights,
  competitors,
  trends,
  mediaPlan,
  onViewCampaignDetails,
}: InlineCardsGroupProps) {
  return (
    <div className="space-y-4">
      {customerInsights && customerInsights.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Customer Insights</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {customerInsights.map((insight, index) => (
              <InlineCustomerInsightCard
                key={index}
                insight={{
                  id: `customer-${index}`,
                  title: insight.persona,
                  content: insight.description,
                  subItems: [
                    ...insight.painPoints.map(p => ({ label: 'Pain Point', value: p })),
                    ...insight.decisionTriggers.map(d => ({ label: 'Trigger', value: d }))
                  ]
                }}
              />
            ))}
          </div>
        </div>
      )}

      {competitors && competitors.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Competitive Analysis</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {competitors.map((competitor, index) => (
              <InlineCompetitorCard
                key={index}
                competitor={{
                  id: `competitor-${index}`,
                  competitorName: competitor.name,
                  domain: competitor.name.toLowerCase().replace(/\s+/g, '') + '.com',
                  category: 'Competitor',
                  pricePoint: 'Similar',
                  keyStrength: competitor.strengths[0] || '',
                  weakness: competitor.weaknesses[0] || ''
                }}
              />
            ))}
          </div>
        </div>
      )}

      {trends && trends.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Market Trends</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trends.map((trend, index) => (
              <InlineTrendCard
                key={index}
                trend={{
                  id: `trend-${index}`,
                  headline: trend.title,
                  overview: trend.description,
                  productAlignment: trend.opportunity,
                  timeframe: 'upcoming' as const,
                  relevanceScore: 85,
                  category: trend.relevance
                }}
              />
            ))}
          </div>
        </div>
      )}

      {mediaPlan && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Media Plan</h3>
          <InlineMediaPlanCard
            mediaPlan={{
              weekNumber: mediaPlan.week,
              channels: mediaPlan.channels,
              reasoning: mediaPlan.reasoning
            }}
            onViewCampaignDetails={onViewCampaignDetails}
          />
        </div>
      )}
    </div>
  );
}
