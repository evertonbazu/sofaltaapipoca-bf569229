
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PendingSubscriptionData } from '@/types/subscriptionTypes';

// Schema para validação do formulário
const formSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }),
  price: z.string().min(1, { message: "O preço é obrigatório" }),
  paymentMethod: z.string().min(1, { message: "O método de pagamento é obrigatório" }),
  customPaymentMethod: z.string().optional(),
  status: z.string().min(1, { message: "O status é obrigatório" }),
  access: z.string().min(1, { message: "O acesso é obrigatório" }),
  whatsappNumber: z.string().min(1, { message: "O número do WhatsApp é obrigatório" }),
  telegramUsername: z.string().min(1, { message: "O usuário do Telegram é obrigatório" }),
  pixKey: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SubmitSubscriptionForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  
  // Verificar se o usuário está logado
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    
    checkUser();
  }, []);
  
  // Configurar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: "",
      paymentMethod: "PIX (Mensal)",
      customPaymentMethod: "",
      status: "Assinado",
      access: "",
      whatsappNumber: "",
      telegramUsername: "",
      pixKey: "",
    },
  });
  
  // Manipular mudança de método de pagamento
  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
    form.setValue("paymentMethod", value);
    
    if (value !== "OUTRA FORMA") {
      form.setValue("customPaymentMethod", "");
    }
  };
  
  // Manipulador para envio do formulário
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Processar método de pagamento personalizado
      const finalPaymentMethod = data.paymentMethod === "OUTRA FORMA" ? data.customPaymentMethod : data.paymentMethod;
      
      // Gerar código único
      const { data: code, error: codeError } = await supabase.rpc('generate_subscription_code');
      if (codeError) throw codeError;
      
      // Criar objeto da assinatura pendente
      const pendingSubscription: PendingSubscriptionData = {
        title: data.title.toUpperCase(),
        price: data.price,
        paymentMethod: finalPaymentMethod,
        status: data.status,
        access: data.access.toUpperCase(),
        headerColor: 'bg-blue-600',
        priceColor: 'text-blue-600',
        whatsappNumber: data.whatsappNumber,
        telegramUsername: data.telegramUsername,
        addedDate: new Date().toLocaleDateString('pt-BR'),
        code: code,
        userId: userId,
        statusApproval: 'pending',
        pixKey: data.pixKey,
      };
      
      // Enviar para o banco de dados
      const { error } = await supabase
        .from('pending_subscriptions')
        .insert({
          title: pendingSubscription.title,
          price: pendingSubscription.price,
          payment_method: pendingSubscription.paymentMethod,
          status: pendingSubscription.status,
          access: pendingSubscription.access,
          header_color: pendingSubscription.headerColor,
          price_color: pendingSubscription.priceColor,
          whatsapp_number: pendingSubscription.whatsappNumber,
          telegram_username: pendingSubscription.telegramUsername,
          added_date: pendingSubscription.addedDate,
          code: pendingSubscription.code,
          user_id: pendingSubscription.userId,
          status_approval: pendingSubscription.statusApproval,
          pix_key: pendingSubscription.pixKey,
        });
      
      if (error) throw error;
      
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de anúncio foi enviada com sucesso e será analisada pelos administradores.",
      });
      
      // Limpar formulário
      form.reset();
      
      // Se o usuário estiver logado, redirecionar para o perfil
      if (userId) {
        navigate('/profile');
      }
      
    } catch (error) {
      console.error('Erro ao enviar solicitação de anúncio:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua solicitação. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Envie seu anúncio</CardTitle>
        <CardDescription>
          Preencha o formulário abaixo para enviar seu anúncio para aprovação dos administradores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="NETFLIX PREMIUM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Preço */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 19,90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Método de Pagamento */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      onValueChange={handlePaymentMethodChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX (Mensal)">PIX (Mensal)</SelectItem>
                        <SelectItem value="PIX (Anual)">PIX (Anual)</SelectItem>
                        <SelectItem value="OUTRA FORMA">OUTRA FORMA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Método de pagamento personalizado */}
              {selectedPaymentMethod === "OUTRA FORMA" && (
                <FormField
                  control={form.control}
                  name="customPaymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento Personalizado</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira um método de pagamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Chave PIX */}
              <FormField
                control={form.control}
                name="pixKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave PIX</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua chave PIX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Assinado">Assinado</SelectItem>
                        <SelectItem value="Aguardando Membros">Aguardando Membros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Acesso */}
              <FormField
                control={form.control}
                name="access"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Envio</FormLabel>
                    <FormControl>
                      <Input placeholder="LOGIN E SENHA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* WhatsApp */}
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="5511999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Telegram */}
              <FormField
                control={form.control}
                name="telegramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário do Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="usuariotelegram" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar solicitação'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubmitSubscriptionForm;
