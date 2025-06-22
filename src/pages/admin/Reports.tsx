
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionReport from '@/components/admin/SubscriptionReport';

/**
 * Página de relatórios administrativos
 * @version 3.9.0
 */
const Reports: React.FC = () => {
  return (
    <AdminLayout title="Relatórios">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-2">Relatórios do Sistema</h2>
          <p className="text-sm text-gray-500 mb-6">
            Gere e baixe relatórios sobre as assinaturas disponíveis no site.
          </p>
        </div>
        
        <SubscriptionReport />
      </div>
    </AdminLayout>
  );
};

export default Reports;
