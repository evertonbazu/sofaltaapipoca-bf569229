
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
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

// Helper function to sort subscriptions by date (newest first)
const sortByDateDesc = (subscriptions: Subscription[]) => {
  return [...subscriptions].sort((a, b) => {
    if (!a.added_date) return 1;
    if (!b.added_date) return -1;
    
    const dateA = new Date(a.added_date).getTime();
    const dateB = new Date(b.added_date).getTime();
    
    return dateB - dateA;
  });
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
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscription, { onConflict: 'id' });
      
    if (error) {
      console.error('Error saving subscription:', error);
      return { success: false, error: error.message };
    }
    
    // Force refresh of cached subscriptions
    await getSubscriptions(true);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving subscription:', error);
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
      return { success: false, error: fetchError.message };
    }
    
    if (!pendingSubscription) {
      return { success: false, error: 'Pending subscription not found' };
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
      return { success: false, error: updateError.message };
    }
    
    // Create a new subscription from the pending one
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
      user_id: pendingSubscription.user_id,
      added_date: pendingSubscription.added_date,
      code: pendingSubscription.code,
    };
    
    // Insert the new subscription
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert(newSubscription);
      
    if (insertError) {
      console.error('Error inserting new subscription:', insertError);
      return { success: false, error: insertError.message };
    }
    
    // Force refresh of cached subscriptions
    await getSubscriptions(true);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error approving pending subscription:', error);
    return { success: false, error: error.message };
  }
};
