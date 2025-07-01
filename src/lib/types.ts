export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
}

export interface Media {
  type: 'image' | 'video';
  url: string;
  alt: string;
  aiHint?: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'FlutterFlow' | 'UI/UX Design' | 'AI' | 'Web Design';
  tags: string[];
  media: Media[];
  liveLink?: string;
  summary?: {
    short: string;
    technologies: string[];
  };
  comments: Comment[];
  createdAt: string;
}
