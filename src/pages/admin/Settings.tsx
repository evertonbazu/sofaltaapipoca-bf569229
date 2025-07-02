import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { GeneralSettings } from '@/components/admin/settings/GeneralSettings';
import { AppearanceSettings } from '@/components/admin/settings/AppearanceSettings';
import { IntegrationsSettings } from '@/components/admin/settings/IntegrationsSettings';
import { AdvancedSettings } from '@/components/admin/settings/AdvancedSettings';
import { SecuritySettings } from '@/components/admin/settings/SecuritySettings';
import { SystemSettings } from '@/components/admin/settings/SystemSettings';

const Settings = () => {
  return (
    <AdminLayout title="Configurações">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        
        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        
        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="advanced">
          <AdvancedSettings />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Settings;
