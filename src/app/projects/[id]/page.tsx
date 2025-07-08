import { getProjectById } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, FileText, MessageCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import CommentItem from '@/components/CommentItem';
import NewCommentForm from '@/components/NewCommentForm';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm';
import ProposalViewer from '@/components/ProposalViewer';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';
import ProjectActions from '@/components/ProjectActions';


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

  const renderMediaItem = (media: typeof project.media[0]) => {
    const isDataUrl = media.url.startsWith('data:');
    
    if (media.type === 'video') {
      return (
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full"
            src={media.url}
            title={media.alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    if (isDataUrl) {
      return <img src={media.url} alt={media.alt} className="object-cover w-full h-full" />;
    }

    return (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          className="object-cover"
          data-ai-hint={media.aiHint ?? ''}
        />
    );
  };

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
          
           {project.media.length > 0 && (
             <Carousel className="w-full">
                <CarouselContent>
                    {project.media.map((mediaItem) => (
                        <CarouselItem key={mediaItem.id}>
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                {renderMediaItem(mediaItem)}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {project.media.length > 1 && (
                    <>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </>
                )}
             </Carousel>
           )}
          
           {/* Report Preview */}
           {proposal ? (
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
          <ProjectActions project={project} />
        </aside>
      </div>
    </div>
  );
}
