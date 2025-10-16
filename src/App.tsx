import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { OnboardingGuard } from "./components/layout/OnboardingGuard";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Sitemap from "./pages/Sitemap";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ConnectPlatforms from "./pages/ConnectPlatforms";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/connect-platforms" element={<OnboardingGuard><MainLayout><ConnectPlatforms /></MainLayout></OnboardingGuard>} />
          <Route path="/dashboard" element={<OnboardingGuard><MainLayout><Dashboard /></MainLayout></OnboardingGuard>} />
          <Route path="/" element={<OnboardingGuard><MainLayout><Index /></MainLayout></OnboardingGuard>} />
          <Route path="/results" element={<OnboardingGuard><MainLayout><Results /></MainLayout></OnboardingGuard>} />
          <Route path="/sitemap" element={<OnboardingGuard><MainLayout><Sitemap /></MainLayout></OnboardingGuard>} />
          <Route path="/history" element={<OnboardingGuard><MainLayout><History /></MainLayout></OnboardingGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
