import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';

// Função para obter as configurações do site do Supabase
export const getSiteConfig = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`Erro ao buscar configuração para ${key}:`, error);
      return null;
    }

    return data ? data.value : null;
  } catch (error) {
    console.error(`Erro ao buscar configuração para ${key}:`, error);
    return null;
  }
};

// Função para obter os botões do cabeçalho do Supabase
export const getHeaderButtons = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Erro ao buscar botões do cabeçalho:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar botões do cabeçalho:', error);
    return [];
  }
};

// Função para obter todas as assinaturas do Supabase
export const getAllSubscriptions = async (): Promise<SubscriptionData[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('added_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar assinaturas:', error);
      return [];
    }

    return data.map(sub => ({
      id: sub.id,
      title: sub.title,
      price: sub.price,
      paymentMethod: sub.payment_method,
      status: sub.status,
      access: sub.access,
      headerColor: sub.header_color || 'bg-blue-600',
      priceColor: sub.price_color || 'text-blue-600',
      whatsappNumber: sub.whatsapp_number,
      telegramUsername: sub.telegram_username,
      icon: sub.icon || 'monitor',
      addedDate: sub.added_date || new Date(sub.created_at).toLocaleDateString('pt-BR'),
      isMemberSubmission: false,
      featured: sub.featured || false
    }));
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    return [];
  }
};

// Função para obter assinaturas em destaque do Supabase
export const getFeaturedSubscriptions = async (): Promise<SubscriptionData[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('featured', true)
      .order('added_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar assinaturas em destaque:', error);
      return [];
    }

    return data.map(sub => ({
      id: sub.id,
      title: sub.title,
      price: sub.price,
      paymentMethod: sub.payment_method,
      status: sub.status,
      access: sub.access,
      headerColor: sub.header_color || 'bg-blue-600',
      priceColor: sub.price_color || 'text-blue-600',
      whatsappNumber: sub.whatsapp_number,
      telegramUsername: sub.telegram_username,
      icon: sub.icon || 'monitor',
      addedDate: sub.added_date || new Date(sub.created_at).toLocaleDateString('pt-BR'),
      isMemberSubmission: false,
      featured: sub.featured || false
    }));
  } catch (error) {
    console.error('Erro ao buscar assinaturas em destaque:', error);
    return [];
  }
};

// Update the function to get user subscriptions with proper date format
export const getUserSubscriptions = async (userId: string): Promise<SubscriptionData[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
    
    return data.map(sub => ({
      id: sub.id,
      title: sub.title,
      price: sub.price,
      paymentMethod: sub.payment_method,
      status: sub.status,
      access: sub.access,
      headerColor: sub.header_color || 'bg-blue-600',
      priceColor: sub.price_color || 'text-blue-600',
      whatsappNumber: sub.whatsapp_number,
      telegramUsername: sub.telegram_username,
      icon: sub.icon || 'monitor',
      addedDate: sub.added_date || new Date(sub.created_at).toLocaleDateString('pt-BR'),
      isMemberSubmission: true,
      featured: sub.featured || false
    }));
  } catch (error) {
    console.error('Error in getUserSubscriptions:', error);
    return [];
  }
};

// Função para obter todas as categorias do Supabase
export const getAllCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }

    // Extrai apenas os nomes das categorias
    const categoryNames = data.map(category => category.name);
    return categoryNames;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};
