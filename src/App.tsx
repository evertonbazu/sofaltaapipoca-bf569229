
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Contact from '@/pages/Contact';
import Profile from '@/pages/Profile';
import SubmitSubscription from '@/pages/SubmitSubscription';
import SubscriptionDetails from '@/pages/SubscriptionDetails';
import NotFound from '@/pages/NotFound';

// Admin pages
import Dashboard from '@/pages/admin/Dashboard';
import Subscriptions from '@/pages/admin/Subscriptions';
import Reports from '@/pages/admin/Reports';
import PendingSubscriptions from '@/pages/admin/PendingSubscriptions';
import SubscriptionEditor from '@/pages/admin/SubscriptionEditor';
import ChatSubscriptionEditor from '@/pages/admin/ChatSubscriptionEditor';
import Users from '@/pages/admin/Users';
import Messages from '@/pages/admin/Messages';
import HeaderButtons from '@/pages/admin/HeaderButtons';
import Settings from '@/pages/admin/Settings';

/**
 * Aplicação principal com roteamento
 * @version 3.9.3
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/submit" element={<SubmitSubscription />} />
            <Route path="/subscription/:id" element={<SubscriptionDetails />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/subscriptions" element={<Subscriptions />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/subscriptions/new" element={<SubscriptionEditor />} />
            <Route path="/admin/subscriptions/edit/:id" element={<SubscriptionEditor />} />
            <Route path="/admin/subscriptions/chat/:id" element={<ChatSubscriptionEditor />} />
            <Route path="/admin/pending" element={<PendingSubscriptions />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/messages" element={<Messages />} />
            <Route path="/admin/header-buttons" element={<HeaderButtons />} />
            <Route path="/admin/settings" element={<Settings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
