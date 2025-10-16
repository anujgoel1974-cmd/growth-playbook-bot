import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalysisHistoryCard } from "@/components/AnalysisHistoryCard";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const History = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { analyses, isLoading, deleteAnalysis, toggleFavorite } = useAnalysisHistory(
    searchQuery,
    channelFilter,
    sortBy
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analysis History</h1>
          <p className="text-muted-foreground">
            View and manage your saved campaign analyses
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by URL, product name, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="meta">Meta</SelectItem>
              <SelectItem value="pinterest">Pinterest</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="accessed">Recently Accessed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} found
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No analyses found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || channelFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Start analyzing landing pages to build your campaign strategy library"}
            </p>
            <Button onClick={() => navigate("/")}>
              Analyze Your First Page
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <AnalysisHistoryCard
                key={analysis.id}
                id={analysis.id}
                sessionId={analysis.session_id}
                title={analysis.title}
                url={analysis.url}
                thumbnailUrl={analysis.thumbnail_url}
                createdAt={analysis.created_at}
                channels={analysis.channels}
                isFavorite={analysis.is_favorite}
                productName={analysis.product_name}
                onDelete={() => deleteAnalysis(analysis.id)}
                onToggleFavorite={() =>
                  toggleFavorite({ id: analysis.id, isFavorite: analysis.is_favorite })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
