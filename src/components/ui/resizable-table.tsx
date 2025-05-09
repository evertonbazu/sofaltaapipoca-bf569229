
import React, { useRef, useState } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResizableTableColumnProps {
  name: string;
  label: React.ReactNode;
  width: number;
  minWidth?: number;
}

interface ResizableTableProps {
  columns: ResizableTableColumnProps[];
  children: React.ReactNode;
  className?: string;
}

export const ResizableTable: React.FC<ResizableTableProps> = ({
  columns,
  children,
  className = "",
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  
  return (
    <div className={`border rounded-md overflow-auto ${className}`}>
      <Table ref={tableRef} className="relative w-full">
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead 
                key={column.name} 
                className="relative"
                style={{ width: `${column.width}px` }}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResizableTable;
