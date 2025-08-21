
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';

export default function PdfToMarkdownConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { firebaseUser, refetchUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a valid PDF file.");
        setFile(null);
      } else {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!firebaseUser) {
        toast({ title: 'Authentication Required', description: 'You must be logged in to convert a file.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    setError(null);
    setMarkdown(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/pdf-to-markdown', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An unknown error occurred');
      }

      setMarkdown(result.markdown);
      refetchUser(); // Refresh user credits in the header

    } catch (err: any) {
      setError(err.message || 'Failed to process the PDF. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(() => {
        setIsCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setIsCopied(false), 2000);
    });
};

  return (
    <div className="space-y-8">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline">Upload PDF</CardTitle>
            <CardDescription>
              Choose a PDF file from your device. The content will be extracted and converted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file:text-primary file:font-semibold"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                <FileText className="h-4 w-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? <Loader2 className="m2-2 h-4 w-4 animate-spin" /> : <UploadCloud className="m2-2 h-4 w-4" />}
              {isLoading ? 'Processing...' : 'Convert to Markdown'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
         <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground">
               <Loader2 className="h-8 w-8 animate-spin" />
               <p>Extracting text and rewriting with AI... this may take a moment.</p>
            </CardContent>
         </Card>
      )}

      {markdown && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline">Generated Markdown</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="me-2 h-4 w-4 text-green-500" /> : <Copy className="me-2 h-4 w-4" />}
                </Button>
            </div>
            <CardDescription>
                The content from your PDF has been converted to markdown format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
