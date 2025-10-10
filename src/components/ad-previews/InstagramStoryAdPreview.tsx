import { Card } from "@/components/ui/card";

interface InstagramStoryAdPreviewProps {
  creative: {
    headlines: string[];
    descriptions: string[];
    imageUrl?: string;
  };
}

export const InstagramStoryAdPreview = ({ creative }: InstagramStoryAdPreviewProps) => {
  const textOverlay = creative.headlines[0]?.slice(0, 15) || '';
  const cta = creative.descriptions[0]?.slice(0, 10) || 'Shop Now';

  return (
    <Card className="relative w-[270px] h-[480px] mx-auto overflow-hidden shadow-2xl bg-black">
      {/* iPhone Frame Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20" />
      
      {/* Story Header */}
      <div className="absolute top-8 left-0 right-0 px-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white" />
          <span className="text-white text-sm font-semibold drop-shadow-lg">Your Brand</span>
        </div>
        <span className="text-white text-xs drop-shadow-lg">Sponsored</span>
      </div>

      {/* Story Image Background */}
      <div className="absolute inset-0">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Story ad" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-purple-500 to-pink-500 flex items-center justify-center text-white">
            Loading...
          </div>
        )}
      </div>

      {/* Text Overlay */}
      {textOverlay && (
        <div className="absolute top-1/3 left-0 right-0 px-4 z-10">
          <h2 className="text-white text-3xl font-bold drop-shadow-2xl text-center">
            {textOverlay}
          </h2>
        </div>
      )}

      {/* Swipe Up CTA */}
      <div className="absolute bottom-8 left-0 right-0 px-6 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full py-3 px-6 flex items-center justify-center gap-2">
          <span className="font-bold text-gray-900">{cta}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
      </div>
    </Card>
  );
};
