import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { titleOptions } from '@/data/predefinedTitles';
import { Combobox } from "@/components/ui/combobox"
import { formatCurrency, formatWhatsApp, formatTelegram } from '@/utils/formatting';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { APP_VERSION } from '@/components/Version';

/**
 * Componente de formulário para administração de assinaturas
 * @version 3.8.0
 */

const subscriptionSchema = z.object({
  title: z.string().min(2, {
    message: "Título deve ter pelo menos 2 caracteres.",
  }),
  price: z.string().min(4, {
    message: "Preço deve ser formatado corretamente (ex: R$ 00,00).",
  }),
  paymentMethod: z.string().optional(),
  status: z.string().optional(),
  access: z.string().min(2, {
    message: "O método de acesso deve ter pelo menos 2 caracteres.",
  }),
  whatsappNumber: z.string().optional(),
  telegramUsername: z.string().optional(),
  featured: z.boolean().default(false).optional(),
  autoPostTelegram: z.boolean().default(false).optional(),
  addedDate: z.string().optional(),
});

interface SubscriptionFormProps {
  onSubmit: (data: SubscriptionData) => void;
  onCancel: () => void;
  initialValues?: SubscriptionData;
  isLoading?: boolean;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false
}) => {
  const { toast } = useToast()
  const [isFeatured, setIsFeatured] = useState(initialValues?.featured || false);
  const [isAutoPostTelegram, setIsAutoPostTelegram] = useState(initialValues?.autoPostTelegram || false);
  const [selectedTitle, setSelectedTitle] = useState(initialValues?.title || '');

  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      title: initialValues?.title || "",
      price: initialValues?.price || "R$ 0,00",
      paymentMethod: initialValues?.paymentMethod || "",
      status: initialValues?.status || "Disponível",
      access: initialValues?.access || "",
      whatsappNumber: initialValues?.whatsappNumber || "",
      telegramUsername: initialValues?.telegramUsername || "",
      featured: initialValues?.featured || false,
      autoPostTelegram: initialValues?.autoPostTelegram || false,
      addedDate: initialValues?.addedDate || new Date().toLocaleDateString('pt-BR'),
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (initialValues) {
      setIsFeatured(initialValues.featured || false);
      setIsAutoPostTelegram(initialValues.autoPostTelegram || false);
      setSelectedTitle(initialValues.title || '');

      // Update form values with initialValues
      form.setValue('title', initialValues.title || '');
      form.setValue('price', initialValues.price || 'R$ 0,00');
      form.setValue('paymentMethod', initialValues.paymentMethod || '');
      form.setValue('status', initialValues.status || 'Disponível');
      form.setValue('access', initialValues.access || '');
      form.setValue('whatsappNumber', initialValues.whatsappNumber || '');
      form.setValue('telegramUsername', initialValues.telegramUsername || '');
      form.setValue('featured', initialValues.featured || false);
      form.setValue('autoPostTelegram', initialValues.autoPostTelegram || false);
      form.setValue('addedDate', initialValues.addedDate || new Date().toLocaleDateString('pt-BR'));
    }
  }, [initialValues, form]);

  function onSubmitForm(values: z.infer<typeof subscriptionSchema>) {
    const subscriptionData: SubscriptionData = {
      ...values,
      featured: isFeatured,
      autoPostTelegram: isAutoPostTelegram,
    };

    onSubmit(subscriptionData);
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    form.setValue("price", formattedValue);
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatWhatsApp(e.target.value);
    form.setValue("whatsappNumber", formattedValue);
  };

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelegram(e.target.value);
    form.setValue("telegramUsername", formattedValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Título */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Combobox
                    options={titleOptions}
                    value={selectedTitle}
                    onChange={(value: string) => {
                      setSelectedTitle(value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Título da assinatura.
                </FormDescription>
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
                  <Input
                    placeholder="R$ 0,00"
                    className="text-right"
                    value={field.value}
                    onChange={(e) => {
                      handlePriceChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Valor da assinatura.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Método de Pagamento */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Como o pagamento será efetuado.
                </FormDescription>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Indisponível">Indisponível</SelectItem>
                    <SelectItem value="Pausado">Pausado</SelectItem>
                    <SelectItem value="Em Breve">Em Breve</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Situação atual da assinatura.
                </FormDescription>
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
                  <Input
                    type="date"
                    defaultValue={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Data em que a assinatura foi adicionada.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Método de Acesso */}
        <FormField
          control={form.control}
          name="access"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Método de Acesso</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Link, usuário e senha, QR Code, etc."
                  className="resize-none"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Como o assinante terá acesso.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* WhatsApp */}
          <FormField
            control={form.control}
            name="whatsappNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do WhatsApp</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 text-gray-600 border border-r-0 border-gray-300 rounded-l-md">
                      +
                    </span>
                    <Input
                      placeholder="5513999999999"
                      className="rounded-l-none"
                      value={field.value}
                      onChange={(e) => {
                        handleWhatsAppChange(e);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Número para contato via WhatsApp.
                </FormDescription>
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
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 text-gray-600 border border-r-0 border-gray-300 rounded-l-md">
                      @
                    </span>
                    <Input
                      placeholder="usuario_telegram"
                      className="rounded-l-none"
                      value={field.value}
                      onChange={(e) => {
                        handleTelegramChange(e);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Usuário para contato via Telegram.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Destaque */}
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Destaque</FormLabel>
                  <FormDescription>
                    Adiciona esta assinatura à seção de destaques.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={isFeatured}
                    onCheckedChange={(checked) => {
                      setIsFeatured(checked);
                      field.onChange(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Auto Post Telegram */}
          <FormField
            control={form.control}
            name="autoPostTelegram"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Auto Post Telegram</FormLabel>
                  <FormDescription>
                    Envia automaticamente esta assinatura para o Telegram.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={isAutoPostTelegram}
                    onCheckedChange={(checked) => {
                      setIsAutoPostTelegram(checked);
                      field.onChange(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubscriptionForm;
