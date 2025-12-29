import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TopologyVersionProvider } from "@/contexts/TopologyVersionContext";
import { AppLayout } from "@/components/layout/AppLayout";
import TopologyViewer from "./pages/TopologyViewer";
import ServicesPage from "./pages/ServicesPage";
import InfrastructurePage from "./pages/InfrastructurePage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ChangeHistoryPage from "./pages/ChangeHistoryPage";
import DiscoverySuggestionsPage from "./pages/DiscoverySuggestionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <TopologyVersionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<TopologyViewer />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/infrastructure" element={<InfrastructurePage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/history" element={<ChangeHistoryPage />} />
                <Route path="/discovery" element={<DiscoverySuggestionsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TopologyVersionProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
