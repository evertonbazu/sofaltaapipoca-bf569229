import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Plus, MessageCircle } from 'lucide-react';
import { getHeaderButtons } from '@/services/subscription-service';
interface HeaderButton {
  id: string;
  title: string;
  icon: string;
  url: string;
  visible: boolean;
  position: number;
}
const HeaderButtonsDisplay = () => {
  const [buttons, setButtons] = useState<HeaderButton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchButtons = async () => {
      try {
        const data = await getHeaderButtons();
        // Filtra apenas os botões visíveis e ordena por posição
        const visibleButtons = data.filter(button => button.visible).sort((a, b) => a.position - b.position);
        setButtons(visibleButtons);
      } catch (error) {
        console.error('Erro ao carregar botões do cabeçalho:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchButtons();
  }, []);

  // Function to render the appropriate icon based on button title
  const renderIcon = (title: string, icon: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('perfil')) {
      return <User className="h-5 w-5" />;
    }
    if (lowerTitle.includes('fale') || lowerTitle.includes('contato')) {
      return <Mail className="h-5 w-5" />;
    }
    if (lowerTitle.includes('anuncie')) {
      return <Plus className="h-5 w-5" />;
    }
    if (lowerTitle.includes('whatsapp') || lowerTitle.includes('grupo')) {
      return <MessageCircle className="h-5 w-5" />;
    }

    // Fallback to the emoji/text icon from the database
    return <span className="text-xl">{icon}</span>;
  };
  if (isLoading || buttons.length === 0) {
    return null;
  }
  return <div className="flex flex-wrap gap-2 justify-center">
      {buttons.map(button => <Link key={button.id} to={button.url} className="flex flex-col items-center justify-center bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium py-2 px-4 transition-all duration-200 hover:-translate-y-1 text-center shadow-sm w-[90px] h-[70px]">
          {renderIcon(button.title, button.icon)}
          <span className="text-xs mt-1">{button.title}</span>
        </Link>)}
    </div>;
};
export default HeaderButtonsDisplay;