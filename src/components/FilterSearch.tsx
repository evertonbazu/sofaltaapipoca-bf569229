
import React, { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getAllCategories } from "@/services/subscription-service";

interface FilterSearchProps {
  onCategoryClick: (category: string) => void;
}

const FilterSearch: React.FC<FilterSearchProps> = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch categories quando o componente montar
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 px-4 py-2 bg-white">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Categorias</h4>
            <p className="text-sm text-muted-foreground">
              Selecione uma categoria para filtrar as assinaturas
            </p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    onCategoryClick(category);
                    setIsOpen(false);
                  }}
                >
                  {category}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Carregando categorias...</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterSearch;
