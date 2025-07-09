import { getUserProfile } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/ProjectCard';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUserProfile(params.id);

  if (!user) {
    notFound();
  }

  const userProjects = user.projects;
  const userSkills = user.userSkills.map(us => us.skill);

  return (
    <div className="bg-card">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <Avatar className="w-32 h-32 border-4 border-background shadow-md">
            <AvatarImage src={user.avatarUrl ?? ''} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-headline font-bold">{user.name}</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">{user.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {userSkills.map(skill => (
                <Badge key={skill.id} variant="secondary">{skill.name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-background py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline font-bold mb-8">مشاريع {user.name}</h2>
          {userProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8 bg-card rounded-lg">لم يقم هذا المستخدم بإضافة أي مشاريع بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}
