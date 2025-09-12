
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DynamicSection } from '@/hooks';
import { useAgentStore } from '@/hooks/useAgentStore';
import { Badge } from '@/components/ui/badge';
import { SectionActions } from './SectionActions';
import { GitGraph } from 'lucide-react';

export const columns: ColumnDef<DynamicSection>[] = [
  {
    accessorKey: 'icon',
    header: 'Icon',
    cell: ({ row }) => {
      const { getIconComponent } = useAgentStore.getState();
      const Icon = getIconComponent(row.original.icon) || GitGraph;
      return <Icon className="h-5 w-5" />;
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      return <Badge variant="secondary" className="capitalize">{type}</Badge>;
    },
  },
  {
    accessorKey: 'agentId',
    header: 'Agent ID',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const section = row.original;
      return <SectionActions section={section} />;
    },
  },
];
