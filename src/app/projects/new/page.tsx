import NewProjectForm from '@/components/NewProjectForm';
import { getAllCategories } from '@/lib/db/queries';
import { FilePlus2 } from 'lucide-react';

export default async function NewProjectPage() {
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FilePlus2 className="w-10 h-10" />
          إضافة مشروع جديد
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          شارك أعمالك مع المجتمع. املأ النموذج أدناه لعرض مشروعك.
        </p>
      </div>
      <NewProjectForm categories={categories} />
    </div>
  );
}
