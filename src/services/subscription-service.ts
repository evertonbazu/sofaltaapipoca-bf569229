
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData, PendingSubscriptionData } from '@/types/subscriptionTypes';
import { toast } from '@/components/ui/use-toast';

// Função para mapear dados do banco de dados para o formato da aplicação
function mapToSubscriptionData(data: any): SubscriptionData {
  return {
    id: data.id,
    title: data.title,
    price: data.price,
    paymentMethod: data.payment_method,
    status: data.status,
    access: data.access,
    headerColor: data.header_color,
    priceColor: data.price_color,
    whatsappNumber: data.whatsapp_number,
    telegramUsername: data.telegram_username,
    icon: data.icon,
    addedDate: data.added_date,
    featured: data.featured,
    code: data.code,
    pixKey: data.pix_key
  };
}

// Função para mapear dados da aplicação para o formato do banco de dados
function mapToDbFormat(subscription: SubscriptionData | PendingSubscriptionData) {
  return {
    title: subscription.title,
    price: subscription.price,
    payment_method: subscription.paymentMethod,
    status: subscription.status,
    access: subscription.access,
    header_color: subscription.headerColor,
    price_color: subscription.priceColor,
    whatsapp_number: subscription.whatsappNumber,
    telegram_username: subscription.telegramUsername,
    icon: subscription.icon,
    added_date: subscription.addedDate,
    featured: subscription.featured,
    code: subscription.code || undefined,
    payment_proof_image: 'paymentProofImage' in subscription ? 
      (subscription as PendingSubscriptionData).paymentProofImage : undefined,
    pix_qr_code: 'pixQrCode' in subscription ? 
      (subscription as PendingSubscriptionData).pixQrCode : undefined,
    pix_key: 'pixKey' in subscription ? subscription.pixKey : undefined,
    user_id: 'userId' in subscription ? subscription.userId : undefined
  };
}

// Obter todas as assinaturas
export async function getAllSubscriptions(): Promise<SubscriptionData[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('featured', { ascending: false });
    
    if (error) throw error;
    return data.map(mapToSubscriptionData);
  } catch (error: any) {
    console.error('Erro ao obter assinaturas:', error);
    throw error;
  }
}

// Obter assinaturas em destaque
export async function getFeaturedSubscriptions(): Promise<SubscriptionData[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('featured', true);
    
    if (error) throw error;
    return data.map(mapToSubscriptionData);
  } catch (error: any) {
    console.error('Erro ao obter assinaturas em destaque:', error);
    throw error;
  }
}

// Obter assinaturas regulares (não em destaque)
export async function getRegularSubscriptions(): Promise<SubscriptionData[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('featured', false);
    
    if (error) throw error;
    return data.map(mapToSubscriptionData);
  } catch (error: any) {
    console.error('Erro ao obter assinaturas regulares:', error);
    throw error;
  }
}

// Adicionar uma nova assinatura
export async function addSubscription(subscription: SubscriptionData): Promise<SubscriptionData> {
  try {
    // Gerar código se não fornecido
    let code = subscription.code;
    if (!code) {
      const { data: genCode, error: codeError } = await supabase.rpc('generate_subscription_code');
      if (codeError) throw codeError;
      code = genCode;
    }
    
    const newSubscription = { ...subscription, code };
    const mappedData = mapToDbFormat(newSubscription);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(mappedData)
      .select()
      .single();
    
    if (error) throw error;
    return mapToSubscriptionData(data);
  } catch (error: any) {
    console.error('Erro ao adicionar assinatura:', error);
    throw error;
  }
}

// Atualizar uma assinatura existente
export async function updateSubscription(id: string, subscription: SubscriptionData): Promise<SubscriptionData> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(mapToDbFormat(subscription))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapToSubscriptionData(data);
  } catch (error: any) {
    console.error('Erro ao atualizar assinatura:', error);
    throw error;
  }
}

// Excluir uma assinatura
export async function deleteSubscription(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao excluir assinatura:', error);
    throw error;
  }
}

// Alternar o status de destaque de uma assinatura
export async function toggleFeaturedStatus(id: string, featured: boolean): Promise<SubscriptionData> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ featured })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapToSubscriptionData(data);
  } catch (error: any) {
    console.error('Erro ao alternar status de destaque:', error);
    throw error;
  }
}

// Função para registrar erros
export async function logError(
  errorMessage: string, 
  errorContext: string = '', 
  errorCode: string = '', 
  stackTrace: string = ''
): Promise<void> {
  try {
    await supabase.rpc('log_error', {
      error_msg: errorMessage,
      error_ctx: errorContext,
      error_cd: errorCode,
      stack_tr: stackTrace
    });
  } catch (error) {
    console.error('Erro ao registrar erro:', error);
  }
}
