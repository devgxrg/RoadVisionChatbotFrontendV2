import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "@/lib/redux/store";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import PlatformDashboard from "./pages/PlatformDashboard";
import LegalIQDashboard from "./pages/LegalIQDashboard";
import DMS from "./pages/DMS";
import TenderIQ from "./pages/TenderIQ";
import BidSynopsis from "./pages/BidSynopsis/BidSynopsis";
import TenderDetails from "./pages/TenderDetails/TenderDetails";
import AnalyzeTender from "./pages/AnalyzeTender";
import WishlistHistory from "./pages/WishlistHistory/WishlistHistory";
import AnalyzeDocument from "./pages/AnalyzeDocument";
import DocumentDrafting from "./pages/DocumentDrafting";
import DocumentAnonymization from "./pages/DocumentAnonymization";
import CaseTracker from "./pages/CaseTracker";
import LegalResearch from "./pages/LegalResearch";
import AskAI from "./pages/AskAI";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import LiveTenders from "./pages/LiveTenders/LiveTenders";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          {/* Auth Route */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Platform Routes */}
          <Route path="/" element={<ProtectedRoute><AppLayout><PlatformDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
          
          {/* Protected LegalIQ Module Routes */}
          <Route path="/legaliq" element={<ProtectedRoute><AppLayout><LegalIQDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/legaliq/analyze" element={<ProtectedRoute><AppLayout><AnalyzeDocument /></AppLayout></ProtectedRoute>} />
          <Route path="/legaliq/drafting" element={<ProtectedRoute><AppLayout><DocumentDrafting /></AppLayout></ProtectedRoute>} />
          <Route path="/legaliq/anonymization" element={<ProtectedRoute><AppLayout><DocumentAnonymization /></AppLayout></ProtectedRoute>} />
          <Route path="/legaliq/cases" element={<ProtectedRoute><AppLayout><CaseTracker /></AppLayout></ProtectedRoute>} />
          <Route path="/legaliq/research" element={<ProtectedRoute><AppLayout><LegalResearch /></AppLayout></ProtectedRoute>} />
          
          {/* Protected DMS Routes - Standalone layout like AskAI */}
          <Route path="/dms" element={<ProtectedRoute><DMS /></ProtectedRoute>} />
          <Route path="/dmsiq" element={<ProtectedRoute><DMS /></ProtectedRoute>} />
          
          {/* Protected TenderIQ Routes */}
          <Route path="/tenderiq/*" element={<ProtectedRoute><AppLayout><LiveTenders /></AppLayout></ProtectedRoute>} />
          <Route path="/tenderiq/view/:id" element={<ProtectedRoute><AppLayout><TenderDetails /></AppLayout></ProtectedRoute>} />
          <Route path="/tenderiq/analyze/:id" element={<ProtectedRoute><AppLayout><AnalyzeTender /></AppLayout></ProtectedRoute>} />
          <Route path="/tenderiq/wishlist-history" element={<ProtectedRoute><AppLayout><WishlistHistory /></AppLayout></ProtectedRoute>} />

          <Route path="/synopsis/:id" element={<AppLayout><BidSynopsis /></AppLayout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
);

export default App;
