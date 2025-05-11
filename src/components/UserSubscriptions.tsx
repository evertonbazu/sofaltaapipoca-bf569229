
import React, { useState, useEffect } from 'react';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';

interface UserSubscriptionsProps {
  userId?: string;
}

const UserSubscriptions: React.FC<UserSubscriptionsProps> = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;
        
        if (data) {
          const formattedSubscriptions: SubscriptionData[] = data.map(sub => ({
            id: sub.id,
            title: sub.title,
            price: sub.price,
            paymentMethod: sub.payment_method,
            status: sub.status,
            access: sub.access,
            headerColor: sub.header_color,
            priceColor: sub.price_color,
            whatsappNumber: sub.whatsapp_number,
            telegramUsername: sub.telegram_username,
            icon: sub.icon,
            addedDate: sub.added_date,
            featured: sub.featured || false
          }));
          
          setSubscriptions(formattedSubscriptions);
        }
      } catch (error) {
        console.error('Erro ao buscar assinaturas do usuário:', error);
        toast({
          title: "Erro ao carregar assinaturas",
          description: "Não foi possível carregar suas assinaturas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSubscriptions();
  }, [userId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Faça login para ver suas assinaturas.</p>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Você ainda não tem assinaturas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </div>
  );
};

export default UserSubscriptions;
