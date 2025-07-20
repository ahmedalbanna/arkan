
'use client';

import { useState } from 'react';
import { FileText, Laptop, Presentation, FilePlus2, GitGraph, BookCheck, FileQuestion } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionActions } from '@/components/SessionActions';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';

// Lazy load components
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton = () => (
  <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[calc(100vh-300px)] w-full" />
  </div>
);


const ProposalModeGenerator = dynamic(() => import('@/components/proposal-generator/ProposalModeGenerator').then(mod => mod.ProposalModeGenerator), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const ReportGenerator = dynamic(() => import('@/components/report-generator/ReportModeGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const DiagramGenerator = dynamic(() => import('@/components/diagram-generator/DiagramGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const CodeGenerator = dynamic(() => import('@/components/code-generator/CodeGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
const PresentationGenerator = dynamic(() => import('@/components/presentation-generator/PresentationGenerator'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />,
});


function GeneratePageContent() {
  const [activeTab, setActiveTab] = useState("proposal");
  const proposal = useBuilderStore(s => s.proposal);
  const { t } = useLocalization();

  return (
    <div className="container h-full mx-auto max-w-screen-2xl px-4 py-8 flex flex-col">
       <div className="flex justify-end items-center mb-4">
        <SessionActions />
      </div>
      <div className="flex flex-col flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="proposal" className="gap-2">
              <FilePlus2 className="h-4 w-4" /> {t('builder.tabs.proposal')}
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2" disabled={!proposal}>
              <FileText className="h-4 w-4" /> {t('builder.tabs.document')}
            </TabsTrigger>
            <TabsTrigger value="diagram" className="gap-2" disabled={!proposal}>
                <GitGraph className="h-4 w-4" /> {t('builder.tabs.diagram')}
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Laptop className="h-4 w-4" /> {t('builder.tabs.code')}
            </TabsTrigger>
            <TabsTrigger value="presentation" className="gap-2" disabled={!proposal}>
              <Presentation className="h-4 w-4" /> {t('builder.tabs.presentation')}
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
        <GeneratePageContent />
    )
}
