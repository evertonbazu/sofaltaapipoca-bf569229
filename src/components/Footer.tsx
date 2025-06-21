
import React from "react";
import Version from "./Version";

/**
 * Componente de rodapé da aplicação
 * @version 3.8.0
 */
const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white py-3 sm:py-4">
    <div className="container mx-auto px-3 sm:px-4 text-center">
      <p className="text-sm sm:text-base">&copy; 2025 Só Falta a Pipoca. Todos os direitos reservados.</p>
      <p className="mt-1">
        <Version />
      </p>
    </div>
  </footer>
);

export default Footer;
