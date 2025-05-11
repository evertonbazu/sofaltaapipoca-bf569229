import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { addSubscription } from '@/services/subscription-service';

// Schema de validação para o formulário
const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  price: z.string().min(2, {
    message: "O preço deve ter pelo menos 2 caracteres.",
  }),
  paymentMethod: z.string().min(2, {
    message: "O método de pagamento deve ter pelo menos 2 caracteres.",
  }),
  status: z.string().min(2, {
    message: "O status deve ter pelo menos 2 caracteres.",
  }),
  access: z.string().min(2, {
    message: "O método de acesso deve ter pelo menos 2 caracteres.",
  }),
  headerColor: z.string().min(4, {
    message: "A cor do cabeçalho deve ser válida.",
  }),
  priceColor: z.string().min(4, {
    message: "A cor do preço deve ser válida.",
  }),
  whatsappNumber: z.string().min(8, {
    message: "O número de WhatsApp deve ter pelo menos 8 caracteres.",
  }),
  telegramUsername: z.string().min(2, {
    message: "O usuário do Telegram deve ter pelo menos 2 caracteres.",
  }),
  icon: z.string().optional(),
});

const SubmitSubscriptionForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inicializar o formulário com valores padrão
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: "",
      paymentMethod: "PIX",
      status: "Disponível",
      access: "E-MAIL",
      headerColor: "bg-blue-600",
      priceColor: "text-blue-600",
      whatsappNumber: "",
      telegramUsername: "",
      icon: "monitor",
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Adicionar asterisco no início do título para marcar anúncios enviados pelos usuários
      const submittedValues = {
        ...values,
        title: `* ${values.title}`,
        // Publicar diretamente sem necessidade de aprovação
        featured: false,
        addedDate: new Date().toLocaleDateString('pt-BR')
      };
      
      // Criar a assinatura diretamente (sem passar pelo processo de aprovação)
      await addSubscription(submittedValues);
      
      toast({
        title: "Anúncio enviado com sucesso!",
        description: "Seu anúncio já está publicado no site.",
      });
      
      // Redirecionar para a página inicial
      navigate('/');
    } catch (error) {
      console.error("Erro ao enviar o anúncio:", error);
      toast({
        title: "Erro ao enviar o anúncio",
        description: "Ocorreu um erro ao processar seu anúncio. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opções de cores para o cabeçalho
  const headerColorOptions = [
    { value: "bg-blue-600", label: "Azul" },
    { value: "bg-red-600", label: "Vermelho" },
    { value: "bg-green-600", label: "Verde" },
    { value: "bg-yellow-600", label: "Amarelo" },
    { value: "bg-purple-600", label: "Roxo" },
    { value: "bg-pink-600", label: "Rosa" },
    { value: "bg-indigo-600", label: "Índigo" },
    { value: "bg-gray-600", label: "Cinza" },
  ];

  // Opções de cores para o preço
  const priceColorOptions = [
    { value: "text-blue-600", label: "Azul" },
    { value: "text-red-600", label: "Vermelho" },
    { value: "text-green-600", label: "Verde" },
    { value: "text-yellow-600", label: "Amarelo" },
    { value: "text-purple-600", label: "Roxo" },
    { value: "text-pink-600", label: "Rosa" },
    { value: "text-indigo-600", label: "Índigo" },
    { value: "text-gray-600", label: "Cinza" },
  ];

  // Opções de ícones
  const iconOptions = [
    { value: "monitor", label: "Monitor" },
    { value: "tv", label: "TV" },
    { value: "youtube", label: "YouTube" },
    { value: "apple", label: "Apple" },
  ];

  // Opções de métodos de pagamento
  const paymentMethodOptions = [
    { value: "PIX", label: "PIX" },
    { value: "Cartão de Crédito", label: "Cartão de Crédito" },
    { value: "Boleto", label: "Boleto" },
    { value: "Transferência Bancária", label: "Transferência Bancária" },
    { value: "PayPal", label: "PayPal" },
  ];

  // Opções de status
  const statusOptions = [
    { value: "Disponível", label: "Disponível" },
    { value: "Aguardando Membros", label: "Aguardando Membros" },
    { value: "Assinado", label: "Assinado" },
  ];

  // Opções de método de acesso
  const accessOptions = [
    { value: "E-MAIL", label: "E-MAIL" },
    { value: "CONVITE", label: "CONVITE" },
    { value: "LINK", label: "LINK" },
    { value: "CÓDIGO", label: "CÓDIGO" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo de Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Assinatura *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: NETFLIX, DISNEY+, etc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Preço */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: R$ 10,00 - PIX (Mensal)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Método de Pagamento */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
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

            {/* Campo de Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Campo de Método de Acesso */}
            <FormField
              control={form.control}
              name="access"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Acesso *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Campo de Cor do Cabeçalho */}
            <FormField
              control={form.control}
              name="headerColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Cabeçalho *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cor do cabeçalho" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {headerColorOptions.map((option) => (
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

            {/* Campo de Cor do Preço */}
            <FormField
              control={form.control}
              name="priceColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Preço *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cor do preço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priceColorOptions.map((option) => (
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

            {/* Campo de Número de WhatsApp */}
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de WhatsApp *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 5511912345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Usuário do Telegram */}
            <FormField
              control={form.control}
              name="telegramUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário do Telegram *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: seunome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Ícone */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ícone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map((option) => (
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
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Anúncio"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubmitSubscriptionForm;
