import DiagramGenerator from "@/components/DiagramGenerator";

export default function GenerateDiagramsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          توليد المخططات الهندسية بالذكاء الاصطناعي
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          حوّل مقترحات مشاريعك إلى مخططات PlantUML احترافية. الصق مقترحك بصيغة JSON، واختر المخطط المطلوب.
        </p>
      </div>
      <DiagramGenerator />
    </div>
  );
}
