
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Reply, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  response?: string;
  read: boolean;
  created_at: string;
  responded_at?: string;
  user_id?: string;
}

const responseFormSchema = z.object({
  response: z.string().min(10, { message: "Resposta deve ter pelo menos 10 caracteres" }),
});

type ResponseFormValues = z.infer<typeof responseFormSchema>;

/**
 * Página de gerenciamento de mensagens no painel administrativo
 * @version 2.0.0
 */
const Messages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      response: "",
    },
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) {
        console.error('Erro ao marcar como lida:', error);
        throw error;
      }

      // Atualizar o estado local
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );

      toast({
        title: "Sucesso",
        description: "Mensagem marcada como lida.",
      });
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a mensagem como lida.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setDeletingMessage(messageId);
      
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Remover mensagem do estado local
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem.",
        variant: "destructive",
      });
    } finally {
      setDeletingMessage(null);
    }
  };

  const onSubmitResponse = async (data: ResponseFormValues, messageId: string) => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('contact_messages')
        .update({
          response: data.response,
          responded_at: new Date().toISOString(),
          responded_by: user?.id,
          read: true,
        })
        .eq('id', messageId);

      if (error) {
        console.error('Erro ao enviar resposta:', error);
        throw error;
      }

      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
      });

      form.reset();
      setRespondingTo(null);
      fetchMessages();

    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <AdminLayout title="Gerenciar Mensagens">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Mensagens de Contato</h2>
        <p className="text-sm text-gray-500">
          Visualize e responda às mensagens enviadas pelos usuários.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando mensagens...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma mensagem encontrada.</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={!message.read ? 'border-blue-200 bg-blue-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />}
                      <Mail className="mr-2 h-4 w-4" />
                      {message.subject}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {!message.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(message.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Marcar como lida
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMessage(message.id)}
                        disabled={deletingMessage === message.id}
                      >
                        {deletingMessage === message.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      {message.read && <EyeOff className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>
                  <CardDescription>
                    De: {message.name} ({message.email}) • {formatDate(message.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Mensagem:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                    </div>

                    {message.response && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Sua Resposta:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                          {message.response}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Respondido em: {message.responded_at ? formatDate(message.responded_at) : ''}
                        </p>
                      </div>
                    )}

                    {!message.response && (
                      <div>
                        {respondingTo === message.id ? (
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => onSubmitResponse(data, message.id))} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="response"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sua Resposta</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Digite sua resposta aqui..."
                                        className="min-h-[100px]"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex gap-2">
                                <Button 
                                  type="submit" 
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Enviando...
                                    </>
                                  ) : (
                                    'Enviar Resposta'
                                  )}
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  onClick={() => {
                                    setRespondingTo(null);
                                    form.reset();
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </form>
                          </Form>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setRespondingTo(message.id)}
                          >
                            <Reply className="mr-2 h-4 w-4" />
                            Responder
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default Messages;
