
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
