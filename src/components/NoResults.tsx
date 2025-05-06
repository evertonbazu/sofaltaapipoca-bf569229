
import React from 'react';

interface NoResultsProps {
  searchTerm: string;
}

const NoResults: React.FC<NoResultsProps> = ({ searchTerm }) => {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <span className="text-5xl">🔎</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
      <p className="text-gray-600">
        Não encontramos nenhum serviço que corresponde à sua busca por "{searchTerm}"
      </p>
    </div>
  );
};

export default NoResults;
