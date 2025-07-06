import ReportGenerator from "@/components/ReportGenerator";

export default function GenerateReportPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          Full Document Generation
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Start with an idea, generate a full project proposal, then generate each section of the final report individually.
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
