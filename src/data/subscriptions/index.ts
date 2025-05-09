
import { Subscription } from "@/types/subscriptionTypes";
import { supabase } from "@/integrations/supabase/client";

// Helper function to fetch subscriptions from Supabase
export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('added_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching subscriptions:', error);
      await logError('Error fetching subscriptions', 'fetchSubscriptions', error.code, error.message);
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    await logError('Error fetching subscriptions', 'fetchSubscriptions', error.code, error.stack);
    return [];
  }
};

// Helper function to log errors to database
export const logError = async (
  message: string, 
  context?: string, 
  errorCode?: string, 
  stackTrace?: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_error', {
      error_msg: message,
      error_ctx: context,
      error_cd: errorCode,
      stack_tr: stackTrace
    });
    
    if (error) {
      console.error("Error logging to database:", error);
    }
  } catch (err) {
    console.error("Failed to log error to database:", err);
  }
};

// Cached subscriptions for initial render
let cachedSubscriptions: Subscription[] = [];

// Function to get subscriptions (from API or cache)
export const getSubscriptions = async (forceRefresh = false): Promise<Subscription[]> => {
  if (cachedSubscriptions.length === 0 || forceRefresh) {
    cachedSubscriptions = await fetchSubscriptions();
  }
  return cachedSubscriptions;
};

// Define featured subscriptions (first 5 subscriptions)
export const getFeaturedSubscriptions = async (): Promise<Subscription[]> => {
  const allSubs = await getSubscriptions();
  // Get featured subscriptions first, then fill with regular subs if needed
  const featured = allSubs.filter(sub => sub.featured).slice(0, 5);
  
  if (featured.length < 5) {
    const regular = allSubs.filter(sub => !sub.featured).slice(0, 5 - featured.length);
    return [...featured, ...regular];
  }
  
  return featured;
};

// All other subscriptions are regular
export const getRegularSubscriptions = async (): Promise<Subscription[]> => {
  const allSubs = await getSubscriptions();
  const featured = await getFeaturedSubscriptions();
  
  // Filter out subs that are already in featured
  const featuredIds = featured.map(sub => sub.id);
  return allSubs.filter(sub => !featuredIds.includes(sub.id));
};

// Function to save subscription
export const saveSubscription = async (subscription: Subscription): Promise<{success: boolean, error?: string}> => {
  try {
    // Explicitly create a clean subscription object with only the fields we want
    const subscriptionData = {
      title: subscription.title,
      price: subscription.price,
      payment_method: subscription.payment_method,
      status: subscription.status,
      access: subscription.access,
      header_color: subscription.header_color,
      price_color: subscription.price_color,
      whatsapp_number: subscription.whatsapp_number,
      telegram_username: subscription.telegram_username,
      icon: subscription.icon,
      pix_qr_code: subscription.pix_qr_code,
      pix_key: subscription.pix_key,
      payment_proof_image: subscription.payment_proof_image,
      added_date: subscription.added_date || new Date().toLocaleDateString('pt-BR'),
      code: subscription.code,
      featured: subscription.featured || false
    };
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'id' });
      
    if (error) {
      console.error('Error saving subscription:', error);
      await logError('Error saving subscription', 'saveSubscription', error.code, error.message);
      return { success: false, error: error.message };
    }
    
    // Force refresh of cached subscriptions
    await getSubscriptions(true);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving subscription:', error);
    await logError('Error saving subscription', 'saveSubscription', error.code, error.stack);
    return { success: false, error: error.message };
  }
};

// Function to toggle subscription featured status
export const toggleFeaturedStatus = async (id: string, featured: boolean): Promise<{success: boolean, error?: string}> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ featured })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating featured status:', error);
      await logError('Error updating featured status', 'toggleFeaturedStatus', error.code, error.message);
      return { success: false, error: error.message };
    }
    
    // Force refresh of cached subscriptions
    await getSubscriptions(true);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating featured status:', error);
    await logError('Error updating featured status', 'toggleFeaturedStatus', error.code, error.stack);
    return { success: false, error: error.message };
  }
};

// Function to approve pending subscription and move it to subscriptions table
export const approvePendingSubscription = async (pendingId: string): Promise<{success: boolean, error?: string}> => {
  try {
    // Get the pending subscription
    const { data: pendingSubscription, error: fetchError } = await supabase
      .from('pending_subscriptions')
      .select('*')
      .eq('id', pendingId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching pending subscription:', fetchError);
      await logError('Error fetching pending subscription', 'approvePendingSubscription', fetchError.code, fetchError.message);
      return { success: false, error: fetchError.message };
    }
    
    if (!pendingSubscription) {
      return { success: false, error: 'Pending subscription not found' };
    }
    
    // Create a new subscription from the pending one, with explicit fields
    const newSubscription = {
      title: pendingSubscription.title,
      price: pendingSubscription.price,
      payment_method: pendingSubscription.payment_method,
      status: pendingSubscription.status,
      access: pendingSubscription.access,
      header_color: pendingSubscription.header_color,
      price_color: pendingSubscription.price_color,
      whatsapp_number: pendingSubscription.whatsapp_number,
      telegram_username: pendingSubscription.telegram_username,
      icon: pendingSubscription.icon,
      pix_qr_code: pendingSubscription.pix_qr_code,
      pix_key: pendingSubscription.pix_key,
      payment_proof_image: pendingSubscription.payment_proof_image,
      added_date: pendingSubscription.added_date || new Date().toLocaleDateString('pt-BR'),
      code: pendingSubscription.code || `SF${Math.floor(Math.random() * 9000 + 1000)}`,
      featured: false // Default to not featured
    };
    
    console.log('Creating new subscription from pending:', newSubscription);
    
    // Insert the new subscription
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert(newSubscription);
      
    if (insertError) {
      console.error('Error inserting new subscription:', insertError);
      await logError('Error inserting new subscription', 'approvePendingSubscription', insertError.code, insertError.message);
      return { success: false, error: insertError.message };
    }
    
    // Update status on the pending subscription
    const { error: updateError } = await supabase
      .from('pending_subscriptions')
      .update({
        status_approval: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', pendingId);
      
    if (updateError) {
      console.error('Error updating pending subscription:', updateError);
      await logError('Error updating pending subscription', 'approvePendingSubscription', updateError.code, updateError.message);
      return { success: false, error: updateError.message };
    }
    
    // Force refresh of cached subscriptions
    await getSubscriptions(true);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error approving pending subscription:', error);
    await logError('Error approving pending subscription', 'approvePendingSubscription', error?.name, error?.stack);
    return { success: false, error: error.message };
  }
};

// Function to remove all subscriptions and replace with new ones
export const replaceAllSubscriptions = async (
  subscriptions: Partial<Subscription>[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Begin a transaction
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
    if (deleteError) {
      console.error('Error deleting subscriptions:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    // Prepare the data with explicit fields for insertion
    const subscriptionsToInsert = subscriptions.map((sub) => ({
      title: sub.title || '',
      price: sub.price || '',
      payment_method: sub.payment_method || '',
      status: sub.status || '',
      access: sub.access || '',
      header_color: sub.header_color || 'bg-blue-600',
      price_color: sub.price_color || 'text-blue-600',
      whatsapp_number: sub.whatsapp_number || '',
      telegram_username: sub.telegram_username || '',
      icon: sub.icon || 'tv',
      pix_qr_code: sub.pix_qr_code || null,
      pix_key: sub.pix_key || null,
      payment_proof_image: sub.payment_proof_image || null,
      added_date: sub.added_date || new Date().toLocaleDateString('pt-BR'),
      code: sub.code || `SF${Math.floor(Math.random() * 9000 + 1000)}`,
      featured: sub.featured || false
    }));
    
    // Insert all new subscriptions
    if (subscriptionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionsToInsert);
        
      if (insertError) {
        console.error('Error inserting subscriptions:', insertError);
        return { success: false, error: insertError.message };
      }
    }
    
    // Force refresh cached data
    await getSubscriptions(true);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error replacing subscriptions:', error);
    return { success: false, error: error.message };
  }
};
