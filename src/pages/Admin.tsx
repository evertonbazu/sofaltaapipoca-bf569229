
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SubscriptionList from '@/components/admin/SubscriptionList';
import PendingSubscriptions from '@/components/admin/PendingSubscriptions';
import SubscriptionForm from '@/components/admin/SubscriptionForm';
import ContactMessages from '@/components/admin/ContactMessages';
import UserManagement from '@/components/admin/UserManagement';
import UserProfile from '@/components/admin/UserProfile';
import ExportSubscriptions from '@/components/admin/ExportSubscriptions';
import ExportSubscriptionsTxt from '@/components/admin/ExportSubscriptionsTxt';
import ImportSubscriptions from '@/components/admin/ImportSubscriptions';

interface AdminProps {
  section?: string;
  action?: string;
}

interface SubscriptionFormComponentProps {
  id?: string;
  initialData?: any;
  isPending?: boolean;
}

// Create a wrapper component for SubscriptionForm to handle the props
const SubscriptionFormWrapper: React.FC<SubscriptionFormComponentProps> = ({ id, initialData, isPending }) => {
  return <SubscriptionForm id={id} initialData={initialData} isPending={isPending} />;
};

const Admin: React.FC<AdminProps> = ({ section, action }) => {
  const location = useLocation();
  const params = useParams();
  const [currentSection, setCurrentSection] = useState(section || 'dashboard');
  const [currentAction, setCurrentAction] = useState(action || null);
  
  // Extract subscription data if passed in location state (from pending subscription approval)
  const subscriptionData = location.state?.subscriptionData || null;
  const isPending = location.state?.isPending || false;
  
  // Update current section and action when the props change
  useEffect(() => {
    if (section) setCurrentSection(section);
    if (action) setCurrentAction(action);
  }, [section, action]);

  // Render the appropriate content based on the current section
  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard />;
      
      case 'subscriptions':
        if (currentAction === 'new') {
          return <SubscriptionForm />;
        } else if (currentAction === 'edit' && params.id) {
          return <SubscriptionFormWrapper id={params.id} initialData={subscriptionData} isPending={isPending} />;
        }
        return <SubscriptionList />;
      
      case 'pending-subscriptions':
        return <PendingSubscriptions />;
      
      case 'messages':
        return <ContactMessages />;
      
      case 'users':
        return <UserManagement />;
      
      case 'profile':
        return <UserProfile />;
      
      case 'export':
        return <ExportSubscriptions />;
        
      case 'export-txt':
        return <ExportSubscriptionsTxt />;
      
      case 'import':
        return <ImportSubscriptions />;
      
      default:
        return <AdminDashboard />;
    }
  };

  // Convert section name to title format
  const sectionTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Dashboard';
      case 'subscriptions': 
        if (currentAction === 'new') return 'Novo Anúncio';
        else if (currentAction === 'edit') return 'Editar Anúncio';
        else return 'Anúncios';
      case 'pending-subscriptions': return 'Anúncios Pendentes';
      case 'messages': return 'Mensagens';
      case 'users': return 'Usuários';
      case 'profile': return 'Perfil';
      case 'export': return 'Exportar Dados';
      case 'export-txt': return 'Exportar para TXT';
      case 'import': return 'Importar Dados';
      default: return 'Dashboard';
    }
  };

  return (
    <AdminLayout title={sectionTitle()}>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
