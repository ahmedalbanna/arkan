import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { getFeaturedProjects } from '@/lib/db/queries';
import { ArrowLeft, BrainCircuit, Code, Users } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <div className="flex flex-col">
      <section className="py-20 md:py-32 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
            أركان: منصتك لعرض الإبداع المهني
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            اعرض أعمالك، اكتشف المواهب، وتفاعل مع مجتمع من المحترفين في مجالات تطوير التطبيقات، التصميم، والذكاء الاصطناعي.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="font-headline">
              <Link href="/projects">
                استكشف المشاريع <ArrowLeft className="mr-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-headline">
              <Link href="/summarize">جرّب تلخيص المشاريع بالذكاء الاصطناعي</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline font-bold text-center mb-12">مشاريع مميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Code className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">منصة شاملة للعرض</h3>
              <p className="text-muted-foreground">
                اجمع مشاريعك في تطوير التطبيقات، تصميم الويب، والمزيد في مكان واحد.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <BrainCircuit className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">تلخيص بالذكاء الاصطناعي</h3>
              <p className="text-muted-foreground">
                استخدم أداتنا الذكية لتوليد ملخصات موجزة تسلط الضوء على نقاط قوة مشروعك.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">مجتمع تفاعلي</h3>
              <p className="text-muted-foreground">
                شارك أعمالك، احصل على تغذية راجعة، وتواصل مع خبراء الصناعة.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
