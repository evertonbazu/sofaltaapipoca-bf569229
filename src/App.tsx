
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import AdminDashboard from './components/admin/AdminDashboard';
import SubscriptionList from './components/admin/SubscriptionList';
import SubscriptionForm from './components/admin/SubscriptionForm';
import PendingSubscriptions from './components/admin/PendingSubscriptions';
import ExportSubscriptionsTxt from './components/admin/ExportSubscriptionsTxt';
import ExportSubscriptions from './components/admin/ExportSubscriptions';
import ImportSubscriptions from './components/admin/ImportSubscriptions';
import UserManagement from './components/admin/UserManagement';
import NewSubscription from './pages/NewSubscription';
import Index from './pages/Index';
import UserProfile from './components/admin/UserProfile';
import Contact from './pages/Contact';

// Create a separate component for the authenticated routes
const AppRoutes = () => {
  const [loading, setLoading] = useState(true);
  const { authState, isAdmin } = useAuth();

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/new" element={<NewSubscription />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/" element={<Index />} />
      <Route
        path="/admin"
        element={
          authState?.user?.role === 'admin' ? (
            <Admin />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="subscriptions" element={<SubscriptionList />} />
        <Route path="subscriptions/new" element={<SubscriptionForm />} />
        <Route path="subscriptions/edit/:id" element={<SubscriptionForm />} />
        <Route path="pending" element={<PendingSubscriptions />} />
        <Route path="export" element={<ExportSubscriptionsTxt />} />
        <Route path="export-all" element={<ExportSubscriptions />} />
        <Route path="import" element={<ImportSubscriptions />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
};

// Main App component that only provides the AuthProvider
const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
      <Toaster />
    </>
  );
};

export default App;
