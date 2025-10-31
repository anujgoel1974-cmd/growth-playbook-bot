import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Sitemap from "./pages/Sitemap";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ConnectPlatforms from "./pages/ConnectPlatforms";
import Dashboard from "./pages/Dashboard";
import CampaignChat from "./pages/CampaignChat";
import ChatHub from "./pages/ChatHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/chat" element={<ChatHub />} />
          <Route path="/new-campaign" element={<MainLayout><Index /></MainLayout>} />
          <Route path="/campaign-chat" element={<Navigate to="/chat" replace />} />
          <Route path="/connect-platforms" element={<MainLayout><ConnectPlatforms /></MainLayout>} />
          <Route path="/dashboard" element={<Navigate to="/chat" replace />} />
          <Route path="/results" element={<MainLayout><Results /></MainLayout>} />
          <Route path="/sitemap" element={<MainLayout><Sitemap /></MainLayout>} />
          <Route path="/history" element={<MainLayout><History /></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
