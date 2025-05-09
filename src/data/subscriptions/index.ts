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
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
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
export const replaceAllSubscriptions = async (newSubscriptions: Partial<Subscription>[]) => {
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
