
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileText, Trash2 } from "lucide-react";
import { MarkdownViewer } from "../shared/MarkdownViewer";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface UploadedFile {
    name: string;
    content: string;
}

interface FileListDisplayProps {
    files: UploadedFile[];
    onRemoveFile: (index: number) => void;
}

export function FileListDisplay({ files, onRemoveFile }: FileListDisplayProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Uploaded Files</h4>
                <ScrollArea className="h-48">
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl h-[80vh]">
                                            <DialogHeader>
                                                <DialogTitle>{file.name}</DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className="h-full border rounded-md p-4">
                                                <MarkdownViewer content={file.content} />
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onRemoveFile(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
