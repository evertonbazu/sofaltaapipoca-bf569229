
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { addSubscription, updateSubscription, logError } from '@/services/subscription-service';

// Schema para validação do formulário
const formSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }),
  price: z.string().min(1, { message: "O preço é obrigatório" }),
  paymentMethod: z.string().min(1, { message: "O método de pagamento é obrigatório" }),
  status: z.string().min(1, { message: "O status é obrigatório" }),
  access: z.string().min(1, { message: "O acesso é obrigatório" }),
  headerColor: z.string().min(1, { message: "A cor do cabeçalho é obrigatória" }),
  priceColor: z.string().min(1, { message: "A cor do preço é obrigatória" }),
  whatsappNumber: z.string().min(1, { message: "O número do WhatsApp é obrigatório" }),
  telegramUsername: z.string().min(1, { message: "O usuário do Telegram é obrigatório" }),
  icon: z.string().optional(),
  addedDate: z.string().optional(),
  featured: z.boolean().default(false),
  code: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SubscriptionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(isEditing);

  // Configurar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: "",
      paymentMethod: "",
      status: "",
      access: "",
      headerColor: "bg-gradient-indigo",
      priceColor: "text-indigo-600",
      whatsappNumber: "",
      telegramUsername: "",
      icon: "",
      addedDate: new Date().toLocaleDateString('pt-BR'),
      featured: false,
      code: "",
    },
  });

  // Buscar dados para edição
  useEffect(() => {
    if (isEditing) {
      const fetchSubscription = async () => {
        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            form.reset({
              title: data.title,
              price: data.price,
              paymentMethod: data.payment_method,
              status: data.status,
              access: data.access,
              headerColor: data.header_color,
              priceColor: data.price_color,
              whatsappNumber: data.whatsapp_number,
              telegramUsername: data.telegram_username,
              icon: data.icon || '',
              addedDate: data.added_date || new Date().toLocaleDateString('pt-BR'),
              featured: data.featured || false,
              code: data.code,
            });
          }
        } catch (error) {
          console.error('Erro ao buscar assinatura:', error);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados da assinatura.",
            variant: "destructive",
          });
          logError(
            'Erro ao buscar assinatura para edição',
            JSON.stringify({ id }),
            'FETCH_ERROR',
            JSON.stringify(error)
          );
        } finally {
          setIsFetchingData(false);
        }
      };

      fetchSubscription();
    }
  }, [id, isEditing, form, toast]);

  // Manipulador para envio do formulário
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Garantir que todos os campos obrigatórios estejam preenchidos
      const formattedData: SubscriptionData = {
        title: data.title,
        price: data.price,
        paymentMethod: data.paymentMethod,
        status: data.status,
        access: data.access,
        headerColor: data.headerColor,
        priceColor: data.priceColor,
        whatsappNumber: data.whatsappNumber,
        telegramUsername: data.telegramUsername,
        icon: data.icon,
        addedDate: data.addedDate,
        featured: data.featured,
        code: data.code
      };
      
      if (isEditing) {
        await updateSubscription(id, formattedData);
        toast({
          title: "Assinatura atualizada",
          description: "A assinatura foi atualizada com sucesso.",
        });
      } else {
        await addSubscription(formattedData);
        toast({
          title: "Assinatura adicionada",
          description: "A assinatura foi adicionada com sucesso.",
        });
      }
      
      navigate('/admin/subscriptions');
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a assinatura.",
        variant: "destructive",
      });
      
      // Registrar erro
      logError(
        'Erro ao salvar assinatura',
        JSON.stringify(data),
        isEditing ? 'UPDATE_ERROR' : 'INSERT_ERROR',
        JSON.stringify(error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Carregando dados da assinatura...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
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
                      <Input placeholder="Netflix Premium" {...field} />
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
                    <FormControl>
                      <Input placeholder="Pix, Boleto, etc" {...field} />
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
                    <FormControl>
                      <Input placeholder="Disponível" {...field} />
                    </FormControl>
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
                    <FormLabel>Acesso</FormLabel>
                    <FormControl>
                      <Input placeholder="Login e senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Ícone */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ícone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        <SelectItem value="tv">TV</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Cor do Cabeçalho */}
              <FormField
                control={form.control}
                name="headerColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor do Cabeçalho</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bg-gradient-indigo">Índigo</SelectItem>
                        <SelectItem value="bg-gradient-purple">Roxo</SelectItem>
                        <SelectItem value="bg-gradient-blue">Azul</SelectItem>
                        <SelectItem value="bg-gradient-green">Verde</SelectItem>
                        <SelectItem value="bg-gradient-red">Vermelho</SelectItem>
                        <SelectItem value="bg-gradient-orange">Laranja</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Cor do Preço */}
              <FormField
                control={form.control}
                name="priceColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor do Preço</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text-indigo-600">Índigo</SelectItem>
                        <SelectItem value="text-purple-600">Roxo</SelectItem>
                        <SelectItem value="text-blue-600">Azul</SelectItem>
                        <SelectItem value="text-green-600">Verde</SelectItem>
                        <SelectItem value="text-red-600">Vermelho</SelectItem>
                        <SelectItem value="text-orange-600">Laranja</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Data de Adição */}
              <FormField
                control={form.control}
                name="addedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Adição</FormLabel>
                    <FormControl>
                      <Input placeholder="DD/MM/AAAA" {...field} />
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
              
              {/* Código (somente para edição) */}
              {isEditing && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {/* Destaque */}
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Destacar esta assinatura
                  </FormLabel>
                </FormItem>
              )}
            />
            
            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin/subscriptions')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Atualizando...' : 'Salvando...'}
                  </>
                ) : (
                  isEditing ? 'Atualizar Assinatura' : 'Salvar Assinatura'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubscriptionForm;
