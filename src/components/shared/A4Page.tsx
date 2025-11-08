
'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils/cn';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';

interface A4PageProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    onDelete?: () => void;
}

const A4Page = ({ children, title, className, onDelete }: A4PageProps) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={cn(
                "relative group bg-background shadow-lg p-8 md:p-12 mx-auto my-4 w-full max-w-[210mm]",
                title ? "min-h-[297mm]" : "",
                className,
            )}
        >
            {onDelete && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            className={cn(
                                "absolute top-4 right-4 h-8 w-8 rounded-full transition-opacity opacity-0 group-hover:opacity-100",
                                isHovering && "opacity-100"
                            )}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this chapter?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this chapter and all of its sections? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {title && <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>}
            <div className="prose dark:prose-invert max-w-none text-sm">{children}</div>
        </div>
    );
}

export default A4Page;
