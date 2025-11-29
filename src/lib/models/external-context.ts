export type ExternalContextType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

// define externalContext 
export interface ExternalContext {
  id: string;
  fileName: string;
  content: string;
  type: ExternalContextType;
}
