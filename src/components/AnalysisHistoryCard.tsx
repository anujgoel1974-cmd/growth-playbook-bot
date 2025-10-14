import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface AnalysisHistoryCardProps {
  id: string;
  sessionId: string;
  title: string | null;
  url: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  channels: string[] | null;
  isFavorite: boolean;
  productName?: string | null;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const channelColors: Record<string, string> = {
  google: "bg-blue-500",
  meta: "bg-indigo-500",
  pinterest: "bg-red-500",
  tiktok: "bg-pink-500",
  youtube: "bg-red-600",
  linkedin: "bg-blue-700",
};

export const AnalysisHistoryCard = ({
  sessionId,
  title,
  url,
  thumbnailUrl,
  createdAt,
  channels,
  isFavorite,
  productName,
  onDelete,
  onToggleFavorite,
}: AnalysisHistoryCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/results?url=${encodeURIComponent(url)}&session=${sessionId}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title || productName || "Analysis thumbnail"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <ExternalLink className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {title || productName || "Untitled Analysis"}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{url}</p>
          </div>

          {channels && channels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {channels.slice(0, 4).map((channel) => (
                <Badge
                  key={channel}
                  variant="secondary"
                  className={`${channelColors[channel.toLowerCase()] || "bg-gray-500"} text-white text-xs`}
                >
                  {channel}
                </Badge>
              ))}
              {channels.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{channels.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleView} className="h-8">
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
