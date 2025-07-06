import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ProjectForCard } from '@/lib/db/queries';
import { ArrowLeft } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectForCard;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = project;
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full">
            <Image
              src={project.media[0]?.url || 'https://placehold.co/400x300.png'}
              alt={project.media[0]?.alt || project.title}
              fill
              className="object-cover rounded-t-lg"
              data-ai-hint={project.media[0]?.aiHint ?? ''}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-6">
          <Badge variant="outline" className="mb-2">{project.category}</Badge>
          <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-6 pt-0">
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl ?? ''} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-muted-foreground">{user.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>عرض المشروع</span>
            <ArrowLeft className="mr-1 h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
