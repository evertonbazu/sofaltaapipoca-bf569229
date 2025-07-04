import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { toast } from '@/components/ui/use-toast';
import { sendToTelegramGroup, deleteFromTelegramGroup, isAutoPostingEnabled } from '@/utils/shareUtils';

/**
 * Version 3.1.0
 * - Adicionado suporte ao campo custom_title
 * - Corrigido problema de envio de assinaturas aprovadas para o Telegram
 * - Melhorado o fluxo de aprovação e envio automático
 */

// Função para mapear dados do banco de dados para o formato da aplicação
function mapToSubscriptionData(data: any): SubscriptionData {
  return {
    id: data.id,
    title: data.title,
    customTitle: data.custom_title,
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
    pixKey: data.pix_key,
    category: data.category,
    isMemberSubmission: data.user_id ? true : false,
    visible: data.visible
  };
}

// Função para mapear dados da aplicação para o formato do banco de dados
function mapToDbFormat(subscription: SubscriptionData) {
  return {
    title: subscription.title,
    custom_title: subscription.customTitle,
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
    pix_key: subscription.pixKey,
    user_id: subscription.userId,
    category: subscription.category,
    visible: subscription.visible
  };
}

export async function getSiteConfig(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      console.error(`Erro ao obter configuração ${key}:`, error);
      return null;
    }
    
    return data?.value || null;
  } catch (error: any) {
    console.error(`Erro ao obter configuração ${key}:`, error);
    return null;
  }
}

async function isAutoTelegramEnabled(): Promise<boolean> {
  const autoPostSetting = await getSiteConfig('auto_post_to_telegram');
  return autoPostSetting === 'true';
}

export async function getAllSubscriptions(): Promise<SubscriptionData[]> {
  try {
    console.log('Requesting ALL subscriptions from database...');
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} subscriptions from database`);
    
    if (!data || data.length === 0) {
      console.log('No subscriptions found in database');
      return [];
    }
    
    const mappedData = data.map(mapToSubscriptionData);
    console.log('Mapped data sample:', mappedData && mappedData.length > 0 ? mappedData[0] : 'No mapped data');
    return mappedData;
  } catch (error: any) {
    console.error('Erro ao obter assinaturas:', error);
    throw error;
  }
}

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

export async function getMemberSubscriptions(): Promise<SubscriptionData[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .not('user_id', 'is', null)
      .eq('visible', true);
    
    if (error) throw error;
    
    return data.map(mapToSubscriptionData);
  } catch (error: any) {
    console.error('Erro ao obter assinaturas de membros:', error);
    throw error;
  }
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('form_options')
      .select('value')
      .eq('type', 'category')
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data.map(item => item.value);
  } catch (error: any) {
    console.error('Erro ao obter categorias:', error);
    return ['Streaming', 'Música', 'Educação', 'YouTube', 'Produtividade'];
  }
}

export async function addSubscription(subscription: SubscriptionData): Promise<SubscriptionData> {
  try {
    let code = subscription.code;
    if (!code) {
      const { data: genCode, error: codeError } = await supabase.rpc('generate_subscription_code');
      if (codeError) throw codeError;
      code = genCode;
    }
    
    const newSubscription = { ...subscription, code };
    const mappedData = mapToDbFormat(newSubscription);
    
    console.log('Adicionando nova assinatura:', mappedData);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(mappedData)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar assinatura:', error);
      throw error;
    }
    
    console.log('Assinatura adicionada com sucesso:', data.id);
    
    if (data.user_id && data.visible) {
      try {
        const autoTelegramEnabled = await isAutoPostingEnabled();
        console.log('Auto posting enabled para nova assinatura:', autoTelegramEnabled);
        
        if (autoTelegramEnabled) {
          console.log('Enviando nova assinatura para o Telegram:', data.id);
          const result = await sendToTelegramGroup(data.id);
          console.log('Resultado do envio para o Telegram:', result);
        } else {
          console.log('Envio automático para o Telegram está desativado');
        }
      } catch (sharingError) {
        console.error('Erro ao compartilhar no Telegram:', sharingError);
      }
    }
    
    return mapToSubscriptionData(data);
  } catch (error: any) {
    console.error('Erro ao adicionar assinatura:', error);
    throw error;
  }
}

export async function updateSubscription(id: string, subscription: SubscriptionData): Promise<SubscriptionData> {
  try {
    const { data: oldData } = await supabase
      .from('subscriptions')
      .select('visible, user_id')
      .eq('id', id)
      .single();
    
    const wasInvisible = oldData?.visible === false;
    const isMemberSubmission = oldData?.user_id !== null;
    
    console.log('Atualizando assinatura:', id, 'Estado anterior:', { wasInvisible, isMemberSubmission });
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update(mapToDbFormat(subscription))
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar assinatura:', error);
      throw error;
    }
    
    console.log('Assinatura atualizada com sucesso:', data.id);
    
    if (wasInvisible && subscription.visible === true && isMemberSubmission) {
      try {
        const autoTelegramEnabled = await isAutoPostingEnabled();
        console.log('Auto posting enabled para atualização:', autoTelegramEnabled);
        
        if (autoTelegramEnabled) {
          console.log('Enviando assinatura atualizada para o Telegram:', id);
          const result = await sendToTelegramGroup(id);
          console.log('Resultado do envio para o Telegram:', result);
        } else {
          console.log('Envio automático para o Telegram está desativado');
        }
      } catch (sharingError) {
        console.error('Erro ao compartilhar no Telegram:', sharingError);
      }
    }
    
    return mapToSubscriptionData(data);
  } catch (error: any) {
    console.error('Erro ao atualizar assinatura:', error);
    throw error;
  }
}

export async function deleteSubscription(id: string): Promise<void> {
  try {
    try {
      console.log('Tentando excluir mensagem do Telegram para assinatura:', id);
      await deleteFromTelegramGroup(id);
    } catch (telegramError) {
      console.error('Erro ao excluir mensagem do Telegram (continuando):', telegramError);
    }
    
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

export async function toggleVisibilityStatus(id: string, visible: boolean): Promise<SubscriptionData> {
  try {
    const { data: oldData } = await supabase
      .from('subscriptions')
      .select('user_id, visible')
      .eq('id', id)
      .single();
    
    const isMemberSubmission = oldData?.user_id !== null;
    const wasInvisible = oldData?.visible === false;
    
    console.log('Alterando visibilidade:', id, 'Estado anterior:', { wasInvisible, isMemberSubmission });
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ visible })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao alternar status de visibilidade:', error);
      throw error;
    }
    
    console.log('Status de visibilidade atualizado:', data.id, 'Novo valor:', visible);
    
    if (visible === true && wasInvisible && isMemberSubmission) {
      try {
        const autoTelegramEnabled = await isAutoPostingEnabled();
        console.log('Auto posting enabled para alteração de visibilidade:', autoTelegramEnabled);
        
        if (autoTelegramEnabled) {
          console.log('Enviando assinatura agora visível para o Telegram:', id);
          const result = await sendToTelegramGroup(id);
          console.log('Resultado do envio para o Telegram:', result);
        } else {
          console.log('Envio automático para o Telegram está desativado');
        }
      } catch (sharingError) {
        console.error('Erro ao compartilhar no Telegram:', sharingError);
      }
    } else if (visible === false) {
      try {
        console.log('Tentando excluir mensagem do Telegram ao tornar invisível:', id);
        const result = await deleteFromTelegramGroup(id);
        console.log('Resultado da exclusão do Telegram:', result);
      } catch (telegramError) {
        console.error('Erro ao excluir mensagem do Telegram (continuando):', telegramError);
      }
    }
    
    return mapToSubscriptionData(data);
  } catch (error: any) {
    console.error('Erro ao alternar status de visibilidade:', error);
    throw error;
  }
}

export async function updateSiteConfig(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_configurations')
      .update({ value })
      .eq('key', key);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error(`Erro ao atualizar configuração ${key}:`, error);
    return false;
  }
}

export async function getHeaderButtons(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro ao obter botões de cabeçalho:', error);
    throw error;
  }
}

export async function addHeaderButton(buttonData: any): Promise<any> {
  try {
    const dataToInsert = {
      title: buttonData.title,
      icon: buttonData.icon,
      url: buttonData.url,
      visible: buttonData.visible,
      position: buttonData.position
    };
    
    const { data, error } = await supabase
      .from('header_buttons')
      .insert(dataToInsert)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro ao adicionar botão de cabeçalho:', error);
    throw error;
  }
}

export async function updateHeaderButton(id: string, buttonData: any): Promise<any> {
  try {
    const dataToUpdate: Record<string, any> = {};
    
    if (buttonData.title !== undefined) dataToUpdate.title = buttonData.title;
    if (buttonData.icon !== undefined) dataToUpdate.icon = buttonData.icon;
    if (buttonData.url !== undefined) dataToUpdate.url = buttonData.url;
    if (buttonData.visible !== undefined) dataToUpdate.visible = buttonData.visible;
    if (buttonData.position !== undefined) dataToUpdate.position = buttonData.position;
    
    const { data, error } = await supabase
      .from('header_buttons')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar botão de cabeçalho:', error);
    throw error;
  }
}

export async function deleteHeaderButton(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('header_buttons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao excluir botão de cabeçalho:', error);
    throw error;
  }
}

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
