
import React from "react";

/**
 * Componente centralizado para exibição da versão do site
 * @version 7.2.0 - Funcionalidade de modificação de assinaturas implementada
 */
interface VersionProps {
  className?: string;
  showPrefix?: boolean;
}

export const APP_VERSION = "7.2.0";

const Version: React.FC<VersionProps> = ({ 
  className = "text-xs text-gray-400", 
  showPrefix = true 
}) => (
  <span className={className}>
    {showPrefix ? "v" : ""}{APP_VERSION}
  </span>
);

export default Version;
