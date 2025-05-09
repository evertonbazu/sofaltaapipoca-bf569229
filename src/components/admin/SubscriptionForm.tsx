import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Subscription } from '@/types/subscriptionTypes';
import { generateCode } from '@/utils/importSubscriptions';

// Define form schema
const subscriptionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
  payment_method: z.string().min(1, "Método de pagamento é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  access: z.string().min(1, "Método de acesso é obrigatório"),
  telegram_username: z.string().optional(),
  whatsapp_number: z.string().optional(),
  header_color: z.string().min(1, "Cor do cabeçalho é obrigatória"),
  price_color: z.string().min(1, "Cor do preço é obrigatória"),
  code: z.string().min(1, "Código é obrigatório"),
});

type FormValues = z.infer<typeof subscriptionSchema>;

const SubscriptionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Check if we're dealing with a pending subscription
  const isPendingSubscription = location.state?.isPending || false;
  
  // Get the subscription data from location state if available
  const subscriptionFromState = location.state?.subscriptionData;

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      title: "",
      price: "",
      payment_method: "PIX",
      status: "disponível",
      access: "LOGIN E SENHA",
      telegram_username: "",
      whatsapp_number: "",
      header_color: "#3b82f6", // Default blue
      price_color: "#10b981", // Default green
      code: generateCode(),
    },
  });

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  useEffect(() => {
    // If we have subscription data from location state, use it
    if (subscriptionFromState) {
      form.reset({
        title: subscriptionFromState.title || "",
        price: subscriptionFromState.price || "",
        payment_method: subscriptionFromState.payment_method || "PIX",
        status: subscriptionFromState.status || "disponível",
        access: subscriptionFromState.access || "LOGIN E SENHA",
        telegram_username: subscriptionFromState.telegram_username || "",
        whatsapp_number: subscriptionFromState.whatsapp_number || "",
        header_color: subscriptionFromState.header_color || "#3b82f6",
        price_color: subscriptionFromState.price_color || "#10b981",
        code: subscriptionFromState.code || generateCode(),
      });
    }
  }, [subscriptionFromState]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      let data;
      let error;
      
      // Select from the appropriate table based on whether it's a pending subscription
      if (isPendingSubscription) {
        const response = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('id', id)
          .single();
          
        data = response.data;
        error = response.error;
      } else {
        const response = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', id)
          .single();
          
        data = response.data;
        error = response.error;
      }

      if (error) throw error;
      if (data) {
        form.reset({
          title: data.title || "",
          price: data.price || "",
          payment_method: data.payment_method || "PIX",
          status: data.status || "disponível",
          access: data.access || "LOGIN E SENHA",
          telegram_username: data.telegram_username || "",
          whatsapp_number: data.whatsapp_number || "",
          header_color: data.header_color || "#3b82f6",
          price_color: data.price_color || "#10b981",
          code: data.code || generateCode(),
        });
      }
    } catch (error: any) {
      console.error("Error fetching subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncio",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (id) {
        // Update existing subscription
        if (isPendingSubscription) {
          const { error } = await supabase
            .from('pending_subscriptions')
            .update(values)
            .eq('id', id);
            
          if (error) throw error;
          
          toast({
            title: "Anúncio pendente atualizado",
            description: "O anúncio pendente foi atualizado com sucesso.",
          });
        } else {
          const { error } = await supabase
            .from('subscriptions')
            .update(values)
            .eq('id', id);
            
          if (error) throw error;
          
          toast({
            title: "Anúncio atualizado",
            description: "O anúncio foi atualizado com sucesso.",
          });
        }
      } else {
        // Create new subscription - do NOT include user_id field
        const newSubscription = {
          ...values,  // Include all form values
          added_date: new Date().toLocaleDateString('pt-BR'),
          featured: false
        };
        
        const { error } = await supabase
          .from('subscriptions')
          .insert(newSubscription);
          
        if (error) {
          throw error;
        }
        
        // Log the successful operation
        const { logError } = await import('@/data/subscriptions');
        await logError('Anúncio criado com sucesso', 'SubscriptionForm.onSubmit');
        
        toast({
          title: "Anúncio criado",
          description: "O anúncio foi criado com sucesso.",
        });
      }
      
      // Navigate back to subscription list
      navigate('/admin/subscriptions');
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      
      // Log the error to our error logging system
      try {
        const { logError } = await import('@/data/subscriptions');
        await logError(
          `Error saving subscription: ${error.message}`, 
          'SubscriptionForm.onSubmit', 
          error.code, 
          error.stack
        );
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao salvar anúncio",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {id ? 'Editar Anúncio' : 'Novo Anúncio'}
        </h1>
      </div>

      {loading && !form.formState.isSubmitting ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do serviço" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: R$ 10,00 - PIX (Mensal)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Transferência">Transferência</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disponível">Disponível</SelectItem>
                        <SelectItem value="indisponível">Indisponível</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="access"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Acesso</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de acesso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOGIN E SENHA">Login e Senha</SelectItem>
                        <SelectItem value="CONVITE POR E-MAIL">Convite por E-mail</SelectItem>
                        <SelectItem value="ATIVAÇÃO POR CÓDIGO">Ativação por Código</SelectItem>
                        <SelectItem value="ATIVAÇÃO">Ativação</SelectItem>
                        <SelectItem value="CONVITE">Convite</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telegram_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário do Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: @usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 5511912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="header_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor do Cabeçalho</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input type="color" {...field} className="w-12 h-8" />
                      </FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        className="flex-1"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor do Preço</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input type="color" {...field} className="w-12 h-8" />
                      </FormControl>
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        className="flex-1"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => navigate('/admin/subscriptions')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || loading}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                    Salvando...
                  </span>
                ) : id ? 'Atualizar Anúncio' : 'Criar Anúncio'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default SubscriptionForm;
