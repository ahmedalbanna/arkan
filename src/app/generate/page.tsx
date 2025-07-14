// This file is the new main entry point for the unified builder interface.
// It will be updated in the next step to implement the three-column layout and mode switcher.
'use client';

import { useState } from 'react';
import ReportGenerator from "@/components/ReportGenerator";
import CodeGenerator from "@/components/CodeGenerator";
import { FileText, Laptop } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportStateProvider } from '@/context/ReportStateContext';

export default function GeneratePage() {
  const [activeTab, setActiveTab] = useState("report");

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="flex justify-center mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="report" className="gap-2">
              <FileText className="h-4 w-4" /> Document Generator
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Laptop className="h-4 w-4" /> Code Generator
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full">
        {activeTab === 'report' && (
          <ReportStateProvider>
            <ReportGenerator />
          </ReportStateProvider>
        )}
        {activeTab === 'code' && <CodeGenerator />}
      </div>
    </div>
  );
}
