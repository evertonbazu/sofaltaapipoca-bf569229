
import React, { useRef, useState, useCallback } from 'react';
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
  const [columnWidths, setColumnWidths] = useState<number[]>(columns.map(col => col.width));
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setResizingIndex(index);
    setStartX(e.clientX);
    setStartWidth(columnWidths[index]);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingIndex === null) return;
    
    const minWidth = columns[resizingIndex].minWidth || 50;
    const delta = e.clientX - startX;
    const newWidth = Math.max(startWidth + delta, minWidth);
    
    setColumnWidths(prev => {
      const newWidths = [...prev];
      newWidths[resizingIndex as number] = newWidth;
      return newWidths;
    });
  }, [resizingIndex, startX, startWidth, columns]);
  
  const handleMouseUp = useCallback(() => {
    setResizingIndex(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  return (
    <div className={`border rounded-md overflow-auto ${className}`}>
      <Table ref={tableRef} className="relative w-full">
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead 
                key={column.name} 
                className="relative"
                style={{ width: `${columnWidths[index]}px` }}
              >
                <div className="flex items-center justify-between">
                  <div>{column.label}</div>
                  <div
                    className="absolute right-0 top-0 h-full w-4 cursor-col-resize group"
                    onMouseDown={(e) => handleMouseDown(e, index)}
                  >
                    <div className="absolute right-1 h-full w-1 group-hover:bg-gray-400 transition-colors" />
                  </div>
                </div>
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
