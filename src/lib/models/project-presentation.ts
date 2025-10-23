import { GeneratableDocument, GeneratableDocumentProperties } from './generatableDocument';

// Define the structure of a single slide
export interface Slide {
  title: string;
  content: string; // Could be markdown or a list of bullet points
  layout: 'title' | 'content' | 'image_right';
}

// The result of a presentation generation is an array of slides
export type PresentationResult = Slide[];

// Extend the base properties with presentation-specific ones
export interface PresentationProperties extends GeneratableDocumentProperties<PresentationResult> {
  title: string;
}

export class Presentation extends GeneratableDocument<PresentationResult> {
  public title: string;

  constructor(props: PresentationProperties) {
    super(props);
    this.title = props.title;
  }

  /**
   * Implements the generation logic for a presentation.
   * @param context Context might include the source text or topic.
   */
  public async generate(context: { sourceText: string }): Promise<void> {
    this.setStatus('generating');
    try {
      console.log(`Generating presentation titled: ${this.title}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async work

      // Placeholder for logic that splits source text into slides
      const slides: Slide[] = [
        { title: this.title, content: 'Introduction to the topic.', layout: 'title' },
        { title: 'Point 1', content: 'Details about the first main point.', layout: 'content' },
        { title: 'Point 2', content: 'Details about the second main point.', layout: 'content' },
        { title: 'Conclusion', content: 'Summary of the presentation.', layout: 'title' },
      ];

      this.setResult(slides);
      this.setStatus('success');

    } catch (error) {
      this.setStatus('error');
      console.error("Failed to generate presentation:", error);
    }
  }
}
