
import { supabase } from '@/integrations/supabase/client';

interface HeaderButton {
  id: string;
  title: string;
  icon: string;
  url: string;
  visible: boolean;
  position: number;
}

// Buscar todos os botões
export const getAllButtons = async (): Promise<HeaderButton[]> => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .select('*')
      .order('position');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar botões:', error);
    throw error;
  }
};

// Buscar apenas botões visíveis
export const getVisibleButtons = async (): Promise<HeaderButton[]> => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .select('*')
      .eq('visible', true)
      .order('position');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar botões visíveis:', error);
    throw error;
  }
};

// Buscar um botão específico
export const getButtonById = async (id: string): Promise<HeaderButton | null> => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar botão:', error);
    throw error;
  }
};

// Criar um novo botão
export const createButton = async (buttonData: Omit<HeaderButton, 'id'>): Promise<HeaderButton> => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .insert(buttonData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar botão:', error);
    throw error;
  }
};

// Atualizar um botão existente
export const updateButton = async (id: string, buttonData: Partial<HeaderButton>): Promise<HeaderButton> => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .update(buttonData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar botão:', error);
    throw error;
  }
};

// Excluir um botão
export const deleteButton = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('header_buttons')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Erro ao excluir botão:', error);
    throw error;
  }
};

// Alternar visibilidade de um botão
export const toggleButtonVisibility = async (id: string, visible: boolean): Promise<HeaderButton> => {
  try {
    const { data, error } = await supabase
      .from('header_buttons')
      .update({ visible })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Erro ao alternar visibilidade do botão:', error);
    throw error;
  }
};

// Inicializar botões padrão
export const initializeDefaultButtons = async (): Promise<void> => {
  try {
    const { count, error } = await supabase
      .from('header_buttons')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    // Se não houver botões, cria os padrões
    if (count === 0) {
      const defaultButtons = [
        {
          title: 'Quer anunciar aqui?',
          icon: '📢',
          url: '/submit-subscription',
          visible: true,
          position: 1
        },
        {
          title: 'Fale Conosco',
          icon: '💬',
          url: 'https://wa.me/5513992077804',
          visible: true,
          position: 2
        },
        {
          title: 'Meu Perfil',
          icon: '👤',
          url: '/profile',
          visible: true,
          position: 3
        }
      ];

      await supabase
        .from('header_buttons')
        .insert(defaultButtons);
    }
  } catch (error) {
    console.error('Erro ao inicializar botões:', error);
  }
};
