
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.user) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        setIsLoading(true);
        
        // Buscar mensagens do usuário que têm resposta e não foram lidas pelo usuário
        const { data, error } = await supabase
          .from('contact_messages')
          .select('id, response, responded_at, read')
          .eq('user_id', authState.user.id)
          .not('response', 'is', null)
          .eq('read', false);

        if (error) {
          console.error('Erro ao buscar mensagens não lidas:', error);
          setUnreadCount(0);
          return;
        }

        // Contar mensagens com resposta não lidas
        const unreadResponses = data?.length || 0;
        setUnreadCount(unreadResponses);
        console.log('Mensagens não lidas encontradas:', unreadResponses);
      } catch (error) {
        console.error('Erro ao buscar mensagens não lidas:', error);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // Configurar real-time updates para mensagens
    const channel = supabase
      .channel('contact_messages_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_messages',
          filter: `user_id=eq.${authState.user.id}`,
        },
        () => {
          console.log('Mudança detectada nas mensagens, atualizando contagem...');
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState.user]);

  return { unreadCount, isLoading };
};
