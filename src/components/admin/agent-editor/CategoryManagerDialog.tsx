
'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
  DialogClose, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Pencil, Save, Trash2, PlusCircle } from 'lucide-react';
import { useAgentCategories, useCreateAgentCategory, useUpdateAgentCategory, useDeleteAgentCategory } from '@/hooks';
import type { AgentCategoryDetails } from '@/lib/models/agent';

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryManagerDialogProps {
    children?: ReactNode;
}

export function CategoryManagerDialog({ children }: CategoryManagerDialogProps) {
  const { data: categories, isLoading } = useAgentCategories();
  const createCategoryMutation = useCreateAgentCategory();
  const updateCategoryMutation = useUpdateAgentCategory();
  const deleteCategoryMutation = useDeleteAgentCategory();

  const [editingCategory, setEditingCategory] = useState<AgentCategoryDetails | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");


  const handleUpdate = (id: string, name: string) => {
    updateCategoryMutation.mutate({ id, name }, {
      onSuccess: () => setEditingCategory(null)
    });
  };

  const handleCreate = () => {
    if (!newCategoryId.trim() || !newCategoryName.trim()) return;
    createCategoryMutation.mutate({ id: newCategoryId, name: newCategoryName }, {
        onSuccess: () => {
            setNewCategoryId('');
            setNewCategoryName('');
        }
    });
  }

  const handleDelete = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Agent Categories</DialogTitle>
          <DialogDescription>Add, edit, or delete agent categories.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            <h4 className="font-medium">New Category</h4>
            <div className="flex items-center gap-2">
                <Input placeholder="new-category-id" value={newCategoryId} onChange={e => setNewCategoryId(e.target.value)} disabled={createCategoryMutation.isPending} />
                <Input placeholder="New Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} disabled={createCategoryMutation.isPending} />
                <Button onClick={handleCreate} disabled={createCategoryMutation.isPending || !newCategoryId || !newCategoryName}>
                    {createCategoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <PlusCircle className="h-4 w-4" />}
                </Button>
            </div>
        </div>

        <ScrollArea className="h-64 mt-4 border rounded-md p-2">
          <div className="space-y-2">
            {isLoading ? (
              <p>Loading categories...</p>
            ) : (
              categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted">
                  {editingCategory?.id === cat.id ? (
                    <Input
                      defaultValue={cat.name}
                      onBlur={(e) => handleUpdate(cat.id, e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') handleUpdate(cat.id, e.currentTarget.value) }}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-grow">{cat.name}</span>
                  )}
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCategory(cat)}>
                        {updateCategoryMutation.isPending && updateCategoryMutation.variables?.id === cat.id
                            ? <Loader2 className="h-4 w-4 animate-spin"/>
                            : <Pencil className="h-4 w-4" />
                        }
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                        {deleteCategoryMutation.isPending && deleteCategoryMutation.variables === cat.id
                            ? <Loader2 className="h-4 w-4 animate-spin"/>
                            : <Trash2 className="h-4 w-4 text-destructive" />
                        }
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
