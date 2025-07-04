import IntroductionGenerator from "@/components/IntroductionGenerator";

export default function GenerateIntroductionPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          توليد مقدمة المشروع بالذكاء الاصطناعي
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          هل لديك مقترح مشروع جاهز؟ الصق محتواه بصيغة JSON أدناه، وسيقوم الذكاء الاصطناعي بتحليله وتوليد مقدمة احترافية ومتكاملة له.
        </p>
      </div>
      <IntroductionGenerator />
    </div>
  );
}
