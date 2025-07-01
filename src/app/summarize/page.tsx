import Summarizer from "@/components/Summarizer";

export default function SummarizePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          تلخيص المشاريع بالذكاء الاصطناعي
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          أدخل وصفًا تفصيليًا لمشروعك، وسيقوم الذكاء الاصطناعي بتوليد ملخص احترافي يسلط الضوء على الجوانب الرئيسية والتقنيات المستخدمة.
        </p>
      </div>
      <Summarizer />
    </div>
  );
}
