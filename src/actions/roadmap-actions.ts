'use server';

import { generateRoadmap as generateRoadmapService } from '@/lib/roadmap-service';
import { RoadmapStep, GenerateRoadmapRequest } from '@/lib/types';

export async function generateRoadmap(data: GenerateRoadmapRequest): Promise<{
  success: boolean;
  roadmap?: any;
  error?: string;
}> {
  try {
    const roadmap = await generateRoadmapService(data);
    return {
      success: true,
      roadmap
    };
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate roadmap'
    };
  }
}