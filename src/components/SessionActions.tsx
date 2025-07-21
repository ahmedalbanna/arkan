
'use client';

import { Button } from '@/components/ui/button';
import { Download, Trash2, Upload, Save, FileDown, DiscAlbum, CheckCircle, Cloud, CloudOff } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSaveProject, useUpdateProject } from '@/hooks/use-projects';
import { Loader2 } from 'lucide-react';
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
import { Input } from './ui/input';
import { Label } from './ui/label';

function SaveStatus() {
    const hasUnsavedChanges = useBuilderStore(state => state.hasUnsavedChanges);
    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();
    const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;

    if (isSaving) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
            </div>
        );
    }
    
    if (hasUnsavedChanges) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CloudOff className="h-4 w-4" />
                <span>Unsaved changes</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>All changes saved</span>
        </div>
    )
}

export const SessionActions = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { t } = useLocalization();
    const [saveAsName, setSaveAsName] = useState('');

    const store = useBuilderStore();
    const saveProjectMutation = useSaveProject();
    
    const isSaving = saveProjectMutation.isPending;

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                // Decode from Base64
                const decodedJson = atob(content);
                const parsedState = JSON.parse(decodedJson);
                store.loadState(parsedState);
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: 'Load Failed', description: 'The selected file could not be read or is corrupted.', variant: 'destructive' });
            }
        };
        reader.readAsText(file);

        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleSaveProjectFile = () => {
        if (!store.proposal) return;
        const jsonString = JSON.stringify(store.getFullState());
        // Encode to Base64
        const encodedData = btoa(jsonString);
        const blob = new Blob([encodedData], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${store.proposal.title.replace(/[\s\W]/g, '_') || 'arkan_project'}.arkan`);
    }

    const handleSaveAs = () => {
        if (!store.proposal) {
            toast({ title: "Cannot Save", description: "Please generate a proposal first.", variant: 'destructive' });
            return;
        }
        const projectData = store.getFullState();
        // Create a new project with a new name, but don't change the current project ID
        const saveData = { ...projectData, name: saveAsName || store.proposal.title };
        saveProjectMutation.mutate(saveData, {
            // Overwrite onSuccess to not change the current project context
            onSuccess: (newProject) => {
                 toast({
                    title: 'Project Saved As New',
                    description: `A new project "${newProject.name}" has been created.`,
                });
            }
        });
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept=".arkan"
                    className="hidden"
                />
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                            variant="outline"
                            size="icon"
                            onClick={handleUploadClick}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Upload className="h-4 w-4" />
                            <span className="hidden md:inline ml-2">Load Project</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>Load Project</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSaveProjectFile}
                            disabled={!store.proposal}
                             className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <FileDown className="h-4 w-4" />
                             <span className="hidden md:inline ml-2">Download File</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>Download as .arkan file</p>
                    </TooltipContent>
                </Tooltip>
                
                <SaveStatus />

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button
                            variant="outline"
                            size="icon"
                            disabled={!store.proposal || isSaving}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <DiscAlbum className="h-4 w-4" />
                            <span className="hidden md:inline ml-2">Save As...</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Save Project As</AlertDialogTitle>
                            <AlertDialogDescription>
                                Enter a new name for this project. This will create a new copy in your saved projects.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" defaultValue={store.proposal?.title} onChange={(e) => setSaveAsName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSaveAs} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Save
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>


                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                            variant="destructive"
                            size="icon"
                            onClick={store.newSession}
                            className="h-8 w-8 md:w-auto md:px-3"
                        >
                            <Trash2 className="h-4 w-4" />
                             <span className="hidden md:inline ml-2">New Session</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="md:hidden">
                        <p>Clear all content and start a new session</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
