import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllProjects, getAllCategories } from '@/lib/db/queries';
import { Search } from 'lucide-react';

export default async function ProjectsPage({ searchParams }: { searchParams: { category?: string; q?: string }}) {
  const { category, q } = searchParams;
  const projects = await getAllProjects({ category, q });
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

      <form className="mb-8 p-4 bg-card rounded-lg border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            name="q"
            defaultValue={q || ''}
            placeholder="ابحث عن مشاريع، مهارات، أو كلمات مفتاحية..." 
            className="pr-10" 
          />
        </div>
        <Select name="category" defaultValue={category || 'all'}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full md:w-auto font-headline">بحث</Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="text-center py-16 md:col-span-3">
             <h3 className="text-xl font-medium">لم يتم العثور على نتائج</h3>
             <p className="mt-1 text-sm text-muted-foreground">
                جرّب تعديل كلمات البحث أو الفلاتر.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
