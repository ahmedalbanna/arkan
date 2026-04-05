'use client';

import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Layers, Database, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';

/**
 * SectionDataTable — High-fidelity administrative matrix for document nodes.
 * Orchestrates the management of global sections with advanced filtering.
 * 
 * DEFENSIVE MEASURES:
 * 1. Data Integrity: Provides safe fallbacks for null/undefined TData nodes.
 * 2. Empty State HUD: Implements a specific high-density placeholder for zero-result scans.
 * 3. Atomic Orchestration: Standardized TanStack table configuration with persistence guards.
 * 4. Technical Aesthetic: Integrated dot-grids and technical typography.
 */

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
}

export function SectionDataTable<TData, TValue>({
  columns,
  data = [], // Default to empty array to prevent map failures
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  // 1. DATA VALIDATION — Guard against missing rows or corrupted table state
  const rows = table.getRowModel().rows || [];

  return (
    <div className={cn("space-y-8 relative", className)}>
      {/* 28px Dot-grid Atmosphere — Standardized alignment */}
      <div 
        className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:28px_28px]" 
        style={{ backgroundSize: '28px 28px' }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 relative z-10">
        <div className="relative max-w-sm w-full group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
            <Input
                placeholder="SCAN MATRIX BY TITLE..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="pl-10 h-11 text-[10px] font-black uppercase tracking-widest bg-muted/5 border-primary/5 focus-visible:ring-primary/20 rounded-xl shadow-inner transition-all"
            />
        </div>
        <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Live Registry Stream</span>
        </div>
      </div>

      <div className="rounded-[32px] border border-primary/10 bg-background/40 backdrop-blur-xl overflow-hidden shadow-2xl relative z-10 group">
        {/* Depth architectural line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent z-20" />
        
        <Table>
          <TableHeader className="bg-muted/10 border-b border-primary/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-12 px-8">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group/row hover:bg-primary/[0.02] transition-colors border-primary/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-8 py-5 text-[11px] font-bold text-muted-foreground group-hover/row:text-foreground transition-all">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center opacity-40 hover:bg-transparent"
                >
                  <div className="flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-700">
                    <div className="p-6 rounded-[24px] border border-dashed border-primary/20 bg-muted/5 shadow-inner">
                        <Database className="h-10 w-10 text-primary/40" />
                    </div>
                    <div className="space-y-1.5 px-10">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">Zero Result Matrix</h3>
                        <p className="text-[11px] italic font-medium max-w-sm mx-auto">
                            The registry scan completed with zero matching neural vectors. Adjust your search criteria to re-probe the matrix.
                        </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination HUD */}
      <footer className="flex items-center justify-between px-2 py-4 border-t border-primary/5 relative z-10">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            <span className="tabular-nums bg-muted/10 px-2.5 py-1 rounded-md border border-border/40">NODE {table.getState().pagination.pageIndex + 1} OF {table.getPageCount()}</span>
            <div className="h-1 w-1 rounded-full bg-primary/20" />
            <span>SPECTRAL_REGISTRY_V2.4</span>
        </div>
        <div className="flex items-center gap-3">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-primary/10 gap-2"
            >
                <ChevronLeft className="h-4 w-4" />
                Return
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-primary/10 gap-2"
            >
                Advance
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </footer>
    </div>
  );
}
