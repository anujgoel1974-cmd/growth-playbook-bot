import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Rocket } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();

  const handleAnswer = (hasAdvertised: boolean) => {
    localStorage.setItem("hasAdvertisedBefore", JSON.stringify(hasAdvertised));
    localStorage.setItem("hasCompletedOnboarding", "true");
    
    if (hasAdvertised) {
      navigate("/connect-platforms");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Let's Get Started! 🚀
          </h1>
          <p className="text-lg text-muted-foreground">
            Help us personalize your experience
          </p>
        </div>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-center mb-8">
              Have you advertised before?
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer(true)}
                variant="outline"
                className="h-auto py-8 flex flex-col items-center gap-4 hover-scale border-2 hover:border-primary"
              >
                <CheckCircle className="w-12 h-12 text-primary" />
                <div>
                  <div className="text-xl font-semibold">Yes</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    I have advertising experience
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
                className="h-auto py-8 flex flex-col items-center gap-4 hover-scale border-2 hover:border-primary"
              >
                <Rocket className="w-12 h-12 text-primary" />
                <div>
                  <div className="text-xl font-semibold">No</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    I'm new to advertising
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
