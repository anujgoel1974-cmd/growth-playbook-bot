import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Briefcase, Megaphone, TrendingUp, Palette, Building2, Users, ChevronLeft } from "lucide-react";

const roles = [
  {
    value: 'Founder/CEO',
    label: 'Founder / CEO',
    description: 'Building and growing my business',
    icon: Briefcase
  },
  {
    value: 'Marketing Manager',
    label: 'Marketing Manager',
    description: 'Managing marketing strategy and campaigns',
    icon: Megaphone
  },
  {
    value: 'Marketing Analyst',
    label: 'Marketing Analyst',
    description: 'Analyzing data and optimizing performance',
    icon: TrendingUp
  },
  {
    value: 'Content Creator',
    label: 'Content Creator',
    description: 'Creating ads and creative content',
    icon: Palette
  },
  {
    value: 'Agency Professional',
    label: 'Agency Professional',
    description: 'Managing campaigns for clients',
    icon: Building2
  },
  {
    value: 'Freelancer',
    label: 'Freelancer',
    description: 'Running campaigns for multiple clients',
    icon: Users
  },
  {
    value: 'Other',
    label: 'Other',
    description: 'Just getting started with advertising',
    icon: Sparkles
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [hasAdvertised, setHasAdvertised] = useState<boolean | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleStep1Answer = (answer: boolean) => {
    setHasAdvertised(answer);
    setCurrentStep(2);
  };

  const handleStep2Complete = () => {
    if (!selectedRole) return;
    
    localStorage.setItem("hasAdvertisedBefore", hasAdvertised!.toString());
    localStorage.setItem("userRole", selectedRole);
    localStorage.setItem("hasCompletedOnboarding", "true");
    
    // Navigate based on step 1 answer
    if (hasAdvertised) {
      navigate("/connect-platforms");
    } else {
      navigate("/new-campaign");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center shadow-elegant">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Welcome to AdCraft AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-16 rounded-full transition-all ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-16 rounded-full transition-all ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {/* Step 1: Advertising Experience */}
        {currentStep === 1 && (
          <Card className="shadow-card-hover border-2">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Step 1 of 2</p>
                  <h2 className="text-2xl font-semibold">
                    Have you advertised your products or services before?
                  </h2>
                  <p className="text-muted-foreground">
                    This helps us tailor the experience to your needs
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-32 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/5 transition-all hover-scale"
                    onClick={() => handleStep1Answer(true)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">✓</div>
                      <span>Yes, I have</span>
                    </div>
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-32 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/5 transition-all hover-scale"
                    onClick={() => handleStep1Answer(false)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">✨</div>
                      <span>No, I'm new</span>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Role Selection */}
        {currentStep === 2 && (
          <Card className="shadow-card-hover border-2">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Step 2 of 2</p>
                  <h2 className="text-2xl font-semibold">
                    What best describes your role?
                  </h2>
                  <p className="text-muted-foreground">
                    We'll personalize all insights and recommendations for your specific needs
                  </p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="h-14 text-base border-2">
                      <SelectValue placeholder="Select your role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <SelectItem key={role.value} value={role.value} className="py-3">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-primary" />
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{role.label}</span>
                                <span className="text-xs text-muted-foreground">{role.description}</span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-primary hover:opacity-90"
                      onClick={handleStep2Complete}
                      disabled={!selectedRole}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          {currentStep === 1 
            ? "Your answer will help us customize your dashboard and recommendations"
            : "All insights will be tailored to your role and expertise level"
          }
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
