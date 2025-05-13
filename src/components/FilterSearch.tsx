import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
interface FilterSearchProps {
  onFilter: (searchTerm: string) => void;
}
const FilterSearch: React.FC<FilterSearchProps> = ({
  onFilter
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilter(value);
  };
  const clearSearch = () => {
    setSearchTerm("");
    onFilter("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  return <div className="relative mb-6 w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      
      {searchTerm && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Limpar busca">
          <X className="h-4 w-4" />
        </button>}
    </div>;
};
export default FilterSearch;