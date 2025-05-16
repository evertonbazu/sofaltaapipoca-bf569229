import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import SubmitSubscription from './pages/SubmitSubscription';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminEditSubscription from './pages/AdminEditSubscription';
import AdminLayout from '@/components/admin/AdminLayout';
import ContactForm from "./pages/form_contato";

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
        <Route path="/admin" element={<AdminLayout><Admin /></AdminLayout>} />
        <Route path="/admin/subscriptions" element={<AdminLayout><AdminSubscriptions /></AdminLayout>} />
        <Route path="/admin/subscriptions/edit/:id" element={<AdminLayout><AdminEditSubscription /></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
