import { getProjectById } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpRight, Calendar, FileText, MessageCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import CommentItem from '@/components/CommentItem';
import NewCommentForm from '@/components/NewCommentForm';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm';
import ProposalViewer from '@/components/ProposalViewer';
import { ProjectProposalSchema, type ProjectProposal, type SectionName, type DiagramType } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project || !project.user) {
    notFound();
  }
  const { user } = project;
  // In a real app, you'd get the current user's ID from the session
  const currentUserId = 'user-1';
  const isOwner = user.id === currentUserId;

  let proposal: ProjectProposal | null = null;
  if (project.proposalData) {
    try {
        proposal = ProjectProposalSchema.parse(JSON.parse(project.proposalData));
    } catch(e) {
        console.error("Failed to parse proposal data for project:", project.id, e);
    }
  }

  let reportSections: ReportState['sections'] | null = null;
    if (project.reportSections) {
        try {
            reportSections = JSON.parse(project.reportSections);
        } catch (e) {
            console.error("Failed to parse report sections for project:", project.id, e);
        }
    }

    let reportDiagrams: ReportState['diagrams'] | null = null;
    if (project.reportDiagrams) {
        try {
            reportDiagrams = JSON.parse(project.reportDiagrams);
        } catch (e) {
            console.error("Failed to parse report diagrams for project:", project.id, e);
        }
    }
  
  const hasFullReport = reportSections || reportDiagrams;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="secondary" className="mb-2">{project.category}</Badge>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">{project.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(project.createdAt), 'd MMMM yyyy')}</span>
                    </div>
                    {user && (
                        <Link href={`/profile/${user.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={user.avatarUrl ?? ''} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                        </Link>
                    )}
                </div>
              </div>
              {isOwner && (
                 <Button asChild variant="outline">
                    <Link href={`/projects/${project.id}/edit`}>
                      <Pencil className="ml-2 h-4 w-4" />
                      Edit Project
                    </Link>
                  </Button>
              )}
            </div>
          </div>
          
           {/* Report Cover */}
           <div className="bg-card border rounded-lg p-8 shadow-md aspect-[8.5/11] max-w-lg mx-auto flex flex-col justify-center items-center text-center">
              <FileText className="w-16 h-16 text-primary/50 mb-6" />
              <h2 className="text-3xl font-headline text-primary">{project.title}</h2>
              <p className="text-lg text-muted-foreground mt-2">Project Report</p>
              <div className="mt-auto pt-8">
                <p className="text-sm text-muted-foreground">By {user.name}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(project.createdAt), 'MMMM yyyy')}</p>
              </div>
          </div>
          
          {/* Report Preview */}
           {hasFullReport ? (
             <div className="space-y-6">
                {proposal && (
                    <Accordion type="single" collapsible defaultValue="proposal" className="w-full">
                        <AccordionItem value="proposal" className="bg-background rounded-lg border">
                            <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">Project Proposal Details</AccordionTrigger>
                            <AccordionContent className="p-4 border-t"><ProposalViewer proposal={proposal} readOnly={true} /></AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}

                {reportSections && (
                     <Accordion type="multiple" className="w-full space-y-4">
                        {(Object.keys(reportSections) as SectionName[]).map((key) => {
                            const content = reportSections?.[key];
                            if (!content) return null;
                            const config = sectionConfig[key];
                            return (
                                <AccordionItem value={key} key={key} className="bg-background rounded-lg border">
                                    <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                                        <div className="flex items-center">
                                            <config.icon className="mr-2 h-5 w-5 text-primary" /> {config.title}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="max-w-none p-4 text-muted-foreground border-t">
                                        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
                 {reportDiagrams && (
                     <Accordion type="multiple" className="w-full space-y-4">
                        {(Object.keys(reportDiagrams) as DiagramType[]).map((key) => {
                            const diagramData = reportDiagrams?.[key];
                            if (!diagramData) return null;
                            const config = diagramConfig[key];
                            return (
                                <AccordionItem value={key} key={key} className="bg-background rounded-lg border">
                                    <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline"><config.icon className="mr-2 h-5 w-5 text-primary" /> {config.title}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 p-4 border-t">
                                        <Image 
                                            src={diagramData.imageUrl} 
                                            alt={`Rendered ${config.title}`}
                                            width={800}
                                            height={600}
                                            className="w-full h-auto object-contain rounded-md border bg-white p-2"
                                        />
                                        <Textarea
                                            readOnly
                                            value={diagramData.plantUmlCode}
                                            rows={10}
                                            className="bg-muted p-4 rounded-md text-sm text-left font-mono"
                                            dir="ltr"
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                 )}
            </div>
           ) : proposal ? (
             <ProposalViewer proposal={proposal} readOnly={true} />
           ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">About The Project</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-none">
                       <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
          )}

          <div className="mt-8">
            <h3 className="font-headline text-lg mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.projectTags.map(pt => (
                <Badge key={pt.tag.id} variant="outline">{pt.tag.name}</Badge>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-8">
          {project.liveLink && (
            <Button asChild className="w-full font-headline" size="lg">
              <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                View Live Project <ArrowUpRight className="mr-2 h-5 w-5" />
              </a>
            </Button>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Project Summary (AI)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-none text-muted-foreground text-sm">
                 <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{project.summaryShort || ''}</ReactMarkdown>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technologies Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {project.summaryTechnologies.map(st => (
                    <Badge key={st.technology.id}>{st.technology.name}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({project.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {project.comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} projectId={project.id} />
                ))}
              </div>
              <NewCommentForm projectId={project.id} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
