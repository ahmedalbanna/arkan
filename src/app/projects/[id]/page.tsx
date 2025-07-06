import { getProjectById } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowUpRight, Calendar, MessageCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import CommentItem from '@/components/CommentItem';
import NewCommentForm from '@/components/NewCommentForm';
import ReactMarkdown from 'react-markdown';

const markdownComponents = {
  h1: ({node, ...props}) => <h1 className="mt-6 mb-4 text-3xl font-bold text-primary font-headline" {...props} />,
  h2: ({node, ...props}) => <h2 className="mt-5 mb-3 text-2xl font-bold text-primary font-headline" {...props} />,
  h3: ({node, ...props}) => <h3 className="mt-4 mb-2 text-xl font-semibold font-headline" {...props} />,
  p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
  a: ({node, ...props}) => <a className="text-accent underline hover:text-accent/80" {...props} />,
  ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
  ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
  li: ({node, ...props}) => <li className="pl-2" {...props} />,
  blockquote: ({node, ...props}) => <blockquote className="my-4 border-l-4 border-primary/20 pl-4 italic text-muted-foreground" {...props} />,
  code: ({node, inline, className, children, ...props}) => {
    return !inline ? (
      <pre className="my-4 overflow-x-auto rounded-md bg-muted p-4"><code className="font-mono text-sm" {...props}>{children}</code></pre>
    ) : (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm text-muted-foreground" {...props}>{children}</code>
    )
  }
};

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project || !project.user) {
    notFound();
  }
  const { user } = project;
  // In a real app, you'd get the current user's ID from the session
  const currentUserId = 'user-1';
  const isOwner = user.id === currentUserId;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
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
          
          <Carousel className="w-full mb-8">
            <CarouselContent>
              {project.media.map((item, index) => (
                <CarouselItem key={index}>
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={item.alt}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover rounded-lg border"
                      data-ai-hint={item.aiHint ?? ''}
                    />
                  ) : (
                    <div className="aspect-video">
                        <iframe className="w-full h-full rounded-lg" src={item.url} title={item.alt} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-right-12" />
            <CarouselNext className="-left-12" />
          </Carousel>

          <article className="max-w-none">
            <h2 className="text-2xl font-bold font-headline text-primary mt-5 mb-3">About The Project</h2>
            <ReactMarkdown components={markdownComponents}>{project.description}</ReactMarkdown>
          </article>

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
                 <ReactMarkdown components={markdownComponents}>{project.summaryShort || ''}</ReactMarkdown>
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
