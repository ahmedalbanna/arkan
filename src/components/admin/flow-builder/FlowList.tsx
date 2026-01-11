/**
 * Flow List Component
 * 
 * List and manage all flows with filtering, sorting, and actions.
 */

'use client';

import React, { useState } from 'react';
import { FlowConfiguration, FlowStatus } from '@/lib/models/flow-config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Play,
  Archive,
  RotateCcw,
  Filter,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FlowListProps {
  flows: FlowConfiguration[];
  onFlowSelect?: (flow: FlowConfiguration) => void;
  onFlowCreate?: () => void;
  onFlowEdit?: (flow: FlowConfiguration) => void;
  onFlowDelete?: (flowId: string) => void;
  onFlowDuplicate?: (flow: FlowConfiguration) => void;
  onFlowTest?: (flow: FlowConfiguration) => void;
  onFlowArchive?: (flowId: string) => void;
  onFlowRestore?: (flowId: string) => void;
}

export function FlowList({
  flows,
  onFlowSelect,
  onFlowCreate,
  onFlowEdit,
  onFlowDelete,
  onFlowDuplicate,
  onFlowTest,
  onFlowArchive,
  onFlowRestore,
}: FlowListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FlowStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  // Filter flows
  const filteredFlows = flows.filter((flow) => {
    const matchesSearch =
      searchQuery === '' ||
      flow.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || flow.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(flows.map((f) => f.category)));

  const getStatusColor = (status: FlowStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Flows</h2>
          <p className="text-sm text-muted-foreground">
            {filteredFlows.length} of {flows.length} flows
          </p>
        </div>
        {onFlowCreate && (
          <Button onClick={onFlowCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Flow
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Status
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {statusFilter}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
              Archived
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Category
              {categoryFilter !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {categoryFilter}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Flow Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFlows.map((flow) => (
              <TableRow
                key={flow.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onFlowSelect?.(flow)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{flow.displayName}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {flow.description}
                    </div>
                    {flow.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {flow.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{flow.category}</Badge>
                </TableCell>
                <TableCell>{flow.steps.length}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(flow.status)}>{flow.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{flow.version}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {flow.updatedAt
                    ? formatDistanceToNow(new Date(flow.updatedAt.seconds * 1000), {
                        addSuffix: true,
                      })
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onFlowEdit && (
                        <DropdownMenuItem onClick={() => onFlowEdit(flow)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onFlowTest && (
                        <DropdownMenuItem onClick={() => onFlowTest(flow)}>
                          <Play className="w-4 h-4 mr-2" />
                          Test
                        </DropdownMenuItem>
                      )}
                      {onFlowDuplicate && (
                        <DropdownMenuItem onClick={() => onFlowDuplicate(flow)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {flow.status === 'archived' ? (
                        onFlowRestore && (
                          <DropdownMenuItem onClick={() => onFlowRestore(flow.id!)}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore
                          </DropdownMenuItem>
                        )
                      ) : (
                        onFlowArchive && (
                          <DropdownMenuItem onClick={() => onFlowArchive(flow.id!)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )
                      )}
                      {onFlowDelete && (
                        <DropdownMenuItem
                          onClick={() => onFlowDelete(flow.id!)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {filteredFlows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No flows found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
