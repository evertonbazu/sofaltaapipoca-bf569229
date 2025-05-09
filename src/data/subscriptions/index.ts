
import { supabase } from '@/integrations/supabase/client';
import { Subscription } from '@/types/subscriptionTypes';

/**
 * Fetch all subscriptions from the database
 */
export const getAllSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

/**
 * Fetch a single subscription by ID
 */
export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

/**
 * Create a new subscription
 */
export const createSubscription = async (subscription: Partial<Subscription>) => {
  try {
    // Ensure all required fields have values
    const requiredFields = ['title', 'price', 'payment_method', 'status', 'access', 
                           'header_color', 'price_color', 'whatsapp_number', 
                           'telegram_username', 'code'];
                           
    for (const field of requiredFields) {
      if (!subscription[field as keyof Subscription]) {
        return { success: false, error: `Missing required field: ${field}` };
      }
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription as Subscription])
      .select();

    if (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing subscription
 */
export const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a subscription by ID
 */
export const deleteSubscription = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error deleting subscription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Replace all subscriptions with a new set
 */
export const replaceAllSubscriptions = async (newSubscriptions: Subscription[]) => {
  try {
    // First delete all existing subscriptions
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .neq('id', '0'); // Use a condition that will match all rows
    
    if (deleteError) throw deleteError;
    
    // Then insert the new ones
    const { data, error: insertError } = await supabase
      .from('subscriptions')
      .insert(newSubscriptions)
      .select();
    
    if (insertError) throw insertError;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error replacing subscriptions:', error);
    return {
      success: false,
      error: error.message || 'Failed to replace subscriptions'
    };
  }
};

/**
 * Toggle featured status of a subscription
 */
export const toggleFeaturedStatus = async (id: string, featured: boolean) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ featured })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating featured status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating featured status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Log errors to database for tracking
 */
export const logError = async (
  errorMessage: string,
  errorContext?: string,
  errorCode?: string,
  stackTrace?: string
) => {
  try {
    const { data, error } = await supabase.rpc('log_error', {
      error_msg: errorMessage,
      error_ctx: errorContext,
      error_cd: errorCode,
      stack_tr: stackTrace
    });
    
    if (error) {
      console.error('Failed to log error to database:', error);
    }
    
    return data;
  } catch (err) {
    console.error('Exception when logging error:', err);
    return null;
  }
};

/**
 * Approve a pending subscription and move it to the subscriptions table
 */
export const approvePendingSubscription = async (id: string) => {
  try {
    // First, get the pending subscription
    const { data: pendingSubscription, error: fetchError } = await supabase
      .from('pending_subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!pendingSubscription) {
      throw new Error('Pending subscription not found');
    }
    
    // Create subscription object with required fields
    const newSubscription: Subscription = {
      id: undefined!, // Let the database generate a new ID
      title: pendingSubscription.title,
      price: pendingSubscription.price,
      payment_method: pendingSubscription.payment_method,
      status: pendingSubscription.status,
      access: pendingSubscription.access,
      header_color: pendingSubscription.header_color,
      price_color: pendingSubscription.price_color,
      whatsapp_number: pendingSubscription.whatsapp_number,
      telegram_username: pendingSubscription.telegram_username,
      code: pendingSubscription.code,
      icon: pendingSubscription.icon,
      pix_qr_code: pendingSubscription.pix_qr_code,
      pix_key: pendingSubscription.pix_key,
      payment_proof_image: pendingSubscription.payment_proof_image,
      user_id: pendingSubscription.user_id,
      featured: false,
      added_date: pendingSubscription.added_date
    };
    
    // Insert into subscriptions table
    const { data: insertedSubscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert([newSubscription])
      .select()
      .single();
      
    if (insertError) {
      throw insertError;
    }
    
    // Update pending subscription status
    const { error: updateError } = await supabase
      .from('pending_subscriptions')
      .update({
        status_approval: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (updateError) {
      throw updateError;
    }
    
    return {
      success: true,
      data: insertedSubscription
    };
    
  } catch (error: any) {
    console.error('Error approving pending subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to approve pending subscription'
    };
  }
};
