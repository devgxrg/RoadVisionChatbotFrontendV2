import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "@/lib/redux/store";
import { AppLayout } from "./components/layout/AppLayout";
import { ChatLayout } from "./components/layout/ChatLayout";
import { DMSLayout } from "./components/layout/DMSLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useSessionExpiration } from "@/hooks/useSessionExpiration";
import PlatformDashboard from "./pages/PlatformDashboard";
import CeigallIQDashboard from "./pages/LegalIQDashboard";
import DMS from "./pages/DMS";
import TenderIQ from "./pages/TenderIQ";
import BidSynopsis from "./pages/BidSynopsis/BidSynopsis";
import TenderDetails from "./pages/TenderDetails/TenderDetails";
import AnalyzeTender from "./pages/AnalyzeTender/AnalyzeTender";
import WishlistHistory from "./pages/WishlistHistory/WishlistHistory";
import AnalyzeDocument from "./pages/AnalyzeDocument";
import DocumentDrafting from "./pages/DocumentDrafting";
import DocumentAnonymization from "./pages/DocumentAnonymization";
import DocumentCompare from "./pages/DocumentCompare";
import CaseTracker from "./pages/CaseTracker";
import LegalResearch from "./pages/LegalResearch";
import AskAI from "./pages/AskAI";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import LiveTenders from "./pages/LiveTenders/LiveTenders";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LegalIQDashboard from "./pages/LegalIQDashboard";
import LegalAI from "./pages/LegalAI";

const queryClient = new QueryClient();

// Scroll to top on every route change
function RouteChangeHandler() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

// App routes with session monitoring
function AppRoutes() {
  useSessionExpiration();
  
  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected Platform Routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout><PlatformDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/ask-ai" element={<ProtectedRoute><ChatLayout><AskAI /></ChatLayout></ProtectedRoute>} />
      
      {/* User Profile Route */}
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      
      {/* Protected CeigallIQ Module Routes */}
      <Route path="/ceigalliq" element={<ProtectedRoute><AppLayout><CeigallIQDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/ceigalliq/analyze" element={<ProtectedRoute><AppLayout><AnalyzeDocument /></AppLayout></ProtectedRoute>} />
      <Route path="/ceigalliq/drafting" element={<ProtectedRoute><AppLayout><DocumentDrafting /></AppLayout></ProtectedRoute>} />
      <Route path="/ceigalliq/compare" element={<ProtectedRoute><AppLayout><DocumentCompare /></AppLayout></ProtectedRoute>} />
      <Route path="/ceigalliq/cases" element={<ProtectedRoute><AppLayout><CaseTracker /></AppLayout></ProtectedRoute>} />
      <Route path="/ceigalliq/research" element={<ProtectedRoute><AppLayout><LegalResearch /></AppLayout></ProtectedRoute>} />
      
      {/* Protected DMS Routes - Standalone layout like AskAI */}
      <Route path="/dms" element={<ProtectedRoute><DMSLayout><DMS /></DMSLayout></ProtectedRoute>} />
      <Route path="/dmsiq" element={<ProtectedRoute><DMSLayout><DMS /></DMSLayout></ProtectedRoute>} />
      
      {/* Protected TenderIQ Routes */}
      <Route path="/tenderiq/view/:id" element={<ProtectedRoute><AppLayout><TenderDetails /></AppLayout></ProtectedRoute>} />
      <Route path="/tenderiq/analyze/:id" element={<ProtectedRoute><AppLayout><AnalyzeTender /></AppLayout></ProtectedRoute>} />
      <Route path="/tenderiq/wishlist-history" element={<ProtectedRoute><AppLayout><WishlistHistory /></AppLayout></ProtectedRoute>} />
      <Route path="/tenderiq/*" element={<ProtectedRoute><AppLayout><LiveTenders /></AppLayout></ProtectedRoute>} />


      {/* LegalIQ Module Routes */}
          <Route path="/legaliq" element={<AppLayout><LegalIQDashboard /></AppLayout>} />
          <Route path="/legaliq/analyze" element={<AppLayout><AnalyzeDocument /></AppLayout>} />
          <Route path="/legaliq/drafting" element={<AppLayout><DocumentDrafting /></AppLayout>} />
          <Route path="/legaliq/compare" element={<AppLayout><DocumentCompare /></AppLayout>} />
          <Route path="/legaliq/cases" element={<AppLayout><CaseTracker /></AppLayout>} />
          <Route path="/legaliq/research" element={<AppLayout><LegalResearch /></AppLayout>} />
          <Route path="/legaliq/ask-ai" element={<AppLayout><LegalAI /></AppLayout>} />

      <Route path="/synopsis/:id" element={<AppLayout><BidSynopsis /></AppLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteChangeHandler />
          <AppRoutes />
        </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
);

export default App;
