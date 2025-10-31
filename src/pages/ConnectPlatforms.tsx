import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Search, Facebook, Music, Linkedin, Image } from "lucide-react";

interface ConnectedPlatforms {
  google: boolean;
  meta: boolean;
  bing: boolean;
  tiktok: boolean;
  linkedin: boolean;
  pinterest: boolean;
}

const platforms = [
  {
    id: "google" as keyof ConnectedPlatforms,
    name: "Google Ads",
    description: "Connect your Google Ads account",
    icon: Search,
  },
  {
    id: "meta" as keyof ConnectedPlatforms,
    name: "Meta",
    description: "Facebook & Instagram Ads",
    icon: Facebook,
  },
  {
    id: "bing" as keyof ConnectedPlatforms,
    name: "Bing Ads",
    description: "Microsoft Advertising",
    icon: Search,
  },
  {
    id: "tiktok" as keyof ConnectedPlatforms,
    name: "TikTok",
    description: "TikTok for Business",
    icon: Music,
  },
  {
    id: "linkedin" as keyof ConnectedPlatforms,
    name: "LinkedIn",
    description: "LinkedIn Campaign Manager",
    icon: Linkedin,
  },
  {
    id: "pinterest" as keyof ConnectedPlatforms,
    name: "Pinterest",
    description: "Pinterest Ads",
    icon: Image,
  },
];

const ConnectPlatforms = () => {
  const navigate = useNavigate();
  const [connected, setConnected] = useState<ConnectedPlatforms>({
    google: false,
    meta: false,
    bing: false,
    tiktok: false,
    linkedin: false,
    pinterest: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("connectedPlatforms");
    if (stored) {
      setConnected(JSON.parse(stored));
    }
  }, []);

  const handleConnect = (platformId: keyof ConnectedPlatforms) => {
    const newConnected = { ...connected, [platformId]: !connected[platformId] };
    setConnected(newConnected);
    localStorage.setItem("connectedPlatforms", JSON.stringify(newConnected));
  };

  const handleContinue = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    navigate("/chat");
  };

  const handleSkip = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    navigate("/chat");
  };

  const hasConnectedPlatforms = Object.values(connected).some((v) => v);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            Step 2 of 2
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Connect Your Advertising Platforms
          </h1>
          <p className="text-lg text-muted-foreground">
            Link your accounts to unlock personalized insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            const isConnected = connected[platform.id];

            return (
              <Card
                key={platform.id}
                className={`hover-scale transition-all ${
                  isConnected ? "border-green-500 border-2" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {isConnected && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {platform.description}
                  </p>
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    variant={isConnected ? "outline" : "default"}
                    className="w-full"
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="ghost" size="lg" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!hasConnectedPlatforms}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectPlatforms;
