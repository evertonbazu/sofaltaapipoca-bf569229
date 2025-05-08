
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { PendingSubscriptionFromSupabase } from '@/types/subscriptionTypes';

const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  price: z.string().min(2, {
    message: "O preço é obrigatório.",
  }),
  payment_method: z.string().min(2, {
    message: "O método de pagamento é obrigatório.",
  }),
  status: z.string().min(2, {
    message: "O status é obrigatório.",
  }),
  access: z.string().min(2, {
    message: "O tipo de acesso é obrigatório.",
  }),
  header_color: z.string().min(2, {
    message: "A cor do cabeçalho é obrigatória.",
  }),
  price_color: z.string().min(2, {
    message: "A cor do preço é obrigatória.",
  }),
  whatsapp_number: z.string().min(8, {
    message: "O número do WhatsApp é obrigatório.",
  }),
  telegram_username: z.string().min(1, {
    message: "O nome de usuário do Telegram é obrigatório.",
  }),
  icon: z.string().optional(),
  pix_key: z.string().optional(),
  pix_qr_code: z.string().optional(),
  payment_proof_image: z.string().optional(),
  status_approval: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PendingSubscriptionFormProps {
  initialData: PendingSubscriptionFromSupabase;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

const headerColorOptions = [
  { value: "bg-blue-600", label: "Azul" },
  { value: "bg-red-600", label: "Vermelho" },
  { value: "bg-green-600", label: "Verde" },
  { value: "bg-yellow-600", label: "Amarelo" },
  { value: "bg-purple-600", label: "Roxo" },
  { value: "bg-pink-600", label: "Rosa" },
  { value: "bg-indigo-600", label: "Índigo" },
  { value: "bg-orange-600", label: "Laranja" },
  { value: "bg-gray-800", label: "Preto" },
];

const priceColorOptions = [
  { value: "text-blue-600", label: "Azul" },
  { value: "text-red-600", label: "Vermelho" },
  { value: "text-green-600", label: "Verde" },
  { value: "text-yellow-600", label: "Amarelo" },
  { value: "text-purple-600", label: "Roxo" },
  { value: "text-pink-600", label: "Rosa" },
  { value: "text-indigo-600", label: "Índigo" },
  { value: "text-orange-600", label: "Laranja" },
  { value: "text-gray-800", label: "Preto" },
];

const iconOptions = [
  { value: "monitor", label: "Monitor" },
  { value: "tv", label: "TV" },
  { value: "music", label: "Música" },
  { value: "youtube", label: "YouTube" },
  { value: "video", label: "Vídeo" },
  { value: "book", label: "Livro" },
  { value: "apple", label: "Apple" },
  { value: "android", label: "Android" },
  { value: "game", label: "Jogo" },
];

const statusOptions = [
  { value: "Assinado", label: "Assinado" },
  { value: "Assinado (1 vaga)", label: "Assinado (1 vaga)" },
  { value: "Assinado (2 vagas)", label: "Assinado (2 vagas)" },
  { value: "Assinado (3 vagas)", label: "Assinado (3 vagas)" },
  { value: "Assinado (4 vagas)", label: "Assinado (4 vagas)" },
  { value: "Assinado (5 vagas)", label: "Assinado (5 vagas)" },
  { value: "Aguardando Membros", label: "Aguardando Membros" },
  { value: "Aguardando Membros (1 vaga)", label: "Aguardando Membros (1 vaga)" },
  { value: "Aguardando Membros (2 vagas)", label: "Aguardando Membros (2 vagas)" },
  { value: "Aguardando Membros (3 vagas)", label: "Aguardando Membros (3 vagas)" },
  { value: "Aguardando Membros (4 vagas)", label: "Aguardando Membros (4 vagas)" },
  { value: "Aguardando Membros (5 vagas)", label: "Aguardando Membros (5 vagas)" },
];

const accessOptions = [
  { value: "LOGIN E SENHA", label: "Login e Senha" },
  { value: "CONVITE POR E-MAIL", label: "Convite por E-mail" },
  { value: "ATIVAÇÃO POR CÓDIGO", label: "Ativação por Código" },
  { value: "ATIVAÇÃO", label: "Ativação" },
  { value: "CONVITE", label: "Convite" },
];

const approvalStatusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
];

const PendingSubscriptionForm: React.FC<PendingSubscriptionFormProps> = ({ initialData, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData.title || '',
      price: initialData.price || '',
      payment_method: initialData.payment_method || '',
      status: initialData.status || '',
      access: initialData.access || '',
      header_color: initialData.header_color || 'bg-blue-600',
      price_color: initialData.price_color || 'text-blue-600',
      whatsapp_number: initialData.whatsapp_number || '',
      telegram_username: initialData.telegram_username || '',
      icon: initialData.icon || '',
      pix_key: initialData.pix_key || '',
      pix_qr_code: initialData.pix_qr_code || '',
      payment_proof_image: initialData.payment_proof_image || '',
      status_approval: initialData.status_approval || 'pending',
    }
  });

  const handleSave = async (data: FormData) => {
    setLoading(true);
    try {
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Anúncio</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da assinatura" {...field} />
                  </FormControl>
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
                    <Input placeholder="Ex: R$ 15,00 - PIX (Mensal)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PIX (Mensal)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status da Assinatura</FormLabel>
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
                      {statusOptions.map(option => (
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
            
            <FormField
              control={form.control}
              name="access"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Acesso</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de acesso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accessOptions.map(option => (
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
                      {iconOptions.map(option => (
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
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="header_color"
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
                        {headerColorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full ${option.value} mr-2`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price_color"
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
                        {priceColorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full ${option.value.replace('text-', 'bg-')} mr-2`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="whatsapp_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 5511999999999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="telegram_username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário do Telegram</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: @usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pix_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave PIX (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Chave PIX para pagamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status_approval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status de Aprovação</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status de aprovação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {approvalStatusOptions.map(option => (
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
        </div>

        {initialData.payment_proof_image && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Comprovante de Pagamento</h3>
            <div className="border rounded-md p-2">
              <img 
                src={initialData.payment_proof_image} 
                alt="Comprovante de Pagamento" 
                className="max-h-40 object-contain mx-auto"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PendingSubscriptionForm;
