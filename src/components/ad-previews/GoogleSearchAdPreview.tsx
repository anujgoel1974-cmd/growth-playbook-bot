import { Card } from "@/components/ui/card";

interface GoogleSearchAdPreviewProps {
  creative: {
    headlines: string[];
    descriptions: string[];
  };
}

export const GoogleSearchAdPreview = ({ creative }: GoogleSearchAdPreviewProps) => {
  return (
    <Card className="max-w-[600px] mx-auto p-4 bg-background shadow-md">
      <div className="space-y-1">
        {/* Ad Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground border border-foreground px-1 rounded">
            Ad
          </span>
          <span className="text-xs text-muted-foreground">yourwebsite.com</span>
        </div>

        {/* Headlines */}
        <div>
          <h3 className="text-blue-600 hover:underline cursor-pointer text-xl font-normal">
            {creative.headlines.slice(0, 3).map((h, i) => h.slice(0, 30)).join(' | ')}
          </h3>
        </div>

        {/* Display URL */}
        <div className="text-sm">
          <span className="text-green-700 dark:text-green-400">
            https://yourwebsite.com
          </span>
          <span className="text-muted-foreground"> › Product</span>
        </div>

        {/* Descriptions */}
        <div className="text-sm text-muted-foreground">
          {creative.descriptions.slice(0, 2).map((d, i) => d.slice(0, 90)).join(' ')}
        </div>
      </div>
    </Card>
  );
};
