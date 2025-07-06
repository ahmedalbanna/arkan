import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllProjects, getAllCategories } from '@/lib/db/queries';
import { Search } from 'lucide-react';

export default async function ProjectsPage({ searchParams }: { searchParams: { category?: string; q?: string }}) {
  const projects = await getAllProjects(searchParams.category);
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          استكشف المشاريع
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          تصفح مجموعة متنوعة من الأعمال المبتكرة من قبل محترفين موهوبين.
        </p>
      </div>

      <div className="mb-8 p-4 bg-card rounded-lg border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="ابحث عن مشاريع، مهارات، أو كلمات مفتاحية..." className="pr-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="w-full md:w-auto font-headline">بحث</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
