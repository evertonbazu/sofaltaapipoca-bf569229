
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Trash2, Clock, AlertCircle } from 'lucide-react';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { formatDateBR, isExpirationImminent } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SubscriptionsListProps {
  subscriptions: SubscriptionData[];
  onDelete: (id: string) => Promise<void>;
  actionInProgress: string | null;
}

const SubscriptionsList: React.FC<SubscriptionsListProps> = ({ 
  subscriptions, 
  onDelete, 
  actionInProgress 
}) => {
  const navigate = useNavigate();
  
  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Você ainda não possui assinaturas aprovadas.</p>
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
      {subscriptions.map((subscription) => {
        const daysRemaining = subscription.daysRemaining || 0;
        const isExpiringSoon = isExpirationImminent(daysRemaining);
        
        return (
        <Card key={subscription.id} className={`${isExpiringSoon ? 'border-orange-400 border-2' : ''}`}>
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
              <p><strong>Código:</strong> {subscription.code}</p>
              
              {subscription.expirationDate && (
                <div className={`flex items-center mt-3 ${daysRemaining <= 3 ? 'text-red-500' : 'text-blue-600'}`}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="font-medium">
                    {daysRemaining > 0 
                      ? `Expira em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}` 
                      : 'Expirou hoje!'}
                  </span>
                </div>
              )}
              
              {isExpiringSoon && (
                <div className="flex items-center mt-1 text-orange-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm">Esta assinatura expirará em breve</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={!!actionInProgress}
              onClick={() => onDelete(subscription.id || '')}
            >
              {actionInProgress === subscription.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Assinatura
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )})}
    </div>
  );
};

export default SubscriptionsList;
