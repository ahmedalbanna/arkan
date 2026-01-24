'use client';

import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import Image from 'next/image';

export interface SortableFileType {
    id: string;
    preview: string;
    name: string;
}

interface SortableImageItemProps {
    file: SortableFileType;
    onRemove: (id: string) => void;
}

export function SortableImageItem({ file, onRemove }: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group aspect-square">
            <Image
                src={file.preview}
                alt={file.name}
                fill
                className="object-cover rounded-md border"
                onLoad={() => URL.revokeObjectURL(file.preview)}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex flex-col justify-between p-1">
                <div className="flex justify-between items-start">
                    <div {...attributes} {...listeners} className="cursor-grab p-1 bg-black/50 rounded-full text-white">
                        <GripVertical className="h-4 w-4" />
                    </div>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onRemove(file.id)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-white truncate bg-black/50 p-1 rounded-b-md">{file.name}</p>
            </div>
        </div>
    );
}
