
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { SectionActions } from './SectionActions';
import { Bot } from 'lucide-react';
import { Section } from '@/lib/models/section';

export const columns: ColumnDef<Section>[] = [
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
