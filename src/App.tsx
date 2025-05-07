
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

const HomePage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-6">Só Falta a Pipoca</h1>
    <p className="text-lg mb-4">Bem-vindo à plataforma de anúncios de assinaturas.</p>
  </div>
);

const ProfilePage = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-6">Perfil do Usuário</h1>
    <p className="text-lg mb-4">Página de perfil em desenvolvimento.</p>
  </div>
);

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
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/new" element={<NewSubscription />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<HomePage />} />
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
        </Router>
      </AuthProvider>
      <Toaster />
    </>
  );
};

export default App;
