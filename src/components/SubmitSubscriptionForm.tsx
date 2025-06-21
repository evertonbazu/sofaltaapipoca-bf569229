import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PREDEFINED_TITLES, titleOptions } from '@/data/predefinedTitles';
import { handlePriceChange, handleWhatsAppChange, handleTelegramChange } from '@/utils/formatting';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { createSubscription } from '@/services/subscription-service';
import { useNavigate } from 'react-router-dom';
import { Combobox } from "@/components/ui/combobox";
import { APP_VERSION } from '@/components/Version';

/**
 * Componente de formulário para submissão de anúncios pelos usuários
 * @version 3.8.0
 */
const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  price: z.string().min(1, {
    message: "O preço é obrigatório.",
  }),
  paymentMethod: z.string().min(3, {
    message: "O método de pagamento deve ter pelo menos 3 caracteres.",
  }),
  whatsappNumber: z.string().min(12, {
    message: "Número de WhatsApp inválido.",
  }),
  telegramUsername: z.string().optional(),
  access: z.string().min(3, {
    message: "As instruções de acesso devem ter pelo menos 3 caracteres.",
  }),
  status: z.string().min(3, {
    message: "O status deve ter pelo menos 3 caracteres.",
  }),
  terms: z.boolean().refine((value) => value === true, {
    message: "Você deve aceitar os termos e condições.",
  }),
});

const SubmitSubscriptionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: "",
      paymentMethod: "",
      whatsappNumber: "55",
      telegramUsername: "@",
      access: "",
      status: "Disponível",
      terms: false,
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Remover a máscara de formatação do preço antes de enviar
      const priceValue = data.price.replace(/[^0-9,]/g, '').replace(',', '.');
      
      const subscriptionData = {
        ...data,
        price: priceValue,
        headerColor: "bg-blue-600", // Valor padrão para headerColor
        priceColor: "text-blue-600", // Valor padrão para priceColor
      };
      
      // Enviar os dados para o serviço de criação de assinatura
      const success = await createSubscription(subscriptionData);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Seu anúncio foi enviado para aprovação!",
        });
        navigate('/');
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao enviar o anúncio.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o anúncio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título do anúncio</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Combobox
              options={titleOptions}
              placeholder="Escolha um título ou digite um personalizado"
              onValueChange={(value: string) => field.onChange(value)}
              value={field.value}
              error={errors.title?.message}
            />
          )}
        />
        {errors.title?.message && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Preço</Label>
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              id="price"
              placeholder="R$ 0,00"
              value={field.value}
              onChange={(e) => {
                field.onChange(e);
                handlePriceChange(e, setValue);
              }}
            />
          )}
        />
        {errors.price?.message && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Input
              id="paymentMethod"
              placeholder="Ex: Pix, Cartão de Crédito, Boleto"
              {...field}
            />
          )}
        />
        {errors.paymentMethod?.message && (
          <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
        <Controller
          name="whatsappNumber"
          control={control}
          render={({ field }) => (
            <div className="flex items-center">
              <span className="bg-gray-100 px-3 py-2 text-gray-600 border border-r-0 border-gray-300 rounded-l-md">
                +
              </span>
              <Input
                id="whatsappNumber"
                placeholder="5511999999999"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e);
                  handleWhatsAppChange(e, setValue);
                }}
                className="rounded-l-none"
              />
            </div>
          )}
        />
        {errors.whatsappNumber?.message && (
          <p className="text-sm text-red-500">{errors.whatsappNumber.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="telegramUsername">Usuário do Telegram (opcional)</Label>
        <Controller
          name="telegramUsername"
          control={control}
          render={({ field }) => (
            <Input
              id="telegramUsername"
              placeholder="@usuario_telegram"
              value={field.value}
              onChange={(e) => {
                field.onChange(e);
                handleTelegramChange(e, setValue);
              }}
            />
          )}
        />
        {errors.telegramUsername?.message && (
          <p className="text-sm text-red-500">{errors.telegramUsername.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="access">Instruções de Acesso</Label>
        <Controller
          name="access"
          control={control}
          render={({ field }) => (
            <Textarea
              id="access"
              placeholder="Como os outros membros terão acesso?"
              {...field}
            />
          )}
        />
        {errors.access?.message && (
          <p className="text-sm text-red-500">{errors.access.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Em Breve">Em Breve</SelectItem>
                <SelectItem value="Indisponível">Indisponível</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status?.message && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Controller
          name="terms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Aceito os termos e condições
        </label>
        {errors.terms?.message && (
          <p className="text-sm text-red-500">{errors.terms.message}</p>
        )}
      </div>
      
      <Button disabled={isLoading} className="w-full" type="submit">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Anúncio"
        )}
      </Button>
    </form>
  );
};

export default SubmitSubscriptionForm;
