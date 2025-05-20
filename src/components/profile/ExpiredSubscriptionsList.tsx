
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Send } from 'lucide-react';
import { ExpiredSubscriptionData } from '@/types/subscriptionTypes';
import { formatDateBR } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ExpiredSubscriptionsListProps {
  subscriptions: ExpiredSubscriptionData[];
  onResubmit: (subscription: ExpiredSubscriptionData) => Promise<void>;
  actionInProgress: string | null;
}

const ExpiredSubscriptionsList: React.FC<ExpiredSubscriptionsListProps> = ({ 
  subscriptions, 
  onResubmit, 
  actionInProgress 
}) => {
  const navigate = useNavigate();
  
  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Você não possui assinaturas expiradas ou excluídas.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Voltar para a página inicial
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <CardTitle>{subscription.title}</CardTitle>
            <CardDescription>
              {subscription.price} - {subscription.paymentMethod}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Envio:</strong> {subscription.access}</p>
              <p><strong>Status:</strong> {subscription.status}</p>
              <p><strong>Adicionado em:</strong> {subscription.addedDate ? formatDateBR(new Date(subscription.addedDate)) : ''}</p>
              <p><strong>Expirado em:</strong> {formatDateBR(new Date(subscription.expiredAt))}</p>
              <p><strong>Motivo:</strong> {subscription.expiryReason}</p>
              <p><strong>Código:</strong> {subscription.code}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="default" 
              className="w-full"
              disabled={!!actionInProgress}
              onClick={() => onResubmit(subscription)}
            >
              {actionInProgress === subscription.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Novamente
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ExpiredSubscriptionsList;
