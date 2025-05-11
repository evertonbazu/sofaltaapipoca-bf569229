
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

type SortField = 'title' | 'price' | 'status' | 'paymentMethod' | 'telegramUsername' | 'whatsappNumber' | 'featured' | 'addedDate' | 'isMemberSubmission';
type SortDirection = 'asc' | 'desc';

interface SubscriptionTableHeaderProps {
  sortField: SortField | null;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  selectedItems: Set<string>;
  filteredSubscriptions: any[];
  selectAll: () => void;
}

const SubscriptionTableHeader: React.FC<SubscriptionTableHeaderProps> = ({
  sortField,
  sortDirection,
  handleSort,
  selectedItems,
  filteredSubscriptions,
  selectAll
}) => {

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedItems.size === filteredSubscriptions.length && filteredSubscriptions.length > 0}
              onCheckedChange={selectAll}
            />
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('title')}
        >
          Título {renderSortIndicator('title')}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => handleSort('price')}
        >
          Preço {renderSortIndicator('price')}
        </TableHead>
        <TableHead 
          className="hidden md:table-cell cursor-pointer"
          onClick={() => handleSort('status')}
        >
          Status {renderSortIndicator('status')}
        </TableHead>
        <TableHead 
          className="hidden md:table-cell cursor-pointer"
          onClick={() => handleSort('paymentMethod')}
        >
          Pagamento {renderSortIndicator('paymentMethod')}
        </TableHead>
        <TableHead 
          className="hidden md:table-cell cursor-pointer"
          onClick={() => handleSort('telegramUsername')}
        >
          Telegram {renderSortIndicator('telegramUsername')}
        </TableHead>
        <TableHead 
          className="hidden md:table-cell cursor-pointer"
          onClick={() => handleSort('whatsappNumber')}
        >
          WhatsApp {renderSortIndicator('whatsappNumber')}
        </TableHead>
        <TableHead 
          className="hidden md:table-cell cursor-pointer"
          onClick={() => handleSort('addedDate')}
        >
          Adicionado em {renderSortIndicator('addedDate')}
        </TableHead>
        <TableHead 
          className="hidden md:table-cell cursor-pointer"
          onClick={() => handleSort('featured')}
        >
          Destaque {renderSortIndicator('featured')}
        </TableHead>
        <TableHead 
          className="hidden md:table-cell cursor-pointer"
          onClick={() => handleSort('isMemberSubmission')}
        >
          Tipo {renderSortIndicator('isMemberSubmission')}
        </TableHead>
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default SubscriptionTableHeader;
