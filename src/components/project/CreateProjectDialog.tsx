
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useCreateProjectDialog } from '@/hooks';
import { FileText, Lightbulb, PlusCircle, Sparkles } from 'lucide-react';

export function CreateProjectDialog() {
    const { t } = useLocalization();
    const {
        isOpen,
        setIsOpen,
        name,
        setName,
        description,
        setDescription,
        handleStartBuilding,
        handleCreateNewProject,
    } = useCreateProjectDialog();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <Button
                        onClick={handleCreateNewProject}
                        variant="gradient"
                        className="hover:shadow-glow transition-all duration-200 group"
                    >
                        <PlusCircle className="me-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        {t('projects.createButton')}
                    </Button>
                </AnimatedContainer>
            </DialogTrigger>
            <DialogContent className="max-w-3xl backdrop-blur-md">
                <DialogHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 -m-6 p-6 rounded-t-lg">
                    <AnimatedContainer animation="fade-in-down" delay={200}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="font-headline text-xl">{t('projects.createDialogTitle')}</DialogTitle>
                                <DialogDescription className="mt-1">
                                    {t('projects.createDialogDescription')}
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant="secondary" className="mt-2 w-fit">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI-Powered Project Creation
                        </Badge>
                    </AnimatedContainer>
                </DialogHeader>

                <div className="space-y-6 py-6">
                    <AnimatedContainer animation="fade-in-up" delay={300}>
                        <div className="space-y-3">
                            <Label htmlFor="project-name" className="flex items-center gap-2 font-semibold">
                                <FileText className="h-4 w-4 text-primary" />
                                {t('projects.projectNameLabel')}
                            </Label>
                            <Input
                                id="project-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('projects.projectNamePlaceholder')}
                                className="hover:shadow-soft transition-all duration-200"
                            />
                        </div>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <div className="space-y-3">
                            <Label htmlFor="project-description" className="flex items-center gap-2 font-semibold">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                {t('projects.projectIdeaLabel')}
                            </Label>
                            <Textarea
                                id="project-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('projects.projectIdeaPlaceholder')}
                                className="hover:shadow-soft transition-all duration-200 resize-none"
                                rows={4}
                            />
                        </div>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fade-in-up" delay={500}>
                        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">AI Suggestions</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Our AI will analyze your project idea and suggest improvements, structure, and next steps.
                            </p>
                        </div>
                    </AnimatedContainer>
                </div>

                <DialogFooter className="bg-gradient-to-r from-background to-primary/5 -m-6 p-6 rounded-b-lg">
                    <AnimatedContainer animation="fade-in-up" delay={600}>
                        <div className="flex gap-3 w-full">
                            <DialogClose asChild>
                                <Button variant="ghost" className="flex-1">
                                    {t('projects.cancelButton')}
                                </Button>
                            </DialogClose>
                            <Button
                                onClick={handleStartBuilding}
                                disabled={!name && !description}
                                variant="gradient"
                                className="flex-1 hover:shadow-glow transition-all duration-200"
                            >
                                <Sparkles className="me-2 h-4 w-4" />
                                {t('projects.startBuildingButton')}
                            </Button>
                        </div>
                    </AnimatedContainer>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
