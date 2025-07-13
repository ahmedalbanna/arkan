'use client';

import { useState } from 'react';
import ReportGenerator from "@/components/report-generator/ReportGenerator";
import CodeGenerator from "@/components/CodeGenerator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Laptop } from 'lucide-react';

export default function GeneratePage() {
  const [showReportGenerator, setShowReportGenerator] = useState(true);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          {showReportGenerator ? (
            <>
              <FileText className="w-10 h-10" />
              AI Report Generator
            </>
          ) : (
            <>
              <Laptop className="w-10 h-10" />
              AI Code Generator
            </>
          )}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {showReportGenerator
            ? "Generate comprehensive reports based on your project proposal."
            : "Describe the UI component you want to build, and let the AI generate the code for you."}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-2 mb-8">
        <Label htmlFor="generator-switch">Code Generator</Label>
        <Switch
          id="generator-switch"
          checked={showReportGenerator}
          onCheckedChange={setShowReportGenerator}
        />
        <Label htmlFor="generator-switch">Report Generator</Label>
      </div>

      {showReportGenerator ? (
        <ReportGenerator />
      ) : (
        <CodeGenerator />
      )}
    </div>
  );
}