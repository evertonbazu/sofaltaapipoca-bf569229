
import React from "react";

/**
 * Componente centralizado para exibição da versão do site
 * @version 3.8.0
 */
interface VersionProps {
  className?: string;
  showPrefix?: boolean;
}

export const APP_VERSION = "3.8.0";

const Version: React.FC<VersionProps> = ({ 
  className = "text-xs text-gray-400", 
  showPrefix = true 
}) => (
  <span className={className}>
    {showPrefix ? "v" : ""}{APP_VERSION}
  </span>
);

export default Version;
