
import React from "react";
import { Search } from "lucide-react";

interface NoResultsProps {
  searchTerm: string;
}

const NoResults: React.FC<NoResultsProps> = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-center">Nenhum resultado encontrado</h2>
      <p className="text-gray-500 text-center mt-2">
        Não encontramos resultados para "{searchTerm}".
      </p>
      <p className="text-gray-500 text-center">
        Tente buscar por outro termo ou navegue pelas categorias.
      </p>
    </div>
  );
};

export default NoResults;
