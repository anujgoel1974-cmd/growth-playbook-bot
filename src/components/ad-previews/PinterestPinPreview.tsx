import { Card } from "@/components/ui/card";
import { MoreHorizontal, Upload } from "lucide-react";

interface PinterestPinPreviewProps {
  creative: {
    headlines: string[];
    descriptions: string[];
    imageUrl?: string;
    logoUrl?: string;
  };
}

export const PinterestPinPreview = ({ creative }: PinterestPinPreviewProps) => {
  const title = creative.headlines[0]?.slice(0, 100) || '';

  return (
    <Card className="w-[236px] mx-auto overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-background rounded-2xl">
      {/* Pin Image */}
      <div className="relative aspect-[2/3] bg-muted group cursor-pointer">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Pinterest pin" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-3">
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold text-sm">
            Save
          </button>
        </div>

        {/* Title Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h4 className="text-white font-semibold text-sm line-clamp-2">
            {title}
          </h4>
        </div>
      </div>

      {/* Pin Footer */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {creative.logoUrl ? (
            <img src={creative.logoUrl} alt="Brand logo" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-orange-400" />
          )}
          <span className="text-xs font-semibold">Your Brand</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-muted rounded">
            <Upload className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-muted rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};
