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
      userId: item.user_id
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
      userId: item.user_id
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
      rejectionReason: item.rejection_reason,
      submitted_at: item.submitted_at
    }));
  } catch (error) {
    console.error("Erro ao buscar assinaturas pendentes:", error);
    return [];
  }
};
