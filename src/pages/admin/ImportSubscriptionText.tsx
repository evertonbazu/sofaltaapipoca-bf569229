
import React from 'react';
import AdminLayout from "@/components/admin/AdminLayout";
import ImportSubscriptionText from "@/components/admin/ImportSubscriptionText";

const ImportSubscriptionTextPage: React.FC = () => {
  return (
    <AdminLayout title="Importar Anúncios de Texto">
      <ImportSubscriptionText />
    </AdminLayout>
  );
};

export default ImportSubscriptionTextPage;
