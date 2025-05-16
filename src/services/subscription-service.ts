
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';

// Get user subscriptions
export const getUserSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

// This is just an alias for getUserSubscriptions for backward compatibility
export const getMemberSubscriptions = getUserSubscriptions;

// Add subscription
export const addSubscription = async (subscription: Partial<SubscriptionData>) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
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
      added_date: subscription.addedDate || new Date().toISOString(),
      featured: subscription.featured || false,
      code: subscription.code,
      pix_key: subscription.pixKey,
      user_id: subscription.userId,
      category: subscription.category,
      visible: subscription.visible !== undefined ? subscription.visible : true
    })
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

// Update subscription
export const updateSubscription = async (id: string, subscription: Partial<SubscriptionData>) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
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
      featured: subscription.featured,
      code: subscription.code,
      pix_key: subscription.pixKey,
      category: subscription.category,
      visible: subscription.visible
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

// Delete subscription
export const deleteSubscription = async (id: string) => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Toggle featured status
export const toggleFeaturedStatus = async (id: string, featured: boolean) => {
  const { error } = await supabase
    .from('subscriptions')
    .update({ featured })
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Get header buttons
export const getHeaderButtons = async () => {
  const { data, error } = await supabase
    .from('header_buttons')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Add header button
export const addHeaderButton = async (button: any) => {
  const { data, error } = await supabase
    .from('header_buttons')
    .insert(button)
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

// Update header button
export const updateHeaderButton = async (id: string, button: any) => {
  const { data, error } = await supabase
    .from('header_buttons')
    .update(button)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

// Delete header button
export const deleteHeaderButton = async (id: string) => {
  const { error } = await supabase
    .from('header_buttons')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Update site config
export const updateSiteConfig = async (config: any) => {
  const { data, error } = await supabase
    .from('site_config')
    .update(config)
    .eq('id', 1)
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

// Log error
export const logError = async (error: any) => {
  console.error('Error:', error);
  
  try {
    await supabase
      .from('error_logs')
      .insert({
        error_message: error.message || JSON.stringify(error),
        stack_trace: error.stack || '',
        resolved: false
      });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};
