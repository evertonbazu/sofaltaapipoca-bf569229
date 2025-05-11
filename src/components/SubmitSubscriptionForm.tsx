import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Título deve ter pelo menos 2 caracteres.",
  }),
  price: z.string().min(1, {
    message: "Preço deve ser especificado.",
  }),
  paymentMethod: z.string().min(1, {
    message: "Forma de pagamento deve ser especificada.",
  }),
  access: z.string().min(2, {
    message: "Instruções de acesso devem ter pelo menos 2 caracteres.",
  }),
  whatsappNumber: z.string().optional(),
  telegramUsername: z.string().optional(),
  category: z.string().min(1, {
    message: "Categoria deve ser especificada.",
  }),
  description: z.string().optional(),
  headerColor: z.string().optional(),
  priceColor: z.string().optional(),
  icon: z.string().optional(),
});

const SubmitSubscriptionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: "",
      paymentMethod: "",
      access: "",
      whatsappNumber: "",
      telegramUsername: "",
      category: "",
      description: "",
      headerColor: "",
      priceColor: "",
      icon: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('pending_subscriptions')
        .insert([
          {
            title: values.title,
            price: values.price,
            payment_method: values.paymentMethod,
            status: 'Pendente',
            access: values.access,
            whatsapp_number: values.whatsappNumber,
            telegram_username: values.telegramUsername,
            category: values.category,
            description: values.description,
            header_color: values.headerColor,
            price_color: values.priceColor,
            icon: values.icon,
            is_user_submission: true,
            submitted_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Sucesso",
        description: "Sua submissão foi enviada para análise!",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao enviar a submissão.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Nome da assinatura" {...field} />
              </FormControl>
              <FormDescription>
                Nome da assinatura que será exibido no anúncio.
              </FormDescription>
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
                <Input placeholder="Valor da assinatura" {...field} />
              </FormControl>
              <FormDescription>
                Valor cobrado pela assinatura.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento</FormLabel>
              <FormControl>
                <Input placeholder="Forma de pagamento aceita" {...field} />
              </FormControl>
              <FormDescription>
                Forma de pagamento aceita para a assinatura.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="access"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instruções de Acesso</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Como o assinante terá acesso"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Detalhes sobre como o assinante terá acesso ao serviço.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do WhatsApp</FormLabel>
              <FormControl>
                <Input placeholder="Número para contato via WhatsApp" {...field} />
              </FormControl>
              <FormDescription>
                Número do WhatsApp para contato (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telegramUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário do Telegram</FormLabel>
              <FormControl>
                <Input placeholder="Usuário para contato via Telegram" {...field} />
              </FormControl>
              <FormDescription>
                Usuário do Telegram para contato (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  <SelectItem value="Streaming">Streaming</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Música">Música</SelectItem>
                  <SelectItem value="Produtividade">Produtividade</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Categoria da assinatura.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição detalhada da assinatura"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Descrição detalhada da assinatura (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Submissão"}
        </Button>
      </form>
    </Form>
  );
};

export default SubmitSubscriptionForm;
