import { GeneratableDocument, GeneratableDocumentProperties } from './generatableDocument';

// Define what a report's result looks like
export interface ReportResult {
  title: string;
  content: string; // Markdown content
}

// Extend the base properties with report-specific ones
export interface ReportProperties extends GeneratableDocumentProperties<ReportResult> {
  topic: string;
}

export class Report extends GeneratableDocument<ReportResult> {
  public topic: string;

  constructor(props: ReportProperties) {
    super(props);
    this.topic = props.topic;
  }

  /**
   * Implements the generation logic for a report.
   * @param context An object containing necessary data, e.g., an API key or user input
   */
  public async generate(context: any): Promise<void> {
    this.setStatus('generating');
    try {
      // Placeholder for actual report generation logic (e.g., an AI call)
      console.log(`Generating report on topic: ${this.topic}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate async work

      const generatedContent = `# Report on ${this.topic}\n\nThis is the auto-generated report content based on the topic.`;
      
      this.setResult({
        title: `Report: ${this.topic}`,
        content: generatedContent,
      });
      this.setStatus('success');

    } catch (error) {
      this.setStatus('error');
      console.error("Failed to generate report:", error);
      // Optionally re-throw or handle the error
    }
  }
}
