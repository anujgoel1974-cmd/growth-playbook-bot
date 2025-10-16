import { Button } from '@/components/ui/button';
import { BarChart3, History, ArrowLeft, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/connect-platforms')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Campaign Analytics</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/history')}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            
            <Button
              onClick={() => {
                localStorage.setItem("hasAdvertisedBefore", "false");
                navigate('/');
              }}
              className="gap-2"
            >
              <Rocket className="h-4 w-4" />
              Launch New Campaign
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
