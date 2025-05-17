import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
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

// Obter todas as assinaturas sem filtros ou restrições
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

// Obter assinaturas de membros (criadas por usuários)
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

// Obter todas as categorias disponíveis
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
    return ['Streaming', 'Música', 'Educação', 'YouTube', 'Produtividade']; // Categorias padrão
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

// Alternar o status de visibilidade de uma assinatura
export async function toggleVisibilityStatus(id: string, visible: boolean): Promise<SubscriptionData> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ visible })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapToSubscriptionData(data);
  } catch (error: any) {
    console.error('Erro ao alternar status de visibilidade:', error);
    throw error;
  }
}

// Obter configuração do site pelo chave
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

// Atualizar configuração do site
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

// Funções para o gerenciamento de botões do cabeçalho
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
    // Ensure buttonData has all required fields
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
    // Only include defined fields to avoid null values overwriting existing data
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
