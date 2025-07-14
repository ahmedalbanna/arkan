
'use client';

import { useState } from 'react';
import ReportGenerator from "@/components/ReportGenerator";
import CodeGenerator from "@/components/CodeGenerator";
import PresentationGenerator from '@/components/PresentationGenerator';
import { ProposalModeGenerator } from '@/components/ProposalModeGenerator';
import DiagramGenerator from '@/components/DiagramGenerator';
import { FileText, Laptop, Presentation, FilePlus2, GitGraph } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportStateProvider } from '@/context/ReportStateContext';
import { CodeStateProvider } from '@/context/CodeStateContext';
import { PresentationStateProvider } from '@/context/PresentationStateContext';
import { DiagramStateProvider } from '@/context/DiagramStateContext';
import { SessionActions } from '@/components/SessionActions';
import { BuilderStateProvider } from '@/context/BuilderStateContext';
import { ProposalStateProvider } from '@/context/ProposalStateContext';


function GeneratePageContent() {
  const [activeTab, setActiveTab] = useState("report");

  return (
    <div className="container h-full mx-auto max-w-screen-2xl px-4 py-8">
       <div className="flex justify-end items-center mb-4">
        <SessionActions />
      </div>
      <div className="flex justify-between items-center mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="proposal" className="gap-2">
              <FilePlus2 className="h-4 w-4" /> Proposal Mode
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2">
              <FileText className="h-4 w-4" /> Document Generator
            </TabsTrigger>
            <TabsTrigger value="diagram" className="gap-2">
                <GitGraph className="h-4 w-4" /> Diagram Generator
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Laptop className="h-4 w-4" /> Code Generator
            </TabsTrigger>
            <TabsTrigger value="presentation" className="gap-2">
              <Presentation className="h-4 w-4" /> Presentation Mode
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full h-[calc(100vh-180px)]">
        {activeTab === 'proposal' && (
          <ProposalStateProvider>
            <ProposalModeGenerator />
          </ProposalStateProvider>
        )}
        {activeTab === 'report' && (
          <ReportStateProvider>
            <ReportGenerator />
          </ReportStateProvider>
        )}
        {activeTab === 'diagram' && (
          <DiagramStateProvider>
            <DiagramGenerator />
          </DiagramStateProvider>
        )}
        {activeTab === 'code' && (
          <CodeStateProvider>
            <CodeGenerator />
          </CodeStateProvider>
        )}
        {activeTab === 'presentation' && (
          <PresentationStateProvider>
            <PresentationGenerator />
          </PresentationStateProvider>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
    return (
        <BuilderStateProvider>
            <GeneratePageContent />
        </BuilderStateProvider>
    )
}
