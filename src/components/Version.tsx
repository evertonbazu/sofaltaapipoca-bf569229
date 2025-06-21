
import React from 'react';

/**
 * Componente centralizado para gerenciamento de versão da aplicação
 * @version 3.8.0
 */

export const APP_VERSION = "3.8.0";

interface VersionProps {
  showPrefix?: boolean;
  className?: string;
}

const Version: React.FC<VersionProps> = ({ 
  showPrefix = true, 
  className = "text-xs text-gray-400 mt-1" 
}) => {
  const versionText = showPrefix ? `v${APP_VERSION}` : APP_VERSION;
  
  return (
    <span className={className}>
      {versionText}
    </span>
  );
};

export default Version;
