
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Pages
import Index from './pages/Index';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import NewSubscription from './pages/NewSubscription';
import ImportBulkSubscriptions from './pages/admin/ImportBulkSubscriptions';
import ImportSubscriptionText from './pages/admin/ImportSubscriptionText';

// Components
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './App.css';
import { supabase, initializeStorage } from './integrations/supabase/client';
import { ThemeProvider } from './components/ui/theme-provider';

// Create React-Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  // Initialize storage buckets if needed
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/new-subscription" element={<NewSubscription />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute admin><Navigate to="/admin" replace /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute admin><Admin section="subscriptions" /></ProtectedRoute>} />
              <Route path="/admin/subscriptions/new" element={<ProtectedRoute admin><Admin section="subscriptions" action="new" /></ProtectedRoute>} />
              <Route path="/admin/subscriptions/edit/:id" element={<ProtectedRoute admin><Admin section="subscriptions" action="edit" /></ProtectedRoute>} />
              <Route path="/admin/pending-subscriptions" element={<ProtectedRoute admin><Admin section="pending-subscriptions" /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute admin><Admin section="messages" /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute admin><Admin section="users" /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute admin><Admin section="profile" /></ProtectedRoute>} />
              <Route path="/admin/export" element={<ProtectedRoute admin><Admin section="export" /></ProtectedRoute>} />
              <Route path="/admin/import" element={<ProtectedRoute admin><Admin section="import" /></ProtectedRoute>} />
              <Route path="/admin/import-bulk" element={<ProtectedRoute admin><ImportBulkSubscriptions /></ProtectedRoute>} />
              <Route path="/admin/import-text" element={<ProtectedRoute admin><ImportSubscriptionText /></ProtectedRoute>} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}

export default App;
