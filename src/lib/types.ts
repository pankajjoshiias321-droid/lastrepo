export interface Resource {
  type: 'google_search' | 'stackoverflow' | 'github' | 'reddit';
  url: string;
  label: string;
}

export interface RoadmapStep {
  step_number: number;
  title: string;
  description: string;
  estimated_time?: string;
  resources: Resource[];
}

export interface Roadmap {
  id?: string;
  user_id?: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at?: string;
  steps: RoadmapStep[];
}

export interface GenerateRoadmapRequest {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}