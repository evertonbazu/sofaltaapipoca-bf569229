
import React, { useState, useEffect } from 'react';
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
import { SubscriptionData } from '@/types/subscriptionTypes';
import { getAllCategories } from '@/services/subscription-service';

// Lista de títulos predefinidos com "Personalizado" no topo
const PREDEFINED_TITLES = [
  "Personalizado",
  "AMAZON PRIME VIDEO",
  "APPLE ONE (200GB)",
  "APPLE ONE (2TB)",
  "APPLE TV+",
  "CANVA PRO",
  "CLARO TV+",
  "CRUNCHYROLL",
  "DEEZER",
  "DISCOVERY+",
  "DISNEY+ PADRÃO (COM ANÚNCIOS)",
  "DISNEY+ PADRÃO (SEM ANÚNCIOS)",
  "DISNEY+ PREMIUM",
  "FUNIMATION",
  "GLOBOPLAY PREMIUM",
  "GLOBOPLAY PADRÃO (COM ANÚNCIOS)",
  "GLOBOPLAY PADRÃO (SEM ANÚNCIOS)",
  "MAX STANDARD",
  "MAX PLATINUM",
  "NETFLIX (DISPOSITIVOS MÓVEIS)",
  "NETFLIX (DISPOSITIVOS MÓVEIS/TV)",
  "MICROSOFT 365",
  "PARAMOUNT PADRÃO (MELI+)",
  "PARAMOUNT PREMIUM",
  "SPOTIFY",
  "YOUTUBE PREMIUM",
];

// Schema para validação do formulário
// Telegram é opcional, todos os outros campos são obrigatórios
const formSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }),
  customTitle: z.string().min(1, { message: "O título personalizado é obrigatório" }).optional().or(z.literal("")),
  price: z.string().min(1, { message: "O preço é obrigatório" }),
  paymentMethod: z.string().min(1, { message: "O método de pagamento é obrigatório" }),
  customPaymentMethod: z.string().min(1, { message: "O método de pagamento personalizado é obrigatório" }).optional().or(z.literal("")),
  status: z.string().min(1, { message: "O status é obrigatório" }),
  access: z.string().min(1, { message: "O acesso é obrigatório" }),
  customAccess: z.string().min(1, { message: "O tipo de acesso personalizado é obrigatório" }).optional().or(z.literal("")),
  whatsappNumber: z.string().min(1, { message: "O número do WhatsApp é obrigatório" }),
  telegramUsername: z.string().optional().or(z.literal("")),
  pixKey: z.string().min(1, { message: "A chave PIX é obrigatória" }),
  category: z.string().min(1, { message: "A categoria é obrigatória" }).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const SubmitSubscriptionForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedAccess, setSelectedAccess] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Verificar se o usuário está logado
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // Se não estiver logado, redirecionar para página de login
        toast({
          title: "Acesso restrito",
          description: "Você precisa estar logado para enviar um anúncio.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };
    
    checkUser();
    
    // Carregar categorias disponíveis
    const loadCategories = async () => {
      try {
        const categoryList = await getAllCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    loadCategories();
  }, [navigate, toast]);
  
  // Configurar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      customTitle: "",
      price: "R$ ",
      paymentMethod: "PIX (Mensal)",
      customPaymentMethod: "",
      status: "Assinado",
      access: "LOGIN E SENHA",
      customAccess: "",
      whatsappNumber: "",
      telegramUsername: "",
      pixKey: "",
      category: "",
    },
  });
  
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
  
  // Formatação de preço em reais
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Garantir que sempre começa com R$ 
    if (!value.startsWith("R$ ")) {
      value = "R$ " + value.replace("R$ ", "");
    }
    
    // Remover qualquer caractere não numérico, exceto vírgula e ponto
    const numericValue = value.substring(3).replace(/[^\d,\.]/g, "");
    
    // Formatar o valor como moeda brasileira
    let formattedValue = "R$ " + numericValue;
    
    form.setValue("price", formattedValue);
  };
  
  // Manipulador para envio do formulário
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Processar método de pagamento personalizado
      const finalPaymentMethod = data.paymentMethod === "OUTRA FORMA" ? data.customPaymentMethod : data.paymentMethod;
      
      // Processar tipo de acesso personalizado
      const finalAccess = data.access === "OUTRO" ? data.customAccess : data.access;
      
      // Processar título personalizado
      const finalTitle = data.title === "OUTRO" ? data.customTitle : data.title;
      
      // Gerar código único
      const { data: code, error: codeError } = await supabase.rpc('generate_subscription_code');
      if (codeError) throw codeError;
      
      // Adicionar asterisco ao título para anúncios de membros
      const titleWithAsterisk = `* ${finalTitle.toUpperCase()}`;
      
      // Enviar para o banco de dados - Definir visible como false para novos anúncios
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          title: titleWithAsterisk,
          price: data.price,
          payment_method: finalPaymentMethod,
          status: data.status,
          access: finalAccess.toUpperCase(),
          header_color: 'bg-blue-600',
          price_color: 'text-blue-600',
          whatsapp_number: data.whatsappNumber,
          telegram_username: data.telegramUsername,
          added_date: new Date().toLocaleDateString('pt-BR'),
          code: code,
          user_id: userId,
          pix_key: data.pixKey,
          featured: false,
          visible: false // Definir como não aprovado por padrão
        });
      
      if (error) throw error;
      
      toast({
        title: "Anúncio enviado",
        description: "Seu anúncio foi enviado com sucesso e será revisado pelo administrador.",
      });
      
      // Limpar formulário
      form.reset();
      
      // Redirecionar para o perfil ou página inicial
      navigate('/');
      
    } catch (error) {
      console.error('Erro ao enviar anúncio:', error);
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
    <Card>
      <CardHeader>
        <CardTitle>Envie seu anúncio</CardTitle>
        <CardDescription>
          Preencha o formulário abaixo para adicionar seu anúncio ao site.
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
                    <Select
                      onValueChange={handleTitleChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um título" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {PREDEFINED_TITLES.map(title => (
                          <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="R$ 19,90" 
                        {...field} 
                        onChange={(e) => {
                          handlePriceChange(e);
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                    <Select
                      onValueChange={handleAccessChange}
                      defaultValue={field.value}
                    >
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
                      <Input placeholder="5511999999999" {...field} />
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
                      <Input placeholder="@usuariodotelegram" {...field} />
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
                  'Enviar anúncio'
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
