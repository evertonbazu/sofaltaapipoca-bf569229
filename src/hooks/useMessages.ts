
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

/**
 * Hook para gerenciar mensagens de contato
 * @version 1.0.0
 */
export const useMessages = (isAdmin: boolean = false, userId?: string) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      console.log('Buscando mensagens...');
      
      let query = supabase.from('contact_messages').select('*');
      
      // Se não for admin, filtrar apenas mensagens do usuário
      if (!isAdmin && userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        throw error;
      }

      console.log('Mensagens encontradas:', data?.length || 0);
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
      console.log('Marcando mensagem como lida:', messageId);
      
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

      console.log('Mensagem marcada como lida com sucesso');
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
      console.log('Excluindo mensagem:', messageId);
      
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Erro ao excluir mensagem:', error);
        throw error;
      }

      // Remover mensagem do estado local
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      console.log('Mensagem excluída com sucesso');
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
    }
  };

  const sendResponse = async (messageId: string, responseText: string, isAdminResponse: boolean = false) => {
    try {
      console.log('Enviando resposta para mensagem:', messageId);

      if (isAdminResponse) {
        // Admin respondendo à mensagem original
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('contact_messages')
          .update({
            response: responseText,
            responded_at: new Date().toISOString(),
            responded_by: user?.id,
            read: false, // Marcar como não lida para que o usuário veja a resposta
          })
          .eq('id', messageId);

        if (error) throw error;
      } else {
        // Usuário criando nova mensagem como resposta
        const originalMessage = messages.find(msg => msg.id === messageId);
        if (!originalMessage) {
          throw new Error('Mensagem original não encontrada');
        }

        const { error } = await supabase
          .from('contact_messages')
          .insert({
            user_id: userId,
            name: originalMessage.name,
            email: originalMessage.email,
            subject: `Re: ${originalMessage.subject}`,
            message: responseText,
            read: false,
          });

        if (error) throw error;
      }

      console.log('Resposta enviada com sucesso');
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso.",
      });

      await fetchMessages();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [isAdmin, userId]);

  return {
    messages,
    isLoading,
    fetchMessages,
    markAsRead,
    deleteMessage,
    sendResponse
  };
};
