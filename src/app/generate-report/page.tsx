import ReportGenerator from "@/components/ReportGenerator";
import { getAgents } from '@/lib/db/queries/agents';

export default async function GenerateReportPage() {
  const agents = await getAgents();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          توليد تقرير المشروع الكامل
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          الصق مقترح مشروعك الكامل بصيغة JSON، ثم قم بتوليد كل قسم من أقسام التقرير النهائي بشكل فردي.
        </p>
      </div>
      <ReportGenerator agents={agents} />
    </div>
  );
}
