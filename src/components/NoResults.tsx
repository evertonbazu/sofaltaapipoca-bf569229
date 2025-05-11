
import React from "react";

const NoResults: React.FC = () => {
  return (
    <div className="p-8 bg-white rounded-xl shadow-lg text-center">
      <p className="text-lg font-medium text-gray-700">Nenhum resultado encontrado</p>
      <p className="text-gray-500 mt-2">Tente buscar por outro termo</p>
    </div>
  );
};

export default NoResults;
