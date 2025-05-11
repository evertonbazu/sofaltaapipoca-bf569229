
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionList from '@/components/admin/SubscriptionList';

const Subscriptions = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Gerenciar Assinaturas">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium">Lista de Assinaturas</h2>
          <p className="text-sm text-gray-500">
            Visualize, edite ou exclua assinaturas existentes.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/subscriptions/new')} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Nova Assinatura
        </Button>
      </div>

      <SubscriptionList />
    </AdminLayout>
  );
};

export default Subscriptions;
