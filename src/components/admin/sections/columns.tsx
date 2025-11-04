
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { SectionActions } from './SectionActions';
import { Bot, type LucideIcon, FileText } from 'lucide-react';
import { Section } from '@/lib/models/section';
import * as Icons from 'lucide-react';

const DynamicIcon = ({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) => {
  const Icon = (Icons as any)[name];
  if (!Icon) {
    return <FileText {...props} />; // Fallback icon
  }
  return <Icon {...props} />;
};


export const columns: ColumnDef<Section>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <DynamicIcon name={row.original.icon || 'FileText'} className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.title}</span>
      </div>
    ),
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
