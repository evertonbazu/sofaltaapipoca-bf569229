import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { SubscriptionData } from "@/types/subscriptionTypes";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    paymentMethod: '',
    status: '',
    access: '',
    whatsappNumber: '',
    telegramUsername: '',
    pixKey: '',
    modificationReason: '',
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        title: subscription.title || '',
        price: subscription.price || '',
        paymentMethod: subscription.paymentMethod || '',
        status: subscription.status || '',
        access: subscription.access || '',
        whatsappNumber: subscription.whatsappNumber || '',
        telegramUsername: subscription.telegramUsername || '',
        pixKey: subscription.pixKey || '',
        modificationReason: '',
      });
    }
  }, [subscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription || !authState.user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('subscription_modifications')
        .insert({
          original_subscription_id: subscription.id,
          user_id: authState.user.id,
          title: formData.title,
          price: formData.price,
          payment_method: formData.paymentMethod,
          status: formData.status,
          access: formData.access,
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modificar Assinatura</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias e envie para aprovação do administrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título da Assinatura</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="R$ 20,00"
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleChange('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assinado">Assinado</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Renovando">Renovando</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="access">Tipo de Envio</Label>
              <Select value={formData.access} onValueChange={(value) => handleChange('access', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de envio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOGIN E SENHA">LOGIN E SENHA</SelectItem>
                  <SelectItem value="CONVITE">CONVITE</SelectItem>
                  <SelectItem value="ATIVAÇÃO">ATIVAÇÃO</SelectItem>
                  <SelectItem value="OUTRO">OUTRO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="whatsappNumber">WhatsApp</Label>
              <Input
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="5511999999999"
                required
              />
            </div>

            <div>
              <Label htmlFor="telegramUsername">Telegram</Label>
              <Input
                id="telegramUsername"
                value={formData.telegramUsername}
                onChange={(e) => handleChange('telegramUsername', e.target.value)}
                placeholder="@username"
                required
              />
            </div>

            <div>
              <Label htmlFor="pixKey">Chave PIX (opcional)</Label>
              <Input
                id="pixKey"
                value={formData.pixKey}
                onChange={(e) => handleChange('pixKey', e.target.value)}
                placeholder="sua@chavepix.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="modificationReason">Motivo da Modificação</Label>
            <Textarea
              id="modificationReason"
              value={formData.modificationReason}
              onChange={(e) => handleChange('modificationReason', e.target.value)}
              placeholder="Descreva o motivo da modificação..."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Modificação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionEditDialog;