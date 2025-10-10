import { Card } from "@/components/ui/card";

interface GoogleDisplayAdPreviewProps {
  creative: {
    headlines: string[];
    descriptions: string[];
    imageUrl?: string;
  };
}

export const GoogleDisplayAdPreview = ({ creative }: GoogleDisplayAdPreviewProps) => {
  const headline = creative.headlines[0]?.slice(0, 25) || '';
  const description = creative.descriptions[0]?.slice(0, 90) || '';

  return (
    <Card className="w-[300px] mx-auto overflow-hidden shadow-lg bg-background">
      {/* Image */}
      <div className="relative aspect-[250/250] bg-muted">
        {creative.imageUrl ? (
          <img 
            src={creative.imageUrl} 
            alt="Display ad" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        )}
        {/* Ad Badge */}
        <div className="absolute top-2 right-2 bg-background/90 px-2 py-0.5 rounded text-xs font-semibold">
          Ad
        </div>
      </div>

      {/* Text Content */}
      <div className="p-3 space-y-2">
        <h4 className="font-bold text-sm text-foreground">
          {headline}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
        <div className="text-xs text-green-600 dark:text-green-400">
          yourwebsite.com
        </div>
        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 rounded">
          Learn More
        </button>
      </div>
    </Card>
  );
};
