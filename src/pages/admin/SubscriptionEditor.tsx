import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionForm from '@/components/admin/SubscriptionForm';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Página para editar assinaturas no painel administrativo
 * @version 3.7.0
 */
const SubscriptionEditor = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('subscriptions')
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
              fullName: data.full_name,
              title: data.title,
              customTitle: data.custom_title,
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
              userId: data.user_id,
              category: data.category,
              isMemberSubmission: data.user_id ? true : false,
              visible: data.visible
            });
          }
        } catch (error) {
          console.error('Erro ao buscar assinatura:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os detalhes da assinatura.",
            variant: "destructive",
          });
          navigate('/admin/subscriptions');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [id, navigate, toast]);

  // Generate dynamic title based on subscription data
  const getPageTitle = () => {
    if (!isEditing) return "Nova Assinatura";
    
    if (subscriptionData) {
      // If there's a custom title, show it; otherwise show the regular title
      const displayTitle = subscriptionData.customTitle || subscriptionData.title;
      return `Editar: ${displayTitle}`;
    }
    
    return "Editar Assinatura";
  };

  const getPageDescription = () => {
    if (!isEditing) return "Preencha o formulário para adicionar uma nova assinatura.";
    
    if (subscriptionData) {
      const displayTitle = subscriptionData.customTitle || subscriptionData.title;
      return `Atualize as informações da assinatura "${displayTitle}" abaixo.`;
    }
    
    return "Atualize as informações da assinatura abaixo.";
  };

  return (
    <AdminLayout title={getPageTitle()}>
      <div className="mb-4">
        <h2 className="text-lg font-medium">
          {getPageTitle()}
        </h2>
        <p className="text-sm text-gray-500">
          {getPageDescription()}
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
          isMemberSubmission={subscriptionData?.isMemberSubmission}
        />
      )}
    </AdminLayout>
  );
};

export default SubscriptionEditor;
