import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionData } from "@/types/subscriptionTypes";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionFormCore from '@/components/forms/SubscriptionFormCore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionData | null;
  onSuccess: () => void;
}

const SubscriptionEditDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!subscription || !authState.user) return;

    setIsSubmitting(true);

    try {
      // Processar título personalizado
      const finalTitle = formData.title === "Personalizado" ? formData.customTitle : formData.title;

      // Processar método de pagamento personalizado
      const finalPaymentMethod = formData.paymentMethod === "OUTRA FORMA" ? formData.customPaymentMethod : formData.paymentMethod;

      // Processar tipo de acesso personalizado
      const finalAccess = formData.access === "OUTRO" ? formData.customAccess : formData.access;

      const { error } = await supabase
        .from('subscription_modifications')
        .insert({
          original_subscription_id: subscription.id,
          user_id: authState.user.id,
          title: finalTitle,
          price: formData.price,
          payment_method: finalPaymentMethod,
          status: formData.status,
          access: finalAccess.toUpperCase(),
          header_color: subscription.headerColor,
          price_color: subscription.priceColor,
          whatsapp_number: formData.whatsappNumber,
          telegram_username: formData.telegramUsername,
          icon: subscription.icon,
          pix_key: formData.pixKey,
          category: subscription.category,
          modification_reason: formData.modificationReason,
          status_approval: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Modificação enviada",
        description: "Sua solicitação de modificação foi enviada para aprovação do administrador.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao enviar modificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a modificação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!subscription) return {};
    
    return {
      title: subscription.title || '',
      price: subscription.price || '',
      paymentMethod: subscription.paymentMethod || '',
      status: subscription.status || '',
      access: subscription.access || '',
      whatsappNumber: subscription.whatsappNumber || '',
      telegramUsername: subscription.telegramUsername || '',
      pixKey: subscription.pixKey || '',
      category: subscription.category || '',
      modificationReason: ''
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modificar Assinatura</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias e envie para aprovação do administrador.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <SubscriptionFormCore
            mode="edit"
            initialData={getInitialData()}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            showFullNameField={false}
            showModificationReason={true}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionEditDialog;