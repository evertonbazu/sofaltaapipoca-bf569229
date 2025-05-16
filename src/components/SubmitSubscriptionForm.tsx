
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getAllCategories } from '@/services/subscription-service';
import CurrencyInput from './CurrencyInput';

// Define form schema using zod
const formSchema = z.object({
  title: z.string().min(1, { message: 'O título é obrigatório' }),
  price: z.string().min(1, { message: 'O preço é obrigatório' }),
  payment_method: z.string().min(1, { message: 'O método de pagamento é obrigatório' }),
  access: z.string().min(1, { message: 'O tipo de acesso é obrigatório' }),
  whatsapp_number: z.string().min(1, { message: 'O número do WhatsApp é obrigatório' }),
  telegram_username: z.string().min(1, { message: 'O usuário do Telegram é obrigatório' }),
  category: z.string().optional(),
  additional_notes: z.string().optional()
});

// Component
const SubmitSubscriptionForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      price: '',
      payment_method: '',
      access: '',
      whatsapp_number: '',
      telegram_username: '',
      category: '',
      additional_notes: ''
    },
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id || null);
    };
    checkAuth();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Prepare data for submission
      const submissionData = {
        title: data.title,
        price: data.price,
        payment_method: data.payment_method,
        status: "Aguardando Aprovação",
        access: data.access,
        whatsapp_number: data.whatsapp_number,
        telegram_username: data.telegram_username,
        category: data.category,
        user_id: userId,
        header_color: "bg-blue-600", // Default values
        price_color: "text-blue-600",
        status_approval: "pending",
        visible: true,
        added_date: new Date().toLocaleDateString('pt-BR')
      };

      // Submit to pending_subscriptions table
      const { error } = await supabase
        .from('pending_subscriptions')
        .insert(submissionData);

      if (error) throw error;

      // Show success message
      toast({
        title: "Enviado com sucesso!",
        description: "Seu anúncio foi enviado para aprovação. Em breve ele estará disponível no site.",
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error submitting subscription:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar seu anúncio. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Assinatura</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Netflix Premium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preço - Usando o componente CurrencyInput */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder="R$ 0,00"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Método de Pagamento */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PIX (Mensal)">PIX (Mensal)</SelectItem>
                      <SelectItem value="PIX (Anual)">PIX (Anual)</SelectItem>
                      <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Acesso */}
            <FormField
              control={form.control}
              name="access"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOGIN E SENHA">Login e Senha</SelectItem>
                      <SelectItem value="CONVITE">Convite</SelectItem>
                      <SelectItem value="ATIVAÇÃO">Ativação</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WhatsApp */}
            <FormField
              control={form.control}
              name="whatsapp_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 5511999999999 (sem espaços)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telegram */}
            <FormField
              control={form.control}
              name="telegram_username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário do Telegram</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: usuario (sem @)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notas Adicionais */}
          <FormField
            control={form.control}
            name="additional_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Adicionais</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informações adicionais sobre sua assinatura"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isAuthenticated && (
            <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-sm">
              <strong>Atenção:</strong> Para enviar seu anúncio, você precisará criar ou fazer login em uma conta.
              Você será redirecionado para a página de login após enviar o formulário.
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Anúncio'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SubmitSubscriptionForm;
