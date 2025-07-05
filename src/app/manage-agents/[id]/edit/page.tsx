import AgentEditor from '@/components/AgentEditor';
import { Pencil } from 'lucide-react';

export default function EditAgentPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Pencil className="w-10 h-10" />
          تعديل الوكيل
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          قم بتحديث اسم ووصف وكيل الذكاء الاصطناعي.
        </p>
      </div>
      <AgentEditor agentId={params.id} />
    </div>
  );
}
