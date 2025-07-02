import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { getAllCategories } from '@/services/subscription-service';
import { titleOptions } from '@/data/predefinedTitles';
import { handlePriceChange, handleWhatsAppChange, handleTelegramChange } from '@/utils/formatting';
import { Textarea } from "@/components/ui/textarea";

// Schema para validação do formulário
const createFormSchema = (mode: 'create' | 'edit') => {
  const baseSchema = {
    title: z.string().min(1, { message: "O título é obrigatório" }),
    customTitle: z.string().optional().or(z.literal("")),
    price: z.string().min(1, { message: "O preço é obrigatório" }),
    paymentMethod: z.string().min(1, { message: "O método de pagamento é obrigatório" }),
    customPaymentMethod: z.string().optional().or(z.literal("")),
    status: z.string().min(1, { message: "O status é obrigatório" }),
    access: z.string().min(1, { message: "O acesso é obrigatório" }),
    customAccess: z.string().optional().or(z.literal("")),
    whatsappNumber: z.string().min(1, { message: "O número do WhatsApp é obrigatório" }),
    telegramUsername: z.string().optional().or(z.literal("")),
    pixKey: z.string().min(1, { message: "A chave PIX é obrigatória" }),
    category: z.string().optional().or(z.literal("")),
  };

  if (mode === 'create') {
    return z.object({
      ...baseSchema,
      fullName: z.string().min(1, { message: "O nome completo é obrigatório" }),
      modificationReason: z.string().optional().or(z.literal(""))
    });
  } else {
    return z.object({
      ...baseSchema,
      fullName: z.string().optional().or(z.literal("")),
      modificationReason: z.string().min(1, { message: "O motivo da modificação é obrigatório" })
    });
  }
};

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface Props {
  mode: 'create' | 'edit';
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading: boolean;
  submitButtonText?: string;
  showFullNameField?: boolean;
  showModificationReason?: boolean;
}

const SubscriptionFormCore: React.FC<Props> = ({
  mode,
  initialData,
  onSubmit,
  isLoading,
  submitButtonText = mode === 'create' ? 'Enviar anúncio' : 'Enviar Modificação',
  showFullNameField = mode === 'create',
  showModificationReason = mode === 'edit'
}) => {
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedAccess, setSelectedAccess] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  // Configurar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(mode)),
    defaultValues: {
      fullName: initialData?.fullName || "",
      title: initialData?.title || "",
      customTitle: initialData?.customTitle || "",
      price: initialData?.price || "R$ 0,00",
      paymentMethod: initialData?.paymentMethod || "PIX (Mensal)",
      customPaymentMethod: initialData?.customPaymentMethod || "",
      status: initialData?.status || "Assinado",
      access: initialData?.access || "LOGIN E SENHA",
      customAccess: initialData?.customAccess || "",
      whatsappNumber: initialData?.whatsappNumber || "+55",
      telegramUsername: initialData?.telegramUsername || "@",
      pixKey: initialData?.pixKey || "",
      category: initialData?.category || "",
      modificationReason: initialData?.modificationReason || ""
    }
  });

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryList = await getAllCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  // Atualizar form quando initialData mudar
  useEffect(() => {
    if (initialData) {
      form.reset({
        fullName: initialData.fullName || "",
        title: initialData.title || "",
        customTitle: initialData.customTitle || "",
        price: initialData.price || "R$ 0,00",
        paymentMethod: initialData.paymentMethod || "PIX (Mensal)",
        customPaymentMethod: initialData.customPaymentMethod || "",
        status: initialData.status || "Assinado",
        access: initialData.access || "LOGIN E SENHA",
        customAccess: initialData.customAccess || "",
        whatsappNumber: initialData.whatsappNumber || "+55",
        telegramUsername: initialData.telegramUsername || "@",
        pixKey: initialData.pixKey || "",
        category: initialData.category || "",
        modificationReason: initialData.modificationReason || ""
      });
      
      setSelectedPaymentMethod(initialData.paymentMethod || "PIX (Mensal)");
      setSelectedAccess(initialData.access || "LOGIN E SENHA");
      setSelectedTitle(initialData.title || "");
    }
  }, [initialData, form]);

  // Manipular mudança de método de pagamento
  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
    form.setValue("paymentMethod", value);
    if (value !== "OUTRA FORMA") {
      form.setValue("customPaymentMethod", "");
    }
  };

  // Manipular mudança de tipo de acesso
  const handleAccessChange = (value: string) => {
    setSelectedAccess(value);
    form.setValue("access", value);
    if (value !== "OUTRO") {
      form.setValue("customAccess", "");
    }
  };

  // Manipular mudança de título
  const handleTitleChange = (value: string) => {
    setSelectedTitle(value);
    form.setValue("title", value);
    if (value !== "Personalizado") {
      form.setValue("customTitle", "");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome Completo - apenas no modo criação */}
          {showFullNameField && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
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
                <FormLabel>Título do Anúncio</FormLabel>
                <FormControl>
                  <Combobox
                    options={titleOptions}
                    value={field.value}
                    onValueChange={handleTitleChange}
                    placeholder="Selecione ou busque um título"
                    searchPlaceholder="Buscar título..."
                    emptyText="Nenhum título encontrado."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Título personalizado */}
          {selectedTitle === "Personalizado" && (
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
                  <Input 
                    placeholder="R$ 15,00" 
                    {...field} 
                    onChange={(e) => {
                      handlePriceChange(e, form.setValue);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Categoria */}
          {categories.length > 0 && (
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
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Método de Pagamento */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pagamento</FormLabel>
                <Select onValueChange={handlePaymentMethodChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={handleAccessChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de envio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOGIN E SENHA">LOGIN E SENHA</SelectItem>
                    <SelectItem value="ATIVAÇÃO">ATIVAÇÃO</SelectItem>
                    <SelectItem value="CONVITE">CONVITE</SelectItem>
                    <SelectItem value="OUTRO">OUTRO</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Acesso personalizado */}
          {selectedAccess === "OUTRO" && (
            <FormField
              control={form.control}
              name="customAccess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Envio Personalizado</FormLabel>
                  <FormControl>
                    <Input placeholder="Especifique o tipo de envio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* WhatsApp */}
          <FormField
            control={form.control}
            name="whatsappNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do WhatsApp</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+5511999999999" 
                    {...field} 
                    onChange={(e) => {
                      handleWhatsAppChange(e, form.setValue);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Telegram - Agora opcional */}
          <FormField
            control={form.control}
            name="telegramUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuário do Telegram (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="@usuariodotelegram" 
                    {...field} 
                    onChange={(e) => {
                      handleTelegramChange(e, form.setValue);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Motivo da modificação - apenas no modo edição */}
        {showModificationReason && (
          <FormField
            control={form.control}
            name="modificationReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo da Modificação</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o motivo da modificação..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Botão de envio */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubscriptionFormCore;