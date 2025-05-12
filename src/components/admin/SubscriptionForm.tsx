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
import { addSubscription, updateSubscription, logError, getAllSubscriptions } from '@/services/subscription-service';

// Schema for form validation
const formSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }),
  customTitle: z.string().optional(),
  price: z.string().min(1, { message: "O preço é obrigatório" }),
  paymentMethod: z.string().min(1, { message: "O método de pagamento é obrigatório" }),
  customPaymentMethod: z.string().optional(),
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

// Add the interface for the component props
export interface SubscriptionFormProps {
  initialData: SubscriptionData | null;
  isMemberSubmission?: boolean;
  isPendingEdit?: boolean;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ initialData, isMemberSubmission = false, isPendingEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  
  // Check if user is admin
  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(data);
      } catch (error) {
        console.error('Erro ao verificar se o usuário é administrador:', error);
        setIsAdmin(false);
      }
    };
    
    checkIfAdmin();
  }, []);

  // Fetch existing titles
  useEffect(() => {
    const fetchExistingTitles = async () => {
      try {
        const subscriptions = await getAllSubscriptions();
        const titles = [...new Set(subscriptions.map(sub => sub.title.toUpperCase()))];
        setExistingTitles(titles);
      } catch (error) {
        console.error('Erro ao buscar títulos existentes:', error);
      }
    };
    
    fetchExistingTitles();
  }, []);
  
  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      customTitle: "",
      price: "",
      paymentMethod: "",
      customPaymentMethod: "",
      status: "Assinado",
      access: "",
      headerColor: "bg-blue-600",
      priceColor: "text-blue-600",
      whatsappNumber: "",
      telegramUsername: "",
      icon: "none",
      addedDate: new Date().toLocaleDateString('pt-BR'),
      featured: false,
      code: "",
    },
  });

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      // Check if title is in the list of existing titles
      const isTitleInList = existingTitles.includes(initialData.title.toUpperCase());
      
      // Check if payment method is one of the predefined ones
      const paymentMethod = initialData.paymentMethod;
      const isPreDefinedPayment = ["PIX (Mensal)", "PIX (Anual)"].includes(paymentMethod);
      
      form.reset({
        title: isTitleInList ? initialData.title.toUpperCase() : "PERSONALIZADO",
        customTitle: isTitleInList ? "" : initialData.title,
        price: initialData.price,
        paymentMethod: isPreDefinedPayment ? initialData.paymentMethod : "OUTRA FORMA",
        customPaymentMethod: isPreDefinedPayment ? "" : initialData.paymentMethod,
        status: initialData.status || "Assinado",
        access: initialData.access,
        headerColor: initialData.headerColor || "bg-blue-600",
        priceColor: initialData.priceColor || "text-blue-600",
        whatsappNumber: initialData.whatsappNumber,
        telegramUsername: initialData.telegramUsername,
        icon: initialData.icon || 'none',
        addedDate: initialData.addedDate || new Date().toLocaleDateString('pt-BR'),
        featured: initialData.featured || false,
        code: initialData.code,
      });
      
      setSelectedTitle(isTitleInList ? initialData.title.toUpperCase() : "PERSONALIZADO");
      setSelectedPaymentMethod(isPreDefinedPayment ? initialData.paymentMethod : "OUTRA FORMA");
    }
  }, [initialData, form, existingTitles]);

  // Handle title change
  const handleTitleChange = (value: string) => {
    setSelectedTitle(value);
    form.setValue("title", value);
    
    if (value !== "PERSONALIZADO") {
      form.setValue("customTitle", "");
    }
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
    form.setValue("paymentMethod", value);
    
    if (value !== "OUTRA FORMA") {
      form.setValue("customPaymentMethod", "");
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Process custom title
      const finalTitle = data.title === "PERSONALIZADO" ? data.customTitle : data.title;
      
      // Process custom payment method
      const finalPaymentMethod = data.paymentMethod === "OUTRA FORMA" ? data.customPaymentMethod : data.paymentMethod;
      
      // Ensure all required fields are filled
      const formattedData: SubscriptionData = {
        title: finalTitle,
        price: data.price,
        paymentMethod: finalPaymentMethod,
        status: data.status,
        access: data.access,
        headerColor: data.headerColor,
        priceColor: data.priceColor,
        whatsappNumber: data.whatsappNumber,
        telegramUsername: data.telegramUsername,
        icon: data.icon === 'none' ? '' : data.icon,
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
      
      // Log error
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
              {/* Código (somente para edição) */}
              {isEditing && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código (não editável)</FormLabel>
                      <FormControl>
                        <Input disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <Select
                      onValueChange={handleTitleChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um título" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {existingTitles.map((title) => (
                          <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                        <SelectItem value="PERSONALIZADO">PERSONALIZADO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Título personalizado */}
              {selectedTitle === "PERSONALIZADO" && (
                <FormField
                  control={form.control}
                  name="customTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Personalizado</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira um título personalizado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
                      value={field.value}
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
                      FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
              
              {/* Data de Adição */}
              <FormField
                control={form.control}
                name="addedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Adição (não editável)</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
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
              
              {/* Campos apenas para administradores */}
              {isAdmin && (
                <>
                  {/* Cor do Cabeçalho */}
                  <FormField
                    control={form.control}
                    name="headerColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Cabeçalho (admin)</FormLabel>
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
                            <SelectItem value="bg-blue-600">Azul</SelectItem>
                            <SelectItem value="bg-gradient-indigo">Índigo</SelectItem>
                            <SelectItem value="bg-gradient-purple">Roxo</SelectItem>
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
                        <FormLabel>Cor do Preço (admin)</FormLabel>
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
                            <SelectItem value="text-blue-600">Azul</SelectItem>
                            <SelectItem value="text-indigo-600">Índigo</SelectItem>
                            <SelectItem value="text-purple-600">Roxo</SelectItem>
                            <SelectItem value="text-green-600">Verde</SelectItem>
                            <SelectItem value="text-red-600">Vermelho</SelectItem>
                            <SelectItem value="text-orange-600">Laranja</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <FormLabel>Ícone (admin)</FormLabel>
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
                            <SelectItem value="none">Nenhum</SelectItem>
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
                          Destacar esta assinatura (admin)
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            
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
