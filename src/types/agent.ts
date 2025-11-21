export interface Root {
  Agents: Agent[];
}

export interface Agent {
  id: string;
  name: string;
  space_id?: string;
  data?: Data; // Optional for backward compatibility
  // New flattened structure
  description?: string;
  icon?: string;
  category?: string;
  version?: string;
  author?: string;
  tags?: string[];
  commands?: Command[];
  created_at?: string;
  updated_at?: string;
}

export interface Data {
  name: string; // Added for convenience to match form
  commands: Command[];
  description: string;
  avatar?: Avatar;
  language?: string;
  tone?: string;
  knowledgeEnabled?: boolean;
  inputPlaceholder?: string;
}

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
