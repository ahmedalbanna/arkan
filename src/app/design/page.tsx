
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, GripVertical, FileText, Table, Image as ImageIcon, Download } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PROPOSAL_TEMPLATES } from '@/lib/proposal-templates';
import type { ProjectProposal } from '@/ai/schemas';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- Simulated AI Generation Data ---
const simulatedData: Record<string, ProjectProposal> = {
    'default-software': {
        category: 'Software Development',
        title: 'AI-Powered Document Collaboration Platform',
        objective: 'To develop a platform that streamlines document creation and collaboration using AI-driven tools for generation, summarization, and translation, improving team productivity by 30%.',
        methodology: 'The project will follow a hybrid methodology, combining a structured Waterfall approach for initial planning and requirement gathering with an Agile/Scrum framework for iterative development and deployment.',
        expected_outcome: ['A fully functional web application with secure user authentication.', 'AI-powered modules for document generation, report creation, and diagramming.', 'A 25% reduction in document drafting time for beta testers.'],
        timeline: {
            startDate: '2024-09-01',
            endDate: '2024-12-15',
            phases: [
                { name: 'Phase 1: Discovery & Planning', durationWeeks: 3 },
                { name: 'Phase 2: UI/UX Design & Prototyping', durationWeeks: 2 },
                { name: 'Phase 3: Core Backend Development', durationWeeks: 5 },
                { name: 'Phase 4: Frontend & Integration', durationWeeks: 4 },
                { name: 'Phase 5: Testing & Deployment', durationWeeks: 2 },
            ],
        },
        budget: {
            totalAmount: 75000,
            currency: 'USD',
            breakdown: [
                { item: 'Lead Developer (1)', cost: 30000 },
                { item: 'Frontend Developer (1)', cost: 25000 },
                { item: 'UI/UX Designer (Contract)', cost: 10000 },
                { item: 'Server & Hosting Fees', cost: 5000 },
                { item: 'AI API & Licensing', cost: 5000 },
            ],
        },
        stakeholders: [{ name: 'Executive Sponsor', role: 'Project Champion', interest: 'Ensuring project meets business goals and ROI.' }],
        success_criteria: ['User adoption rate of 500+ users in the first quarter.', 'Successful generation of over 1,000 documents and diagrams.'],
        evaluation: 'Success will be measured via user analytics, feedback surveys, and performance metrics of the AI models.',
        tags: ['AI', 'SaaS', 'Productivity', 'Collaboration'],
        risks: [{ description: 'AI model integration proves more complex than anticipated.', mitigation: 'Allocate additional R&D time and consult with AI specialists.' }],
    },
    'agile-project': {
        category: 'Mobile App Development',
        title: 'Agile Development of "TaskFlow" Mobile App',
        objective: 'To rapidly develop and launch a Minimum Viable Product (MVP) of a task management mobile app using Agile methodologies to gather early user feedback and iterate quickly.',
        methodology: 'This project will strictly follow the Scrum framework. Work will be organized into 2-week sprints, with a product backlog prioritized by the Product Owner. Daily stand-ups, sprint planning, and retrospective meetings will be held to ensure continuous progress and adaptation.',
        expected_outcome: ['A functional MVP available on iOS and Android app stores within 3 months.', 'User base of 1,000 active users by the end of the first month post-launch.', 'Collection of actionable user feedback to guide the next development cycle.'],
        timeline: {
            startDate: '2024-09-01',
            endDate: '2024-11-30',
            phases: [
                { name: 'Sprint 1: User Authentication & Core Task Creation', durationWeeks: 2 },
                { name: 'Sprint 2: Task Prioritization & List Management', durationWeeks: 2 },
                { name: 'Sprint 3: Due Dates & Reminders', durationWeeks: 2 },
                { name: 'Sprint 4: UI Polishing & Initial Analytics', durationWeeks: 2 },
                { name: 'Sprint 5: App Store Submission & Bug Fixing', durationWeeks: 2 },
            ],
        },
        budget: {
            totalAmount: 40000,
            currency: 'USD',
            breakdown: [
                { item: 'Mobile Developer (1)', cost: 20000 },
                { item: 'Backend Developer (Part-time)', cost: 10000 },
                { item: 'App Store Fees & Marketing', cost: 5000 },
                 { item: 'Contingency Fund', cost: 5000 },
            ],
        },
        stakeholders: [{ name: 'Product Owner', role: 'Defining features and prioritizing the backlog.', interest: 'Maximizing the value of the product.' }],
        success_criteria: ['MVP launch within the 3-month timeframe.', 'Positive app store ratings (average 4+ stars).'],
        evaluation: 'Success will be evaluated based on sprint velocity, user stories completed, and direct feedback from early adopters.',
        tags: ['Agile', 'Scrum', 'Mobile App', 'Productivity'],
        risks: [{ description: 'Scope creep during sprints.', mitigation: 'Strict backlog grooming and adherence to sprint goals by the Product Owner.' }],
    },
    'marketing-campaign': {
        category: 'Digital Marketing',
        title: 'Launch Campaign for "EcoGlow" Skincare Line',
        objective: 'To generate significant market buzz and drive initial sales for the new "EcoGlow" sustainable skincare line, achieving 5,000 unit sales in the first two months.',
        methodology: 'A multi-channel digital marketing strategy will be executed, focusing on social media engagement, influencer partnerships, and targeted content marketing to build brand awareness and drive conversions.',
        expected_outcome: ['Achieve 1 million impressions across all social media platforms.', 'Secure collaborations with 10+ influencers in the eco-conscious beauty space.', 'Generate 5,000 unit sales through the e-commerce website.'],
        timeline: {
            startDate: '2024-09-01',
            endDate: '2024-11-15',
            phases: [
                { name: 'Week 1-2: Market Research & Audience Persona Def.', durationWeeks: 2 },
                { name: 'Week 3-4: Content Creation & Ad Creatives', durationWeeks: 2 },
                { name: 'Week 5-8: Influencer Outreach & Campaign Launch', durationWeeks: 4 },
                { name: 'Week 9-10: Performance Analysis & Optimization', durationWeeks: 2 },
            ],
        },
        budget: {
            totalAmount: 25000,
            currency: 'USD',
            breakdown: [
                { item: 'Social Media Ad Spend', cost: 10000 },
                { item: 'Influencer Collaboration Fees', cost: 8000 },
                { item: 'Content Production (Photo/Video)', cost: 5000 },
                { item: 'Analytics Software Subscription', cost: 2000 },
            ],
        },
        stakeholders: [{ name: 'Brand Manager', role: 'Overseeing campaign execution and brand messaging.', interest: 'Ensuring brand integrity and campaign ROI.' }],
        success_criteria: ['Meeting or exceeding the 5,000 unit sales target.', 'Achieving a click-through rate (CTR) of over 2% on social media ads.'],
        evaluation: 'Campaign success will be tracked daily using Google Analytics, social media platform insights, and sales data from the e-commerce backend.',
        tags: ['Marketing', 'eCommerce', 'Skincare', 'Social Media'],
        risks: [{ description: 'Low engagement from influencer partnerships.', mitigation: 'Thoroughly vet influencers based on past campaign performance and audience demographics. Have backup influencers on standby.' }],
    }
};

function CustomizationPanel({ styles, setStyles, content, setContent, selectedTemplateId, setSelectedTemplateId }: { styles: any, setStyles: React.Dispatch<React.SetStateAction<any>>, content: any, setContent: React.Dispatch<React.SetStateAction<any>>, selectedTemplateId: string, setSelectedTemplateId: (id: string) => void }) {
  const handleStyleChange = (key: string, value: string) => {
    setStyles((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleContentChange = (key: string, value: string) => {
    setContent((prev: any) => ({ ...prev, [key]: value }));
  };

  const components = [
    { name: 'Header', icon: FileText },
    { name: 'Table', icon: Table },
    { name: 'Image', icon: ImageIcon }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>لوحة التخصيص</CardTitle>
        <CardDescription>
          يسمح للمستخدمين بتعديل الأنماط المرئية للقالب ، مثل الخطوط والألوان والخلفيات.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Template Selector */}
        <div>
          <h3 className="text-lg font-semibold mb-2">اختر القالب</h3>
           <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a proposal template" />
                </SelectTrigger>
                <SelectContent>
                    {PROPOSAL_TEMPLATES.map(template => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        <Separator />
        
        {/* Style Editor */}
        <div>
          <h3 className="text-lg font-semibold mb-2">محرر الأنماط</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">الخط</Label>
              <Select defaultValue="Inter" onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">حجم الخط</Label>
              <Select defaultValue="16px" onValueChange={(value) => handleStyleChange('fontSize', value)}>
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="header-color">لون العنوان</Label>
              <Input id="header-color" type="color" defaultValue="#111827" onChange={(e) => handleStyleChange('headerColor', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-color">لون النص</Label>
              <Input id="text-color" type="color" defaultValue="#4b5563" onChange={(e) => handleStyleChange('textColor', e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Component Library */}
        <div>
          <h3 className="text-lg font-semibold mb-2">مكتبة المكونات</h3>
          <div className="grid grid-cols-3 gap-2">
            {components.map((component) => (
              <div key={component.name} className="flex flex-col items-center justify-center p-2 border rounded-md bg-muted/50 cursor-grab">
                <component.icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs mt-1 text-muted-foreground">{component.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Export Options */}
        <div>
           <h3 className="text-lg font-semibold mb-2">خيارات التصدير</h3>
           <div className="flex gap-2">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> DOCX
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> PPTX
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
           </div>
        </div>

      </CardContent>
    </Card>
  )
}

function DefaultSoftwarePreview({ styles, content }: { styles: any, content: ProjectProposal }) {
    return (
        <>
            <h1 style={{ color: styles.headerColor, fontSize: '2em' }} className="font-bold mb-1">{content.title}</h1>
            <p className="text-sm text-muted-foreground mb-6" style={{ color: styles.headerColor }}>{content.category}</p>
            <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Objective</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{content.objective}</p>
            <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Timeline</h2>
            <UiTable>
                <TableHeader><TableRow><TableHead>Phase</TableHead><TableHead>Duration</TableHead></TableRow></TableHeader>
                <TableBody>
                    {content.timeline.phases.map((phase, index) => (
                        <TableRow key={index}><TableCell>{phase.name}</TableCell><TableCell>{phase.durationWeeks} weeks</TableCell></TableRow>
                    ))}
                </TableBody>
            </UiTable>
            <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Budget ({content.budget.currency})</h2>
            <UiTable>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Cost</TableHead></TableRow></TableHeader>
                <TableBody>
                    {content.budget.breakdown.map((item, index) => (
                        <TableRow key={index}><TableCell>{item.item}</TableCell><TableCell className="text-right">{item.cost.toLocaleString()}</TableCell></TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50"><TableCell>Total</TableCell><TableCell className="text-right">{content.budget.totalAmount.toLocaleString()}</TableCell></TableRow>
                </TableBody>
            </UiTable>
        </>
    );
}

function AgileProjectPreview({ styles, content }: { styles: any, content: ProjectProposal }) {
     return (
        <>
            <h1 style={{ color: styles.headerColor, fontSize: '2em' }} className="font-bold mb-1">{content.title}</h1>
            <p className="text-sm text-muted-foreground mb-6" style={{ color: styles.headerColor }}>{content.category}</p>
            <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Project Goal</h2>
            <p className="whitespace-pre-wrap leading-relaxed p-4 bg-accent/10 rounded-md">{content.objective}</p>
            <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Sprint Plan</h2>
            <p className="text-sm text-muted-foreground mb-2">Methodology: {content.methodology}</p>
            <UiTable>
                <TableHeader><TableRow><TableHead>Sprint</TableHead><TableHead>Focus</TableHead><TableHead>Duration</TableHead></TableRow></TableHeader>
                <TableBody>
                    {content.timeline.phases.map((phase, index) => (
                        <TableRow key={index}><TableCell>{index + 1}</TableCell><TableCell>{phase.name}</TableCell><TableCell>{phase.durationWeeks} weeks</TableCell></TableRow>
                    ))}
                </TableBody>
            </UiTable>
             <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Success Criteria</h2>
             <ul className="list-disc pl-5 space-y-1">
                {content.success_criteria.map((item, i) => <li key={i}>{item}</li>)}
             </ul>
        </>
    );
}

function MarketingCampaignPreview({ styles, content }: { styles: any, content: ProjectProposal }) {
    return (
        <>
            <h1 style={{ color: styles.headerColor, fontSize: '2em' }} className="font-bold mb-1">{content.title}</h1>
            <p className="text-sm text-muted-foreground mb-6" style={{ color: styles.headerColor }}>{content.category}</p>
            <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Campaign Objective</h2>
            <p className="whitespace-pre-wrap leading-relaxed border-l-4 border-accent pl-4">{content.objective}</p>
             <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Expected Outcomes</h2>
             <div className="grid grid-cols-2 gap-4">
                {content.expected_outcome.map((item, i) => (
                    <Card key={i} className="p-4 bg-muted/50"><p className="font-semibold">{item}</p></Card>
                ))}
            </div>
            <h2 style={{ color: styles.headerColor }} className="text-xl font-bold mt-6 mb-2">Primary Stakeholder</h2>
            <p>{content.stakeholders[0].name} - {content.stakeholders[0].role}</p>
        </>
    );
}

function PreviewPanel({ styles, content, templateId }: { styles: any, content: ProjectProposal | null, templateId: string }) {
  if (!content) {
    return (
        <Card className="h-full min-h-[500px] lg:h-[calc(100vh-160px)] flex items-center justify-center">
            <CardContent>
                <p className="text-muted-foreground">Select a template to see the preview.</p>
            </CardContent>
        </Card>
    );
  }
  
  const renderPreview = () => {
      switch(templateId) {
          case 'agile-project':
              return <AgileProjectPreview styles={styles} content={content} />;
          case 'marketing-campaign':
              return <MarketingCampaignPreview styles={styles} content={content} />;
          case 'default-software':
          default:
              return <DefaultSoftwarePreview styles={styles} content={content} />;
      }
  }

  return (
    <Card className="h-full min-h-[500px] lg:h-[calc(100vh-160px)]">
      <CardHeader>
        <CardTitle>معاينة القالب</CardTitle>
        <CardDescription>تعرض معاينة حية للقالب المحدد ، وتعرض كيف سيبدو مع البيانات المخصصة.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[calc(100vh-280px)] rounded-lg border-2 border-dashed bg-muted p-8 overflow-y-auto" style={{ fontFamily: styles.fontFamily, fontSize: styles.fontSize, color: styles.textColor }}>
           {renderPreview()}
        </div>
      </CardContent>
    </Card>
  )
}


export default function DesignPage() {
  const [styles, setStyles] = useState({
    fontFamily: 'Inter',
    fontSize: '16px',
    headerColor: '#111827',
    textColor: '#4b5563',
  });
  
  const [selectedTemplateId, setSelectedTemplateId] = useState(PROPOSAL_TEMPLATES[0].id);
  const [content, setContent] = useState<ProjectProposal | null>(simulatedData[selectedTemplateId]);

  useEffect(() => {
    setContent(simulatedData[selectedTemplateId]);
  }, [selectedTemplateId]);

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Palette className="w-10 h-10" />
          استوديو التصميم
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          أنشئ وخصص ميزاتك الجديدة هنا.
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <CustomizationPanel 
                    styles={styles} 
                    setStyles={setStyles}
                    content={content} 
                    setContent={setContent}
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                />
            </div>
            <div className="lg:col-span-2">
                <PreviewPanel styles={styles} content={content} templateId={selectedTemplateId} />
            </div>
        </div>
    </div>
  );
}
