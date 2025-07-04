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
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { addSubscription, updateSubscription, logError, getAllSubscriptions, getAllCategories } from '@/services/subscription-service';
import { titleOptions } from '@/data/predefinedTitles';
import { handlePriceChange, handleWhatsAppChange, handleTelegramChange } from '@/utils/formatting';

/**
 * Componente de formulário para administração de assinaturas
 * @version 3.9.0
 */

// Lista de tipos de acesso
const ACCESS_TYPES = ["LOGIN E SENHA", "CONVITE", "ATIVAÇÃO", "OUTRO"];

// Schema for form validation
const formSchema = z.object({
  fullName: z.string().min(1, {
    message: "O nome completo é obrigatório"
  }),
  title: z.string().min(1, {
    message: "O título é obrigatório"
  }),
  customTitle: z.string().optional(),
  price: z.string().min(1, {
    message: "O preço é obrigatório"
  }),
  paymentMethod: z.string().min(1, {
    message: "O método de pagamento é obrigatório"
  }),
  customPaymentMethod: z.string().optional(),
  status: z.string().min(1, {
    message: "O status é obrigatório"
  }),
  access: z.string().min(1, {
    message: "O acesso é obrigatório"
  }),
  customAccess: z.string().optional(),
  headerColor: z.string().min(1, {
    message: "A cor do cabeçalho é obrigatória"
  }),
  priceColor: z.string().min(1, {
    message: "A cor do preço é obrigatória"
  }),
  whatsappNumber: z.string().min(1, {
    message: "O número do WhatsApp é obrigatório"
  }),
  telegramUsername: z.string().min(1, {
    message: "O usuário do Telegram é obrigatório"
  }),
  icon: z.string().optional(),
  addedDate: z.string().optional(),
  featured: z.boolean().default(false),
  code: z.string().optional(),
  pixKey: z.string().optional(),
  category: z.string().optional()
});
type FormValues = z.infer<typeof formSchema>;

// Add the interface for the component props
export interface SubscriptionFormProps {
  initialData: SubscriptionData | null;
  isMemberSubmission?: boolean;
  isPendingEdit?: boolean;
}
const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  initialData,
  isMemberSubmission = false,
  isPendingEdit = false
}) => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedAccess, setSelectedAccess] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  // Check if user is admin
  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const {
          data,
          error
        } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(data);
      } catch (error) {
        console.error('Erro ao verificar se o usuário é administrador:', error);
        setIsAdmin(false);
      }
    };
    checkIfAdmin();
  }, []);

  // Fetch existing titles and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subscriptions, categoryList] = await Promise.all([getAllSubscriptions(), getAllCategories()]);
        const titles = [...new Set(subscriptions.map(sub => sub.title.toUpperCase()))];
        setExistingTitles(titles);
        setCategories(categoryList);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
    fetchData();
  }, []);

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      title: "",
      customTitle: "",
      price: "R$ 0,00",
      paymentMethod: "PIX (Mensal)",
      customPaymentMethod: "",
      status: "Assinado",
      access: "LOGIN E SENHA",
      customAccess: "",
      headerColor: "bg-blue-600",
      priceColor: "text-blue-600",
      whatsappNumber: "+55",
      telegramUsername: "@",
      icon: "none",
      addedDate: new Date().toLocaleDateString('pt-BR'),
      featured: false,
      code: "",
      pixKey: "",
      category: ""
    }
  });

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      // Check if access is one of the predefined options
      const isAccessInList = ACCESS_TYPES.includes(initialData.access);

      // Check if title is in the list of predefined titles or existing titles
      const titleUppercase = initialData.title.toUpperCase();
      const isTitleInList = titleOptions.some(option => option.value === titleUppercase);

      // Check if payment method is one of the predefined ones
      const paymentMethod = initialData.paymentMethod;
      const isPreDefinedPayment = ["PIX (Mensal)", "PIX (Anual)"].includes(paymentMethod);
      form.reset({
        fullName: initialData.fullName || "",
        title: isTitleInList ? titleUppercase : "Personalizado",
        customTitle: isTitleInList ? "" : initialData.title,
        price: initialData.price,
        paymentMethod: isPreDefinedPayment ? initialData.paymentMethod : "OUTRA FORMA",
        customPaymentMethod: isPreDefinedPayment ? "" : initialData.paymentMethod,
        status: initialData.status || "Assinado",
        access: isAccessInList ? initialData.access : "OUTRO",
        customAccess: isAccessInList ? "" : initialData.access,
        headerColor: initialData.headerColor || "bg-blue-600",
        priceColor: initialData.priceColor || "text-blue-600",
        whatsappNumber: initialData.whatsappNumber,
        telegramUsername: initialData.telegramUsername,
        icon: initialData.icon || 'none',
        addedDate: initialData.addedDate || new Date().toLocaleDateString('pt-BR'),
        featured: initialData.featured || false,
        code: initialData.code,
        pixKey: initialData.pixKey || "",
        category: initialData.category || ""
      });
      setSelectedTitle(isTitleInList ? titleUppercase : "Personalizado");
      setSelectedPaymentMethod(isPreDefinedPayment ? initialData.paymentMethod : "OUTRA FORMA");
      setSelectedAccess(isAccessInList ? initialData.access : "OUTRO");
    }
  }, [initialData, form]);

  // Handle title change
  const handleTitleChange = (value: string) => {
    setSelectedTitle(value);
    form.setValue("title", value);
    if (value !== "Personalizado") {
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

  // Handle access type change
  const handleAccessChange = (value: string) => {
    setSelectedAccess(value);
    form.setValue("access", value);
    if (value !== "OUTRO") {
      form.setValue("customAccess", "");
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Process custom title
      const finalTitle = data.title === "Personalizado" ? data.customTitle : data.title;

      // Process custom payment method
      const finalPaymentMethod = data.paymentMethod === "OUTRA FORMA" ? data.customPaymentMethod : data.paymentMethod;

      // Process custom access
      const finalAccess = data.access === "OUTRO" ? data.customAccess : data.access;

      // Ensure all required fields are filled
      const formattedData: SubscriptionData = {
        fullName: data.fullName,
        title: finalTitle,
        customTitle: data.title === "Personalizado" ? data.customTitle : undefined,
        price: data.price,
        paymentMethod: finalPaymentMethod,
        status: data.status,
        access: finalAccess,
        headerColor: data.headerColor,
        priceColor: data.priceColor,
        whatsappNumber: data.whatsappNumber,
        telegramUsername: data.telegramUsername,
        icon: data.icon === 'none' ? '' : data.icon,
        addedDate: data.addedDate,
        featured: data.featured,
        code: data.code,
        pixKey: data.pixKey,
        category: data.category
      };
      if (isEditing) {
        await updateSubscription(id, formattedData);
        toast({
          title: "Assinatura atualizada",
          description: "A assinatura foi atualizada com sucesso."
        });
      } else {
        await addSubscription(formattedData);
        toast({
          title: "Assinatura adicionada",
          description: "A assinatura foi adicionada com sucesso."
        });
      }
      navigate('/admin/subscriptions');
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a assinatura.",
        variant: "destructive"
      });

      // Log error
      logError('Erro ao salvar assinatura', JSON.stringify(data), isEditing ? 'UPDATE_ERROR' : 'INSERT_ERROR', JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };
  if (isFetchingData) {
    return <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Carregando dados da assinatura...</span>
      </div>;
  }
  return <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código (somente para edição) */}
              {isEditing && <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem>
                      <FormLabel>Código (não editável)</FormLabel>
                      <FormControl>
                        <Input disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />}
              
              {/* Nome Completo */}
              <FormField control={form.control} name="fullName" render={({
              field
            }) => <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do anunciante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* Título */}
              <FormField control={form.control} name="title" render={({
              field
            }) => <FormItem>
                    <FormLabel>Título do Anúncio</FormLabel>
                    <FormControl>
                      <Combobox options={titleOptions} value={field.value} onValueChange={handleTitleChange} placeholder="Selecione ou busque um título" searchPlaceholder="Buscar título..." emptyText="Nenhum título encontrado." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* Título personalizado */}
              {selectedTitle === "Personalizado" && <FormField control={form.control} name="customTitle" render={({
              field
            }) => <FormItem>
                      <FormLabel>Título Personalizado</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira um título personalizado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />}
              
              {/* Preço */}
              <FormField control={form.control} name="price" render={({
              field
            }) => <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 15,00" {...field} onChange={e => {
                  handlePriceChange(e, form.setValue);
                  field.onChange(e);
                }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              {/* Categoria */}
              {categories.length > 0 && <FormField control={form.control} name="category" render={({
              field
            }) => <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />}
              
              {/* Método de Pagamento */}
              <FormField control={form.control} name="paymentMethod" render={({
              field
            }) => <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={handlePaymentMethodChange} defaultValue={field.value} value={field.value}>
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
                  </FormItem>} />
              
              {/* Método de pagamento personalizado */}
              {selectedPaymentMethod === "OUTRA FORMA" && <FormField control={form.control} name="customPaymentMethod" render={({
              field
            }) => <FormItem>
                      <FormLabel>Método de Pagamento Personalizado</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira um método de pagamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />}

              {/* Chave PIX */}
              <FormField control={form.control} name="pixKey" render={({
              field
            }) => <FormItem>
                    <FormLabel>Chave PIX</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua chave PIX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* Status */}
              <FormField control={form.control} name="status" render={({
              field
            }) => <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </FormItem>} />
              
              {/* Acesso */}
              <FormField control={form.control} name="access" render={({
              field
            }) => <FormItem>
                    <FormLabel>Envio</FormLabel>
                    <Select onValueChange={handleAccessChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de envio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACCESS_TYPES.map(accessType => <SelectItem key={accessType} value={accessType}>{accessType}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />
              
              {/* Acesso personalizado */}
              {selectedAccess === "OUTRO" && <FormField control={form.control} name="customAccess" render={({
              field
            }) => <FormItem>
                      <FormLabel>Tipo de Envio Personalizado</FormLabel>
                      <FormControl>
                        <Input placeholder="Especifique o tipo de envio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />}
              
              {/* Data de Adição */}
              <FormField control={form.control} name="addedDate" render={({
              field
            }) => <FormItem>
                    <FormLabel>Data de Adição (não editável)</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* WhatsApp */}
              <FormField control={form.control} name="whatsappNumber" render={({
              field
            }) => <FormItem>
                    <FormLabel>Número do WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+5511999999999" {...field} onChange={e => {
                  handleWhatsAppChange(e, form.setValue);
                  field.onChange(e);
                }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* Telegram */}
              <FormField control={form.control} name="telegramUsername" render={({
              field
            }) => <FormItem>
                    <FormLabel>Usuário do Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="@usuariotelegram" {...field} onChange={e => {
                  handleTelegramChange(e, form.setValue);
                  field.onChange(e);
                }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* Campos apenas para administradores */}
              {isAdmin && <>
                  {/* Destaque */}
                  <FormField control={form.control} name="featured" render={({
                field
              }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Destacar esta assinatura (admin)
                        </FormLabel>
                      </FormItem>} />
                </>}
            </div>
            
            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/subscriptions')} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Atualizando...' : 'Salvando...'}
                  </> : isEditing ? 'Atualizar Assinatura' : 'Salvar Assinatura'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>;
};
export default SubscriptionForm;