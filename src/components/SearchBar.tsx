
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounced } from "@/hooks/useDebounced";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use debounced hook for search
  const debouncedHandler = useDebounced((value: string) => {
    onSearch(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedHandler(value);
  };

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
