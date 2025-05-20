
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PendingSubscriptionList from '@/components/admin/PendingSubscriptionList';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Página para gerenciar assinaturas pendentes de aprovação
 * @version 3.1.2
 */
const PendingSubscriptions = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleCheckExpired = async () => {
    try {
      toast({
        title: "Verificando assinaturas expiradas",
        description: "Aguarde enquanto verificamos as assinaturas expiradas...",
      });
      
      const { data, error } = await supabase.functions.invoke('check-expired-subscriptions');
      
      if (error) {
        console.error('Erro ao verificar assinaturas expiradas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar as assinaturas expiradas.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Verificação concluída",
        description: "As assinaturas expiradas foram verificadas com sucesso.",
      });
      
      // Atualizar a lista após verificar
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao verificar assinaturas expiradas:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar as assinaturas expiradas.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Assinaturas Pendentes">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Lista de Assinaturas Pendentes</h2>
        <p className="text-sm text-gray-500">
          Visualize e aprove as assinaturas pendentes de aprovação. Depois de aprovadas, elas serão enviadas automaticamente para o grupo do Telegram.
        </p>
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            Atualizar Lista
          </Button>
          <Button 
            variant="secondary"
            onClick={handleCheckExpired}
          >
            Verificar Assinaturas Expiradas
          </Button>
        </div>
      </div>

      <PendingSubscriptionList key={refreshKey} />
    </AdminLayout>
  );
};

export default PendingSubscriptions;
