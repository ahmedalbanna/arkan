
'use client';

import { useState } from 'react';
import { FileText, Laptop, Presentation, FilePlus2, GitGraph } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionActions } from '@/components/SessionActions';
import { BuilderStateProvider, useBuilderState } from '@/context/BuilderStateContext';
import { Footer } from '@/components/layout/Footer';

// Lazy load components
import dynamic from 'next/dynamic';


const ProposalModeGenerator = dynamic(() => import('@/components/ProposalModeGenerator').then(mod => mod.ProposalModeGenerator), { ssr: false });
const ReportGenerator = dynamic(() => import('@/components/ReportGenerator'), { ssr: false });
const DiagramGenerator = dynamic(() => import('@/components/DiagramGenerator'), { ssr: false });
const CodeGenerator = dynamic(() => import('@/components/CodeGenerator'), { ssr: false });
const PresentationGenerator = dynamic(() => import('@/components/PresentationGenerator'), { ssr: false });


function GeneratePageContent() {
  const [activeTab, setActiveTab] = useState("proposal");
  const { state } = useBuilderState();

  return (
    <div className="container h-full mx-auto max-w-screen-2xl px-4 py-8 flex flex-col">
       <div className="flex justify-end items-center mb-4">
        <SessionActions />
      </div>
      <div className="flex flex-col flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="proposal" className="gap-2">
              <FilePlus2 className="h-4 w-4" /> Proposal Mode
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2" disabled={!state.proposal}>
              <FileText className="h-4 w-4" /> Document Generator
            </TabsTrigger>
            <TabsTrigger value="diagram" className="gap-2" disabled={!state.proposal}>
                <GitGraph className="h-4 w-4" /> Diagram Generator
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Laptop className="h-4 w-4" /> Code Generator
            </TabsTrigger>
            <TabsTrigger value="presentation" className="gap-2" disabled={!state.proposal}>
              <Presentation className="h-4 w-4" /> Presentation Mode
            </TabsTrigger>
          </TabsList>
          
          <div className="w-full flex-grow">
              <TabsContent value="proposal" className="h-full">
                {activeTab === 'proposal' && <ProposalModeGenerator />}
              </TabsContent>
              <TabsContent value="report" className="h-full">
                {activeTab === 'report' && <ReportGenerator />}
              </TabsContent>
              <TabsContent value="diagram" className="h-full">
                {activeTab === 'diagram' && <DiagramGenerator />}
              </TabsContent>
              <TabsContent value="code" className="h-full">
                 {activeTab === 'code' && <CodeGenerator />}
              </TabsContent>
              <TabsContent value="presentation" className="h-full">
                {activeTab === 'presentation' && <PresentationGenerator />}
              </TabsContent>
          </div>
        </Tabs>
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
