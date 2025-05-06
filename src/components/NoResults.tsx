
import React from "react";

interface NoResultsProps {
  message?: string;
  subMessage?: string;
}

const NoResults: React.FC<NoResultsProps> = ({ 
  message = "Nenhum resultado encontrado", 
  subMessage = "Tente buscar por outro termo" 
}) => {
  return (
    <div className="p-8 bg-white rounded-xl shadow-lg text-center">
      <p className="text-lg font-medium text-gray-700">{message}</p>
      <p className="text-gray-500 mt-2">{subMessage}</p>
    </div>
  );
};

export default NoResults;
