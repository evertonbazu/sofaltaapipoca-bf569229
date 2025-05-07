import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from '@/hooks/use-toast';
import { useAuth } from './context/AuthContext';
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
import Home from './pages/Home';
import Profile from './pages/Profile';

const App = () => {
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/new" element={<NewSubscription />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/admin"
              element={
                authState?.isAdmin ? (
                  <Admin />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="subscriptions" element={<SubscriptionList />} />
              <Route path="subscriptions/new" element={<SubscriptionForm />} />
              <Route path="subscriptions/edit/:id" element={<SubscriptionForm />} />
              <Route path="pending" element={<PendingSubscriptions />} />
              <Route path="export" element={<ExportSubscriptionsTxt />} />
              <Route path="export-all" element={<ExportSubscriptions />} />
              <Route path="import" element={<ImportSubscriptions />} /> {/* Updated to ImportSubscriptions */}
              <Route path="users" element={<UserManagement />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
