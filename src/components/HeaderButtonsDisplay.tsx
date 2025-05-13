
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  if (isLoading || buttons.length === 0) {
    return null;
  }
  return <div className="flex flex-wrap gap-2 justify-center">
      {buttons.map(button => <Link key={button.id} to={button.url} className="flex flex-col items-center justify-center bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium py-2 px-4 transition-all duration-200 hover:-translate-y-1 text-center shadow-sm min-w-[100px] h-[70px]">
          <span className="text-xl">{button.icon}</span>
          <span className="text-xs mt-1">{button.title}</span>
        </Link>)}
    </div>;
};
export default HeaderButtonsDisplay;
