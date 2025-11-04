export type ExternalContextType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

// define externalContext 
export interface ExternalContext {
  fileName: string;
  content: string;
  type: ExternalContextType;
}
