
import React from "react";

interface NoResultsProps {
  searchTerm?: string;
}

const NoResults: React.FC<NoResultsProps> = ({ searchTerm }) => {
  return (
    <div className="p-8 bg-white rounded-xl shadow-lg text-center">
      <p className="text-lg font-medium text-gray-700">Nenhum resultado encontrado</p>
      {searchTerm && (
        <p className="text-gray-500 mt-2">
          Não encontramos resultados para: <span className="font-medium">"{searchTerm}"</span>
        </p>
      )}
      <p className="text-gray-500 mt-2">Tente buscar por outro termo ou navegue pelas categorias disponíveis</p>
    </div>
  );
};

export default NoResults;
