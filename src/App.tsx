import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import Index from "./pages/Index";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";
import Crew from "./pages/Crew";
import AuthPage from "./pages/Auth";
import PersonalProfilePage from "./pages/PersonalProfile";
import Profile from "./pages/Profile"; // New import
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/game" element={<Game />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<Profile />} /> {/* New Route */}
              <Route path="/personal-profile" element={<PersonalProfilePage />} />
              <Route path="/crew" element={<Crew />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GameProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
