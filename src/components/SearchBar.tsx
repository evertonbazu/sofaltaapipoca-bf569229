
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  // Inicializar a busca com string vazia quando o componente for montado
  useEffect(() => {
    onSearch("");
    
    return () => {
      // Clean up quando componente é desmontado
      onSearch("");
    };
  }, [onSearch]);

  return (
    <div className="relative mb-6 w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar assinaturas..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="pl-10 py-2 w-full bg-white bg-opacity-90 focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
};

export default SearchBar;
