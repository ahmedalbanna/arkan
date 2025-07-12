
import PdfToMarkdownConverter from "@/components/PdfToMarkdownConverter";
import { FileText } from "lucide-react";

export default function PdfToMarkdownPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileText className="w-10 h-10" />
          PDF to Markdown Converter
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload a PDF, and let the AI extract and reformat the content into clean markdown.
        </p>
      </div>
      <PdfToMarkdownConverter />
    </div>
  );
}
