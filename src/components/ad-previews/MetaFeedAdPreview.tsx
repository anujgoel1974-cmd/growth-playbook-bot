import { Card } from "@/components/ui/card";
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from "lucide-react";

interface MetaFeedAdPreviewProps {
  creative: {
    headlines: string[];
    descriptions: string[];
    imageUrl?: string;
    logoUrl?: string;
    channel: string;
  };
}

export const MetaFeedAdPreview = ({ creative }: MetaFeedAdPreviewProps) => {
  const primaryText = creative.headlines[0] || '';
  const headline = creative.headlines[1] || creative.headlines[0] || '';
  const description = creative.descriptions[0] || '';

  return (
    <Card className="max-w-[500px] mx-auto shadow-lg overflow-hidden bg-background">
      {/* Profile Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {creative.logoUrl ? (
            <img src={creative.logoUrl} alt="Brand logo" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
          )}
          <div>
            <div className="font-semibold text-sm">Your Brand</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              Sponsored · <span className="text-primary">Follow</span>
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Primary Text */}
      <div className="px-3 py-2 text-sm">
        {primaryText.slice(0, 125)}
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Ad creative" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Loading image...
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-4 text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-primary">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-xs">Like</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Comment</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary">
            <Share2 className="w-5 h-5" />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>

      {/* Link Preview */}
      <div className="px-3 py-2 bg-muted/50">
        <div className="font-semibold text-sm truncate">{headline.slice(0, 40)}</div>
        <div className="text-xs text-muted-foreground truncate">{description.slice(0, 30)}</div>
        <div className="text-xs text-muted-foreground mt-1">yourwebsite.com</div>
      </div>

      {/* CTA Button */}
      <div className="p-3">
        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg">
          Shop Now
        </button>
      </div>
    </Card>
  );
};
