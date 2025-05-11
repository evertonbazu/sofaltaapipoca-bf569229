
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionForm from '@/components/admin/SubscriptionForm';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData, PendingSubscriptionData } from '@/types/subscriptionTypes';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SubscriptionEditor = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  const isEditing = !!id;
  const isPendingEdit = source === 'pending';
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (id) {
        setIsLoading(true);
        try {
          // Select from the appropriate table based on source
          const tableName = isPendingEdit ? 'pending_subscriptions' : 'subscriptions';
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data) {
            // Map the database column names to our frontend property names
            setSubscriptionData({
              id: data.id,
              title: data.title,
              price: data.price,
              paymentMethod: data.payment_method,
              status: data.status,
              access: data.access,
              headerColor: data.header_color,
              priceColor: data.price_color,
              whatsappNumber: data.whatsapp_number,
              telegramUsername: data.telegram_username,
              icon: data.icon,
              addedDate: data.added_date,
              featured: data.featured,
              code: data.code,
              pixKey: data.pix_key,
              userId: data.user_id
            });
          }
        } catch (error) {
          console.error('Erro ao buscar assinatura:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os detalhes da assinatura.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [id, isPendingEdit, toast]);

  return (
    <AdminLayout title={isEditing ? "Editar Assinatura" : "Nova Assinatura"}>
      <div className="mb-4">
        <h2 className="text-lg font-medium">
          {isEditing ? "Editar Detalhes da Assinatura" : "Adicionar Nova Assinatura"}
        </h2>
        <p className="text-sm text-gray-500">
          {isEditing 
            ? "Atualize as informações da assinatura abaixo." 
            : "Preencha o formulário para adicionar uma nova assinatura."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando dados da assinatura...</span>
        </div>
      ) : (
        <SubscriptionForm 
          initialData={subscriptionData} 
          isPendingEdit={isPendingEdit}
        />
      )}
    </AdminLayout>
  );
};

export default SubscriptionEditor;
