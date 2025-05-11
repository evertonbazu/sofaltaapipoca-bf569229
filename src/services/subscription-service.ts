
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionData, PendingSubscriptionData } from "@/types/subscriptionTypes";

// Função para buscar todas as assinaturas
export const getAllSubscriptions = async (): Promise<SubscriptionData[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapear os dados do banco para o formato esperado pela aplicação
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      paymentMethod: item.payment_method,
      status: item.status || "Assinado",
      access: item.access,
      headerColor: item.header_color,
      priceColor: item.price_color,
      whatsappNumber: item.whatsapp_number,
      telegramUsername: item.telegram_username,
      icon: item.icon || "tv",
      addedDate: item.added_date,
      featured: item.featured,
      code: item.code,
      userId: item.user_id,
      pixKey: item.pix_key
    }));
  } catch (error) {
    console.error("Erro ao buscar assinaturas:", error);
    return [];
  }
};

// Função para buscar assinaturas em destaque
export const getFeaturedSubscriptions = async (): Promise<SubscriptionData[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapear os dados do banco para o formato esperado pela aplicação
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      paymentMethod: item.payment_method,
      status: item.status || "Assinado",
      access: item.access,
      headerColor: item.header_color,
      priceColor: item.price_color,
      whatsappNumber: item.whatsapp_number,
      telegramUsername: item.telegram_username,
      icon: item.icon || "tv",
      addedDate: item.added_date,
      featured: item.featured,
      code: item.code,
      userId: item.user_id,
      pixKey: item.pix_key
    }));
  } catch (error) {
    console.error("Erro ao buscar assinaturas em destaque:", error);
    return [];
  }
};

// Função para buscar assinaturas pendentes
export const getPendingSubscriptions = async (): Promise<PendingSubscriptionData[]> => {
  try {
    const { data, error } = await supabase
      .from('pending_subscriptions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapear os dados do banco para o formato esperado pela aplicação
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      paymentMethod: item.payment_method,
      status: item.status || "Assinado",
      access: item.access,
      headerColor: item.header_color,
      priceColor: item.price_color,
      whatsappNumber: item.whatsapp_number,
      telegramUsername: item.telegram_username,
      icon: item.icon || "tv",
      addedDate: item.added_date,
      code: item.code,
      userId: item.user_id,
      statusApproval: item.status_approval,
      paymentProofImage: item.payment_proof_image,
      pixQrCode: item.pix_qr_code,
      pixKey: item.pix_key,
      rejectionReason: item.rejection_reason,
      submitted_at: item.submitted_at
    }));
  } catch (error) {
    console.error("Erro ao buscar assinaturas pendentes:", error);
    return [];
  }
};

// Função para adicionar uma nova assinatura
export const addSubscription = async (subscriptionData: SubscriptionData): Promise<{success: boolean, id?: string, error?: any}> => {
  try {
    // Converter os dados para o formato esperado pelo banco
    const dbData = {
      title: subscriptionData.title,
      price: subscriptionData.price,
      payment_method: subscriptionData.paymentMethod,
      status: subscriptionData.status,
      access: subscriptionData.access,
      header_color: subscriptionData.headerColor,
      price_color: subscriptionData.priceColor,
      whatsapp_number: subscriptionData.whatsappNumber,
      telegram_username: subscriptionData.telegramUsername,
      icon: subscriptionData.icon,
      added_date: subscriptionData.addedDate,
      featured: subscriptionData.featured || false,
      code: subscriptionData.code,
      user_id: subscriptionData.userId,
      pix_key: subscriptionData.pixKey
    };
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(dbData)
      .select('id')
      .single();
    
    if (error) throw error;
    
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Erro ao adicionar assinatura:", error);
    return { success: false, error };
  }
};

// Função para atualizar uma assinatura existente
export const updateSubscription = async (id: string, subscriptionData: SubscriptionData): Promise<{success: boolean, error?: any}> => {
  try {
    // Converter os dados para o formato esperado pelo banco
    const dbData = {
      title: subscriptionData.title,
      price: subscriptionData.price,
      payment_method: subscriptionData.paymentMethod,
      status: subscriptionData.status,
      access: subscriptionData.access,
      header_color: subscriptionData.headerColor,
      price_color: subscriptionData.priceColor,
      whatsapp_number: subscriptionData.whatsappNumber,
      telegram_username: subscriptionData.telegramUsername,
      icon: subscriptionData.icon,
      added_date: subscriptionData.addedDate,
      featured: subscriptionData.featured,
      code: subscriptionData.code,
      user_id: subscriptionData.userId,
      pix_key: subscriptionData.pixKey,
      updated_at: new Date()
    };
    
    const { error } = await supabase
      .from('subscriptions')
      .update(dbData)
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar assinatura:", error);
    return { success: false, error };
  }
};

// Função para excluir uma assinatura
export const deleteSubscription = async (id: string): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir assinatura:", error);
    return { success: false, error };
  }
};

// Função para alternar o status de destaque de uma assinatura
export const toggleFeaturedStatus = async (id: string, featured: boolean): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ featured, updated_at: new Date() })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao alternar status de destaque:", error);
    return { success: false, error };
  }
};

// Função para registrar erros no banco de dados
export const logError = async (errorMessage: string, errorContext?: string, errorCode?: string, stackTrace?: string): Promise<{success: boolean, id?: string, error?: any}> => {
  try {
    const { data, error } = await supabase
      .rpc('log_error', { 
        error_msg: errorMessage,
        error_ctx: errorContext,
        error_cd: errorCode,
        stack_tr: stackTrace
      });
    
    if (error) throw error;
    
    return { success: true, id: data };
  } catch (error) {
    console.error("Erro ao registrar erro no log:", error);
    return { success: false, error };
  }
};

// Função para buscar botões de cabeçalho
export const getAllHeaderButtons = async () => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar botões de cabeçalho:", error);
    return [];
  }
};

// Função para adicionar um novo botão de cabeçalho
export const addHeaderButton = async (buttonData: {
  title: string;
  icon: string;
  url: string;
  visible: boolean;
  position: number;
}) => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .insert(buttonData)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, button: data };
  } catch (error) {
    console.error("Erro ao adicionar botão de cabeçalho:", error);
    return { success: false, error };
  }
};

// Função para atualizar um botão de cabeçalho existente
export const updateHeaderButton = async (id: string, buttonData: {
  title?: string;
  icon?: string;
  url?: string;
  visible?: boolean;
  position?: number;
}) => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .update({ ...buttonData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, button: data };
  } catch (error) {
    console.error("Erro ao atualizar botão de cabeçalho:", error);
    return { success: false, error };
  }
};

// Função para excluir um botão de cabeçalho
export const deleteHeaderButton = async (id: string) => {
  try {
    const { error } = await supabase
      .from('header_buttons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir botão de cabeçalho:", error);
    return { success: false, error };
  }
};
