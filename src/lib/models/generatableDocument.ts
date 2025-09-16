
export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface GeneratableDocumentProperties<T> {
  id: string;
  status?: GenerationStatus;
  result?: T;
}

/**
 * An abstract base class for documents that can be generated.
 * It manages the status and result of the generation process.
 * @template T The type of the generation result.
 */
export abstract class GeneratableDocument<T> {
  public id: string;
  public status: GenerationStatus;
  public result?: T;

  constructor(props: GeneratableDocumentProperties<T>) {
    this.id = props.id;
    this.status = props.status || 'idle';
    this.result = props.result;
  }

  /**
   * The core generation logic, to be implemented by subclasses.
   * @param context Any necessary input for the generation process.
   */
  abstract generate(context: any): Promise<void>;

  protected setStatus(status: GenerationStatus): void {
    this.status = status;
  }

  protected setResult(result: T): void {
    this.result = result;
  }
}
