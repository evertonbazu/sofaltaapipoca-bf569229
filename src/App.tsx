
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import SubmitSubscription from './pages/SubmitSubscription';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import Subscriptions from './pages/admin/Subscriptions';
import SubscriptionEditor from './pages/admin/SubscriptionEditor';
import AdminLayout from '@/components/admin/AdminLayout';
import ContactForm from "./pages/form_contato";
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/submit-subscription" element={<SubmitSubscription />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/form_contato" element={<ContactForm />} />
        
        {/* Admin Routes - Protected by AdminLayout */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/subscriptions" element={<AdminLayout><Subscriptions /></AdminLayout>} />
        <Route path="/admin/subscriptions/edit/:id" element={<AdminLayout><SubscriptionEditor /></AdminLayout>} />
        <Route path="/admin/subscriptions/new" element={<AdminLayout><SubscriptionEditor /></AdminLayout>} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
