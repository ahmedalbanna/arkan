
export interface Agent {
  id: string;
  name: string;
  space_id?: string;
  
  // Flattened structure
  description?: string;
  icon?: string;
  category?: string;
  version?: string;
  author?: string;
  tags?: string[];
  
  // New prompt and guidelines
  prompt?: string;
  guidelines?: string[];

  // Deprecated: For backward compatibility with old data structure
  data?: Data;
  
  created_at?: string;
  updated_at?: string;
}

// Data is deprecated but kept for backward compatibility
export interface Data {
  name: string; 
  description: string;
  avatar?: Avatar;
  // This is deprecated in favor of the new top-level prompt/guidelines
  commands?: Command[];
  language?: string;
  tone?: string;
  knowledgeEnabled?: boolean;
  inputPlaceholder?: string;
}

// Command is deprecated but kept for backward compatibility
export interface Command {
  description: string;
  name: string;
  prompt: string;
  id: string;
  mode: string;
}

export interface Avatar {
  type: string;
  data: AvatarData;
}

export interface AvatarData {
  value: string;
}
