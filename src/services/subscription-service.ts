
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionData, PendingSubscriptionData } from "@/types/subscriptionTypes";
import { subscriptions } from "@/data/subscriptions"; // Import dummy data

// Get all subscriptions
export async function getAllSubscriptions(): Promise<SubscriptionData[]> {
  try {
    // First try to get data from Supabase
    const { data, error } = await supabase.from('subscriptions').select('*');
    
    if (error) {
      console.error('Error fetching subscriptions from Supabase:', error);
      // Fall back to static data if there's an error
      return subscriptions;
    }
    
    if (data && data.length > 0) {
      // Map DB column names to our frontend property names
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        paymentMethod: item.payment_method,
        status: item.status,
        access: item.access,
        headerColor: item.header_color,
        priceColor: item.price_color,
        whatsappNumber: item.whatsapp_number,
        telegramUsername: item.telegram_username,
        icon: item.icon,
        addedDate: item.added_date,
        featured: item.featured,
        code: item.code,
        userId: item.user_id,
        pixKey: item.pix_key,
        category: item.category || "Outras",
        description: item.description
      }));
    }
    
    // Fall back to static data if no data from Supabase
    return subscriptions;
  } catch (error) {
    console.error('Error in getAllSubscriptions:', error);
    // Fall back to static data
    return subscriptions;
  }
}

// Get all categories
export async function getAllCategories(): Promise<string[]> {
  try {
    // Try to get data from Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      // Fall back to extracting categories from static data
      const categories = [...new Set(subscriptions.map(sub => sub.category || "Outras"))];
      return categories;
    }
    
    if (data && data.length > 0) {
      // Extract unique categories
      return [...new Set(data.map(item => item.category))].filter(Boolean);
    }
    
    // Fall back to static data if no data from Supabase
    const categories = [...new Set(subscriptions.map(sub => sub.category || "Outras"))];
    return categories;
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    // Fall back to extracting categories from static data
    const categories = [...new Set(subscriptions.map(sub => sub.category || "Outras"))];
    return categories;
  }
}

// Get all header buttons
export async function getAllHeaderButtons() {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching header buttons:', error);
    return [];
  }
}

// Delete a subscription
export async function deleteSubscription(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

// Toggle featured status
export async function toggleFeaturedStatus(id: string, featured: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ featured })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error toggling featured status:', error);
    throw error;
  }
}

// Add more service functions as needed
