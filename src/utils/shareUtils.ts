import { supabase } from "@/integrations/supabase/client";

// Function to safely convert a value to a boolean
export const toBooleanSafe = (value: any): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return !!value; // Default to false for null, undefined, 0, etc.
};

// Function to update auto_post_to_telegram setting
export const updateAutoPostingStatus = async (enabled: boolean): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('site_configurations')
      .upsert([
        { key: 'auto_post_to_telegram', value: enabled.toString(), description: 'Enable/disable automatic posting to Telegram' }
      ], { onConflict: ['key'] });

    if (error) {
      console.error('Erro ao atualizar auto_post_to_telegram:', error);
      return false;
    }

    console.log('auto_post_to_telegram atualizado com sucesso:', enabled);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar auto_post_to_telegram:', error);
    return false;
  }
};

// Application version - updated to reflect new features
export const APP_VERSION = '2.2.0';
