import ProposalGenerator from "@/components/ProposalGenerator";

export default function GenerateProposalPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          توليد مقترحات المشاريع بالذكاء الاصطناعي
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          أدخل فكرة مشروعك، وسيقوم الذكاء الاصطناعي بتوليد مقترح مشروع متكامل ومفصل، جاهز للعرض على أصحاب المصلحة.
        </p>
      </div>
      <ProposalGenerator />
    </div>
  );
}
