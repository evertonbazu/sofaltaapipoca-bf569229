
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ContactMessage {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface MessageReply {
  id: string;
  message_id: string;
  admin_id: string;
  reply_text: string;
  created_at: string;
  admin_name?: string; // Derived field
}

export const submitContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'read' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error submitting contact message:', error);
    toast({
      title: "Erro",
      description: "Não foi possível enviar sua mensagem. Por favor, tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getUserMessages = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user messages:', error);
    return [];
  }
};

export const getMessageReplies = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('message_replies')
      .select('*, profiles:admin_id(username)')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Format the data to include admin_name
    return data.map(reply => ({
      ...reply,
      admin_name: reply.profiles?.username || 'Admin'
    })) || [];
  } catch (error) {
    console.error('Error fetching message replies:', error);
    return [];
  }
};

export const markMessageAsRead = async (messageId: string, isRead: boolean = true) => {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: isRead })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
};

// Admin functions
export const getAllMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all messages:', error);
    return [];
  }
};

export const replyToMessage = async (messageId: string, adminId: string, replyText: string) => {
  try {
    const { data, error } = await supabase
      .from('message_replies')
      .insert({
        message_id: messageId,
        admin_id: adminId,
        reply_text: replyText
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error replying to message:', error);
    toast({
      title: "Erro",
      description: "Não foi possível enviar a resposta. Por favor, tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getUnreadMessagesCount = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_unread_messages_count');

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error getting unread messages count:', error);
    return 0;
  }
};

export const getUserUnreadRepliesCount = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_unread_replies_count', { user_id: userId });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error getting user unread replies count:', error);
    return 0;
  }
};
