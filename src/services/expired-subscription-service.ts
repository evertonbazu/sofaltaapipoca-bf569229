
import { supabase } from '@/integrations/supabase/client';
import { ExpiredSubscriptionData, PendingSubscriptionData } from '@/types/subscriptionTypes';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Busca todas as assinaturas expiradas do usuário
 * Versão 3.1.3 - Melhorado tratamento de erros e validação de datas
 */
export const getExpiredSubscriptions = async (): Promise<ExpiredSubscriptionData[]> => {
  try {
    // Obter usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Tentativa de buscar assinaturas expiradas sem usuário logado');
      return [];
    }
    
    const { data, error } = await supabase
      .from('expired_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('expired_at', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar assinaturas expiradas:', error);
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      originalSubscriptionId: item.original_subscription_id,
      title: item.title,
      price: item.price,
      paymentMethod: item.payment_method,
      status: item.status,
      access: item.access,
      headerColor: item.header_color,
      priceColor: item.price_color,
      whatsappNumber: item.whatsapp_number,
      telegramUsername: item.telegram_username,
      icon: item.icon,
      addedDate: item.added_date,
      code: item.code,
      pixKey: item.pix_key,
      pixQrCode: item.pix_qr_code,
      paymentProofImage: item.payment_proof_image,
      expiredAt: item.expired_at,
      expiryReason: item.expiry_reason,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Erro ao buscar assinaturas expiradas:', error);
    throw error;
  }
};

/**
 * Formata uma data para o formato de exibição
 * Versão 3.1.3 - Adicionada validação de data
 */
const formatSafeDate = (date: Date | string | null): string => {
  if (!date) return format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      console.warn(`Data inválida detectada, usando data atual: ${date}`);
      return format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error(`Erro ao formatar data (${date}):`, error);
    return format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
  }
};

/**
 * Reenviar uma assinatura expirada para aprovação
 * Versão 3.1.3 - Melhorado tratamento de erros e validação de datas
 */
export const resubmitExpiredSubscription = async (expiredSubscription: ExpiredSubscriptionData): Promise<string> => {
  try {
    // Primeiro, converter para formato de assinatura pendente
    const pendingSubscription: PendingSubscriptionData = {
      title: expiredSubscription.title,
      price: expiredSubscription.price,
      paymentMethod: expiredSubscription.paymentMethod,
      status: expiredSubscription.status,
      access: expiredSubscription.access,
      headerColor: expiredSubscription.headerColor,
      priceColor: expiredSubscription.priceColor,
      whatsappNumber: expiredSubscription.whatsappNumber,
      telegramUsername: expiredSubscription.telegramUsername,
      icon: expiredSubscription.icon,
      addedDate: formatSafeDate(new Date()),
      code: expiredSubscription.code,
      pixKey: expiredSubscription.pixKey,
      statusApproval: 'pending',
      paymentProofImage: expiredSubscription.paymentProofImage,
      pixQrCode: expiredSubscription.pixQrCode
    };
    
    // Obter usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não está autenticado');
    }
    
    // Inserir na tabela de assinaturas pendentes
    const { data, error } = await supabase
      .from('pending_subscriptions')
      .insert([{
        title: pendingSubscription.title,
        price: pendingSubscription.price,
        payment_method: pendingSubscription.paymentMethod,
        status: pendingSubscription.status,
        access: pendingSubscription.access,
        header_color: pendingSubscription.headerColor,
        price_color: pendingSubscription.priceColor,
        whatsapp_number: pendingSubscription.whatsappNumber,
        telegram_username: pendingSubscription.telegramUsername,
        icon: pendingSubscription.icon,
        added_date: pendingSubscription.addedDate,
        code: pendingSubscription.code,
        pix_key: pendingSubscription.pixKey,
        status_approval: pendingSubscription.statusApproval,
        payment_proof_image: pendingSubscription.paymentProofImage,
        pix_qr_code: pendingSubscription.pixQrCode,
        user_id: user.id,
        visible: true,
        submitted_at: new Date().toISOString()
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Erro ao reenviar assinatura:', error);
      throw error;
    }
    
    // Excluir da tabela de assinaturas expiradas
    const { error: deleteError } = await supabase
      .from('expired_subscriptions')
      .delete()
      .eq('id', expiredSubscription.id);
      
    if (deleteError) {
      console.error('Erro ao excluir assinatura expirada após reenvio:', deleteError);
    }
    
    return data.id;
  } catch (error) {
    console.error('Erro ao reenviar assinatura expirada:', error);
    throw error;
  }
};
