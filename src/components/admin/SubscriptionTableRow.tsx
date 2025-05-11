
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Star, StarOff } from 'lucide-react';
import { SubscriptionData } from '@/types/subscriptionTypes';

interface SubscriptionTableRowProps {
  subscription: SubscriptionData;
  selectedItems: Set<string>;
  toggleItemSelection: (id: string) => void;
  handleToggleFeatured: (id: string, currentStatus: boolean) => void;
  handleDeleteClick: (id: string) => void;
  navigateToEdit: (id: string) => void;
}

const SubscriptionTableRow: React.FC<SubscriptionTableRowProps> = ({
  subscription,
  selectedItems,
  toggleItemSelection,
  handleToggleFeatured,
  handleDeleteClick,
  navigateToEdit
}) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedItems.has(subscription.id!)}
            onCheckedChange={() => toggleItemSelection(subscription.id!)}
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {subscription.title}
      </TableCell>
      <TableCell>{subscription.price}</TableCell>
      <TableCell className="hidden md:table-cell">{subscription.status}</TableCell>
      <TableCell className="hidden md:table-cell">{subscription.paymentMethod}</TableCell>
      <TableCell className="hidden md:table-cell">{subscription.telegramUsername || '-'}</TableCell>
      <TableCell className="hidden md:table-cell">{subscription.whatsappNumber || '-'}</TableCell>
      <TableCell className="hidden md:table-cell">{subscription.addedDate || '-'}</TableCell>
      <TableCell className="hidden md:table-cell">
        {subscription.featured ? 'Sim' : 'Não'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {subscription.isMemberSubmission ? 
          <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">Membro</Badge> : 
          <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">Admin</Badge>}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleToggleFeatured(subscription.id!, subscription.featured || false)}
            title={subscription.featured ? "Remover destaque" : "Destacar"}
          >
            {subscription.featured ? (
              <StarOff className="h-4 w-4" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateToEdit(subscription.id!)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDeleteClick(subscription.id!)}
            className="text-red-500 hover:text-red-700"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubscriptionTableRow;
