import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface YouTubeThumbnailPreviewProps {
  creative: {
    headlines: string[];
    descriptions: string[];
    imageUrl?: string;
  };
}

export const YouTubeThumbnailPreview = ({ creative }: YouTubeThumbnailPreviewProps) => {
  const title = creative.headlines[0]?.slice(0, 100) || '';
  const thumbnailText = creative.headlines[1]?.slice(0, 30) || '';

  return (
    <Card className="w-[360px] mx-auto overflow-hidden shadow-lg bg-background">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900 group cursor-pointer">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="YouTube thumbnail" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        )}
        
        {/* Thumbnail Text Overlay */}
        {thumbnailText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-white font-black text-2xl text-center drop-shadow-2xl px-4 bg-black/30 py-2 rounded">
              {thumbnailText}
            </h3>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-white text-xs font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          0:30
        </div>

        {/* Play Button Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-3 space-y-2">
        <h4 className="font-semibold text-sm line-clamp-2 text-foreground">
          {title}
        </h4>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-orange-400" />
          <div className="text-xs text-muted-foreground">
            <div className="font-semibold">Your Brand</div>
            <div>Sponsored • 2.4M views • 2 days ago</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
