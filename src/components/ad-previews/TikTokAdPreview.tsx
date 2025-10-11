import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";

interface TikTokAdPreviewProps {
  creative: {
    headlines: string[];
    descriptions: string[];
    imageUrl?: string;
    logoUrl?: string;
  };
}

export const TikTokAdPreview = ({ creative }: TikTokAdPreviewProps) => {
  const hook = creative.headlines[0]?.slice(0, 15) || '';
  const mainMessage = creative.headlines[1]?.slice(0, 30) || '';
  const cta = creative.descriptions[0]?.slice(0, 20) || 'Shop Now';

  return (
    <Card className="relative w-[270px] h-[480px] mx-auto overflow-hidden shadow-2xl bg-black">
      {/* Video Background */}
      <div className="absolute inset-0">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="TikTok ad" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-cyan-500 to-purple-500 flex items-center justify-center text-white">
            Loading...
          </div>
        )}
      </div>

      {/* Text Overlays */}
      <div className="absolute top-1/4 left-4 right-16 z-10 space-y-2">
        {hook && (
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded inline-block">
            <span className="text-white font-bold text-lg">{hook}</span>
          </div>
        )}
        {mainMessage && (
          <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded">
            <span className="text-white text-base">{mainMessage}</span>
          </div>
        )}
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-2 bottom-24 flex flex-col gap-4 z-10">
        <div className="flex flex-col items-center">
          {creative.logoUrl ? (
            <img src={creative.logoUrl} alt="Brand logo" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 border-2 border-white" />
          )}
        </div>
        <button className="flex flex-col items-center text-white">
          <Heart className="w-8 h-8" fill="white" />
          <span className="text-xs mt-1">24.5K</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <MessageCircle className="w-8 h-8" />
          <span className="text-xs mt-1">1,234</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <Share className="w-8 h-8" />
          <span className="text-xs mt-1">567</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <Bookmark className="w-8 h-8" />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="text-white space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">@yourbrand</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Sponsored</span>
          </div>
          <p className="text-sm line-clamp-2">{mainMessage}</p>
          <button className="mt-2 bg-white text-black font-bold px-6 py-2 rounded-lg w-full">
            {cta}
          </button>
        </div>
      </div>
    </Card>
  );
};
