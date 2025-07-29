
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
import { useReportStore } from '@/hooks/useReportStore';
import { useDiagramStore } from '@/hooks/useDiagramStore';

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

function hasAnyContent(state: ReturnType<typeof useBuilderStore.getState>): boolean {
    if (state.proposal) return true;
    if (Object.values(useReportStore.getState().sections).some(s => !!s)) return true;
    if (Object.values(useDiagramStore.getState().diagrams).some(d => !!d)) return true;
    // Add other store checks if necessary
    return false;
}


export const SessionActions = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { t } = useLocalization();
    const [saveAsName, setSaveAsName] = useState('');
    const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    const [projectName, setProjectName] = useState('');

    const store = useBuilderStore();
    const saveProjectMutation = useSaveProject();
    const updateProjectMutation = useUpdateProject();
    
    const isSaving = saveProjectMutation.isPending || updateProjectMutation.isPending;

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
                // Decode from Base64 with Unicode support
                const decodedJson = decodeURIComponent(escape(atob(content)));
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
        if (!hasAnyContent(store)) return;
        const jsonString = JSON.stringify(store.getFullState());
        // Encode to Base64 with Unicode support
        const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
        const blob = new Blob([encodedData], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${store.name || 'arkan_project'}.arkan`);
    }

    const performSave = (name?: string) => {
        if (!hasAnyContent(store)) {
            toast({ title: "Cannot Save", description: "Project is empty.", variant: 'destructive' });
            return;
        }

        const projectData = store.getFullState();
        const finalName = name || store.name || store.proposal?.title || 'Untitled Project';
        const saveData = { ...projectData, name: finalName };
        
        if (store.currentProjectId) {
            updateProjectMutation.mutate({ projectId: store.currentProjectId, data: saveData });
        } else {
            saveProjectMutation.mutate(saveData);
        }
    }


    const handleSave = () => {
        // If we are editing a saved project, or if the project has a name, save directly.
        if (store.currentProjectId || store.name || store.proposal?.title) {
            performSave();
        } else {
            // If it's a new project without a name, prompt for one.
            setIsSavePromptOpen(true);
        }
    }
    
    const handleSaveFromPrompt = () => {
        if (projectName.trim()) {
            performSave(projectName);
            setIsSavePromptOpen(false);
            setProjectName('');
        } else {
            toast({ title: "Name Required", description: "Please enter a name for your project.", variant: "destructive" });
        }
    };

    const handleSaveAs = () => {
        if (!hasAnyContent(store)) {
            toast({ title: "Cannot Save", description: "Project is empty.", variant: 'destructive' });
            return;
        }
        const projectData = store.getFullState();
        // Create a new project with a new name, but don't change the current project context
        const finalSaveAsName = saveAsName.trim() || store.name || store.proposal?.title || 'Untitled Project';
        const saveData = { ...projectData, name: finalSaveAsName };
        saveProjectMutation.mutate(saveData, {
            // Overwrite onSuccess to not change the current project context
            onSuccess: (newProject) => {
                 toast({
                    title: 'Project Saved As New',
                    description: `A new project "${newProject.name}" has been created.`,
                });
                setIsSaveAsOpen(false);
                setSaveAsName('');
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
                            disabled={!hasAnyContent(store)}
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

                 <Button
                    variant="default"
                    size="icon"
                    onClick={handleSave}
                    disabled={!store.hasUnsavedChanges || isSaving}
                    className="h-8 w-8 md:w-auto md:px-3"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     <span className="hidden md:inline ml-2">Save Project</span>
                </Button>

                <AlertDialog open={isSavePromptOpen} onOpenChange={setIsSavePromptOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Save New Project</AlertDialogTitle>
                            <AlertDialogDescription>Please provide a name for your new project before saving.</AlertDialogDescription>
                        </AlertDialogHeader>
                         <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="save-project-name" className="text-right">Name</Label>
                                <Input id="save-project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setProjectName('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSaveFromPrompt} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Save
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={isSaveAsOpen} onOpenChange={setIsSaveAsOpen}>
                    <AlertDialogTrigger asChild>
                         <Button
                            variant="outline"
                            size="icon"
                            disabled={!hasAnyContent(store) || isSaving}
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
                                <Label htmlFor="save-as-name" className="text-right">Name</Label>
                                <Input id="save-as-name" defaultValue={store.name || (store.proposal as any)?.title} onChange={(e) => setSaveAsName(e.target.value)} className="col-span-3" />
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
