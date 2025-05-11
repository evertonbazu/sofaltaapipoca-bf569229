
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { addSubscription } from '@/services/subscription-service';
import { supabase } from '@/integrations/supabase/client';

// Esquema de validação
const formSchema = z.object({
  title: z.string().min(1, { message: 'O título é obrigatório' }),
  price: z.string().min(1, { message: 'O preço é obrigatório' }),
  paymentMethod: z.string().min(1, { message: 'O método de pagamento é obrigatório' }),
  status: z.string().min(1, { message: 'O status é obrigatório' }),
  access: z.string().min(1, { message: 'O tipo de acesso é obrigatório' }),
  telegramUsername: z.string().min(1, { message: 'O usuário do Telegram é obrigatório' }),
  whatsappNumber: z.string().min(1, { message: 'O número do WhatsApp é obrigatório' }),
  pixKey: z.string().min(1, { message: 'A chave PIX é obrigatória' }),
  headerColor: z.string().default('bg-blue-600'),
  priceColor: z.string().default('text-blue-600'),
  icon: z.string().nullable().optional(),
});

// Tipo inferido do esquema
type FormValues = z.infer<typeof formSchema>;

// Componente principal
const SubmitSubscriptionForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<{label: string, value: string}[]>([]);
  const [accessOptions, setAccessOptions] = useState<{label: string, value: string}[]>([]);
  const [statusOptions, setStatusOptions] = useState<{label: string, value: string}[]>([]);
  
  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      price: '',
      paymentMethod: '',
      status: '',
      access: '',
      telegramUsername: '',
      whatsappNumber: '',
      pixKey: '',
      headerColor: 'bg-blue-600',
      priceColor: 'text-blue-600',
      icon: null,
    },
  });

  // Buscar opções do formulário
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('form_options')
          .select('*')
          .eq('active', true)
          .order('position', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setPaymentOptions(
            data
              .filter(option => option.type === 'payment_method')
              .map(option => ({ label: option.label, value: option.value }))
          );
          
          setAccessOptions(
            data
              .filter(option => option.type === 'access_method')
              .map(option => ({ label: option.label, value: option.value }))
          );
          
          setStatusOptions(
            data
              .filter(option => option.type === 'status')
              .map(option => ({ label: option.label, value: option.value }))
          );
        }
      } catch (error) {
        console.error('Erro ao buscar opções do formulário:', error);
      }
    };
    
    fetchFormOptions();
  }, []);

  // Formatador de moeda (Real brasileiro)
  const formatCurrency = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para centavos e formata como moeda
    const amount = parseInt(numericValue, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  // Manipulador para envio do formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Adicionar asterisco no início do título para marcar anúncios enviados pelos usuários
      const submittedValues = {
        title: `* ${values.title}`,
        price: values.price,
        paymentMethod: values.paymentMethod,
        status: values.status,
        access: values.access,
        headerColor: values.headerColor,
        priceColor: values.priceColor,
        whatsappNumber: values.whatsappNumber,
        telegramUsername: values.telegramUsername,
        pixKey: values.pixKey,
        // Publicar diretamente sem necessidade de aprovação
        featured: false,
        addedDate: new Date().toLocaleDateString('pt-BR')
      };
      
      await addSubscription(submittedValues);
      
      toast({
        title: 'Assinatura enviada',
        description: 'Sua assinatura foi enviada com sucesso!',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao enviar assinatura:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um erro ao enviar sua assinatura. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: NETFLIX PREMIUM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Preço */}
          <FormField
            control={form.control}
            name="price"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="R$ 0,00" 
                    {...field}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      e.target.value = formatted;
                      onChange(e);
                    }}
                  />
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método de pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Método de Acesso */}
          <FormField
            control={form.control}
            name="access"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Acesso</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método de acesso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accessOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
          
          {/* Usuário do Telegram */}
          <FormField
            control={form.control}
            name="telegramUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuário do Telegram</FormLabel>
                <FormControl>
                  <Input placeholder="@seuUsuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Número do WhatsApp */}
          <FormField
            control={form.control}
            name="whatsappNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="+55 (DDD) XXXXX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Botão de Enviar */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Assinatura'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SubmitSubscriptionForm;
