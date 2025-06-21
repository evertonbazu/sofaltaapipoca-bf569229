
import React from "react";

/**
 * Componente de rodapé da aplicação
 * @version 3.7.0
 */
interface FooterProps {
  appVersion: string;
}

const Footer: React.FC<FooterProps> = ({ appVersion }) => (
  <footer className="bg-gray-800 text-white py-3 sm:py-4">
    <div className="container mx-auto px-3 sm:px-4 text-center">
      <p className="text-sm sm:text-base">&copy; 2025 Só Falta a Pipoca. Todos os direitos reservados.</p>
      <p className="text-xs text-gray-400 mt-1">v{appVersion}</p>
    </div>
  </footer>
);

export default Footer;
