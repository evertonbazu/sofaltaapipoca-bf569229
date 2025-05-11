
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';

// Get all subscriptions
export const getAllSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('title');
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

// Get featured subscriptions
export const getFeaturedSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('featured', true)
      .order('title');
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching featured subscriptions:', error);
    return [];
  }
};

// Toggle featured status of a subscription
export const toggleFeaturedStatus = async (id: string, isFeatured: boolean) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ featured: isFeatured })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error toggling featured status:', error);
    throw error;
  }
};

// Get pending subscriptions
export const getPendingSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('pending_subscriptions')
      .select('*')
      .order('submitted_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching pending subscriptions:', error);
    throw error;
  }
};

// Add new subscription
export const addSubscription = async (subscription: SubscriptionData) => {
  try {
    // Map the frontend property names to the database column names
    const dbSubscription = {
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
      code: await generateSubscriptionCode(),
      pix_key: subscription.pixKey
    };
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([dbSubscription])
      .select();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

// Update subscription
export const updateSubscription = async (
  id: string, 
  subscription: SubscriptionData, 
  tableName: string = 'subscriptions'
) => {
  try {
    // Map the frontend property names to the database column names
    const dbSubscription = {
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
      pix_key: subscription.pixKey
    };
    
    const { data, error } = await supabase
      .from(tableName)
      .update(dbSubscription)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating subscription in ${tableName}:`, error);
    throw error;
  }
};

// Delete subscription
export const deleteSubscription = async (id: string, isPending: boolean = false) => {
  try {
    const table = isPending ? 'pending_subscriptions' : 'subscriptions';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting subscription from ${isPending ? 'pending_subscriptions' : 'subscriptions'}:`, error);
    throw error;
  }
};

// Approve pending subscription
export const approvePendingSubscription = async (id: string) => {
  try {
    // First, get the pending subscription
    const { data: pendingData, error: fetchError } = await supabase
      .from('pending_subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!pendingData) {
      throw new Error('Pending subscription not found');
    }
    
    // Map the pending subscription to a regular subscription
    const subscriptionData = {
      title: pendingData.title,
      price: pendingData.price,
      payment_method: pendingData.payment_method,
      status: pendingData.status,
      access: pendingData.access,
      header_color: pendingData.header_color,
      price_color: pendingData.price_color,
      whatsapp_number: pendingData.whatsapp_number,
      telegram_username: pendingData.telegram_username,
      icon: pendingData.icon,
      pix_qr_code: pendingData.pix_qr_code,
      pix_key: pendingData.pix_key,
      payment_proof_image: pendingData.payment_proof_image,
      added_date: pendingData.added_date || new Date().toLocaleDateString('pt-BR'),
      code: pendingData.code,
      user_id: pendingData.user_id
    };
    
    // Insert into subscriptions
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert([subscriptionData]);
    
    if (insertError) throw insertError;
    
    // Update status of pending subscription
    const { error: updateError } = await supabase
      .from('pending_subscriptions')
      .update({ 
        status_approval: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error approving subscription:', error);
    throw error;
  }
};

// Reject pending subscription
export const rejectPendingSubscription = async (id: string, reason: string) => {
  try {
    const { error } = await supabase
      .from('pending_subscriptions')
      .update({ 
        status_approval: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error rejecting subscription:', error);
    throw error;
  }
};

// Generate subscription code
export const generateSubscriptionCode = async () => {
  try {
    const { data, error } = await supabase.rpc('generate_subscription_code');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error generating subscription code:', error);
    // Fallback to a random code if the RPC fails
    return `SF${Math.floor(1000 + Math.random() * 9000)}`;
  }
};

// Log error
export const logError = async (errorMessage: string, errorContext?: string, errorCode?: string, stackTrace?: string) => {
  try {
    await supabase.rpc('log_error', {
      error_msg: errorMessage,
      error_ctx: errorContext,
      error_cd: errorCode,
      stack_tr: stackTrace
    });
  } catch (error) {
    console.error('Error logging to database:', error);
  }
};
