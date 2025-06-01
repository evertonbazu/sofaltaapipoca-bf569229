
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/admin/Dashboard";
import Subscriptions from "./pages/admin/Subscriptions";
import SubscriptionEditor from "./pages/admin/SubscriptionEditor";
import ChatSubscriptionEditor from "./pages/admin/ChatSubscriptionEditor";
import Settings from "./pages/admin/Settings";
import HeaderButtons from "./pages/admin/HeaderButtons";
import Users from "./pages/admin/Users";
import Profile from "./pages/Profile";
import SubmitSubscription from "./pages/SubmitSubscription";
import PendingSubscriptions from "./pages/admin/PendingSubscriptions";
import Contact from "./pages/Contact";
import Messages from "./pages/admin/Messages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/submit-subscription" element={<SubmitSubscription />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Rotas Administrativas */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/subscriptions" element={<Subscriptions />} />
            <Route path="/admin/subscriptions/new" element={<SubscriptionEditor />} />
            <Route path="/admin/subscriptions/edit/:id" element={<SubscriptionEditor />} />
            <Route path="/admin/subscriptions/chat" element={<ChatSubscriptionEditor />} />
            <Route path="/admin/subscriptions/pending" element={<PendingSubscriptions />} />
            <Route path="/admin/messages" element={<Messages />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/header-buttons" element={<HeaderButtons />} />
            <Route path="/admin/settings" element={<Settings />} />
            
            {/* Rota de fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
