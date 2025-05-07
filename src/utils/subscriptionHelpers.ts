
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

/**
 * Creates an example subscription in the database
 * This is for demonstration purposes only
 */
export const createExampleSubscription = async (userId: string) => {
  try {
    // Format today's date as DD/MM/YYYY
    const today = new Date();
    const formattedDate = format(today, 'dd/MM/yyyy');

    // Create a new pending subscription
    const { data, error } = await supabase
      .from('pending_subscriptions')
      .insert({
        user_id: userId,
        title: 'EXEMPLO NETFLIX',
        price: 'R$ 15,00',
        payment_method: 'PIX (Mensal)',
        status: 'Assinado (2 vagas)',
        access: 'LOGIN E SENHA', 
        whatsapp_number: '5511999999999',
        telegram_username: '@usuario_teste',
        header_color: 'bg-red-600',
        price_color: 'text-red-600',
        added_date: formattedDate,
        status_approval: 'pending',
        pix_key: 'exemplo@email.com'
      })
      .select();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error creating example subscription:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates an approved subscription in the database (admin only)
 * This bypasses the approval process
 */
export const createApprovedSubscription = async (adminUserId: string) => {
  try {
    // First check if the user is an admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminUserId)
      .single();
      
    if (profileError) throw profileError;
    if (profileData.role !== 'admin') {
      throw new Error('Only admins can create approved subscriptions');
    }
    
    // Format today's date as DD/MM/YYYY
    const today = new Date();
    const formattedDate = format(today, 'dd/MM/yyyy');

    // Create a new subscription directly in the approved subscriptions table
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: adminUserId,
        title: 'NETFLIX PREMIUM',
        price: 'R$ 25,00',
        payment_method: 'PIX (Mensal)',
        status: 'Assinado (2 vagas)',
        access: 'LOGIN E SENHA',
        whatsapp_number: '5511999999999',
        telegram_username: '@admin_teste',
        header_color: 'bg-red-600',
        price_color: 'text-red-600',
        added_date: formattedDate,
        featured: false
      })
      .select();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error creating approved subscription:", error);
    return { success: false, error: error.message };
  }
};
