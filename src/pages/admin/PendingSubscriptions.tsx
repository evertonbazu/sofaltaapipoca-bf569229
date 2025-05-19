
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PendingSubscriptionList from '@/components/admin/PendingSubscriptionList';
import { Button } from '@/components/ui/button';

const PendingSubscriptions = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AdminLayout title="Assinaturas Pendentes">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Lista de Assinaturas Pendentes</h2>
        <p className="text-sm text-gray-500">
          Visualize e aprove as assinaturas pendentes de aprovação. Depois de aprovadas, elas serão enviadas automaticamente para o grupo do Telegram.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="mt-2"
        >
          Atualizar Lista
        </Button>
      </div>

      <PendingSubscriptionList key={refreshKey} />
    </AdminLayout>
  );
};

export default PendingSubscriptions;
