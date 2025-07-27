
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  UploadCloud,
  FolderKanban,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube,
  Database,
  Box,
  FileText,
} from 'lucide-react';

// This is a placeholder component for the Knowledge tab UI.
// Functionality like file handling is not yet implemented.
export default function KnowledgeTab() {
  const [enableKnowledge, setEnableKnowledge] = useState(true);

  return (
    <div className="space-y-6">
      <CardTitle>Knowledge</CardTitle>
      <p className="text-sm text-muted-foreground">
        Train your AI Agents with dynamic knowledge from projects, web links, documents, and more. <a href="#" className="text-primary underline">Learn more.</a>
      </p>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="knowledge-switch" className="text-base">Enable knowledge</Label>
        </div>
        <Switch
          id="knowledge-switch"
          checked={enableKnowledge}
          onCheckedChange={setEnableKnowledge}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">ADD SOURCES</h3>
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
                Drag multiple files here or select to upload. Supports .pdf, .docx, .txt, .md, .pptx, .xlsx, .xls, .epub, .csv (Max 5 MB per file)
            </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline"><FolderKanban className="mr-2 h-4 w-4" /> Add Project</Button>
            <Button variant="outline"><ImageIcon className="mr-2 h-4 w-4" /> Add Media</Button>
            <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4" /> Add Link</Button>
            <Button variant="outline"><Youtube className="mr-2 h-4 w-4" /> Add Youtube</Button>
        </div>
        <Button variant="outline" className="w-full justify-center">
            <Database className="mr-2 h-4 w-4" />
            <Box className="mr-2 h-4 w-4" />
             Add With Google Drive, Dropbox, Box or OneDrive
        </Button>
         <Button variant="outline" className="w-full justify-center">
            <FileText className="mr-2 h-4 w-4" /> Add Markdown/Text
        </Button>
      </div>

       <div className="space-y-2">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>TITLE</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>TYPE</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        You have not added any sources to your knowledge base. Please add documents, links, or YouTube transcriptions.
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
       </div>

    </div>
  );
}
