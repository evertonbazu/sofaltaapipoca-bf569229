
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import ContactMessages from './components/admin/ContactMessages';
import NewSubscription from './pages/NewSubscription';
import Index from './pages/Index';
import UserProfile from './components/admin/UserProfile';
import Contact from './pages/Contact';
import Navbar from './components/ui/Navbar';

// Version information
export const APP_VERSION = '1.5.1'; // Updated version with fixed login flow

// Create a separate component for the authenticated routes
const AppRoutes = () => {
  const [loading, setLoading] = useState(true);

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
    <>
      <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/new" element={<NewSubscription />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<Index />} />
        <Route
          path="/admin/*"
          element={<Admin />}
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
          <Route path="messages" element={<ContactMessages />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

// Main App component that only provides the AuthProvider
const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <AppRoutes />
            </div>
          </div>
        </Router>
      </AuthProvider>
      <Toaster />
    </>
  );
};

export default App;
