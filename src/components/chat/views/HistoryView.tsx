import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { AnalysisHistoryCard } from '@/components/AnalysisHistoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { VisualCanvasData } from '@/types/visual-canvas';

interface HistoryViewProps {
  data?: VisualCanvasData;
}

export function HistoryView({ data }: HistoryViewProps) {
  const { analyses, isLoading, deleteAnalysis, toggleFavorite } = useAnalysisHistory();
  
  if (isLoading) {
    return (
      <div className="p-6 grid gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }
  
  if (analyses.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No previous analyses found.</p>
        <p className="text-sm mt-2">Create your first campaign to see it here!</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="grid gap-4">
        {analyses.map((analysis) => (
          <AnalysisHistoryCard
            key={analysis.id}
            id={analysis.id}
            sessionId={analysis.session_id}
            url={analysis.url}
            title={analysis.title}
            thumbnailUrl={analysis.thumbnail_url}
            createdAt={analysis.created_at}
            isFavorite={analysis.is_favorite}
            productName={analysis.product_name}
            channels={analysis.channels}
            onDelete={() => deleteAnalysis(analysis.id)}
            onToggleFavorite={() => toggleFavorite({
              id: analysis.id,
              isFavorite: analysis.is_favorite
            })}
          />
        ))}
      </div>
    </div>
  );
}
