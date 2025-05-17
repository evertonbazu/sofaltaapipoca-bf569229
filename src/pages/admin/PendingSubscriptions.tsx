
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PendingSubscriptionList from '@/components/admin/PendingSubscriptionList';

const PendingSubscriptions = () => {
  return (
    <AdminLayout title="Assinaturas Pendentes">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Lista de Assinaturas Pendentes</h2>
        <p className="text-sm text-gray-500">
          Visualize e aprove as assinaturas pendentes de aprovação.
        </p>
      </div>

      <PendingSubscriptionList />
    </AdminLayout>
  );
};

export default PendingSubscriptions;
