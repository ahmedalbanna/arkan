/**
 * Prompt List Component
 * 
 * List and manage all prompt templates with filtering, sorting, and actions.
 */

'use client';

import React, { useState } from 'react';
import { PromptConfiguration } from '@/lib/models/prompt-config';
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
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PromptListProps {
  prompts: PromptConfiguration[];
  onPromptSelect?: (prompt: PromptConfiguration) => void;
  onPromptCreate?: () => void;
  onPromptEdit?: (prompt: PromptConfiguration) => void;
  onPromptDelete?: (promptId: string) => void;
  onPromptDuplicate?: (prompt: PromptConfiguration) => void;
  onPromptTest?: (prompt: PromptConfiguration) => void;
  onPromptArchive?: (promptId: string) => void;
  onPromptRestore?: (promptId: string) => void;
}

export function PromptList({
  prompts,
  onPromptSelect,
  onPromptCreate,
  onPromptEdit,
  onPromptDelete,
  onPromptDuplicate,
  onPromptTest,
  onPromptArchive,
  onPromptRestore,
}: PromptListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  // Filter prompts
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      searchQuery === '' ||
      prompt.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(prompts.map((p) => p.category)));

  const getStatusColor = (status: string) => {
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
          <h2 className="text-lg font-semibold">Prompt Templates</h2>
          <p className="text-sm text-muted-foreground">
            {filteredPrompts.length} of {prompts.length} prompts
          </p>
        </div>
        {onPromptCreate && (
          <Button onClick={onPromptCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Prompt
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
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

      {/* Prompt Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrompts.map((prompt) => (
              <TableRow
                key={prompt.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onPromptSelect?.(prompt)}
              >
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{prompt.displayName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {prompt.description}
                    </div>
                    {prompt.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {prompt.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{prompt.category}</Badge>
                </TableCell>
                <TableCell>{prompt.variables.length}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(prompt.status)}>{prompt.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{prompt.version}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {prompt.updatedAt
                    ? formatDistanceToNow(new Date(prompt.updatedAt.seconds * 1000), {
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
                      {onPromptEdit && (
                        <DropdownMenuItem onClick={() => onPromptEdit(prompt)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onPromptTest && (
                        <DropdownMenuItem onClick={() => onPromptTest(prompt)}>
                          <Play className="w-4 h-4 mr-2" />
                          Test
                        </DropdownMenuItem>
                      )}
                      {onPromptDuplicate && (
                        <DropdownMenuItem onClick={() => onPromptDuplicate(prompt)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {prompt.status === 'archived' ? (
                        onPromptRestore && (
                          <DropdownMenuItem onClick={() => onPromptRestore(prompt.id!)}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore
                          </DropdownMenuItem>
                        )
                      ) : (
                        onPromptArchive && (
                          <DropdownMenuItem onClick={() => onPromptArchive(prompt.id!)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )
                      )}
                      {onPromptDelete && (
                        <DropdownMenuItem
                          onClick={() => onPromptDelete(prompt.id!)}
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

            {filteredPrompts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No prompts found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
