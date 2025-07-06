import EditProjectForm from '@/components/EditProjectForm';
import { getProjectById, getAllCategories } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { FilePenLine } from 'lucide-react';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  const categories = await getAllCategories();

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FilePenLine className="w-10 h-10" />
          تعديل المشروع
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          قم بتحديث تفاصيل مشروعك أدناه.
        </p>
      </div>
      <EditProjectForm categories={categories} project={project} />
    </div>
  );
}
