'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser } from '@/utils/auth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

export default function RoadmapDetailPage() {
  const params = useParams();
  const { user } = useUser();
  const [roadmap, setRoadmap] = useState<Database['public']['Tables']['roadmaps']['Row'] | null>(null);
  const [steps, setSteps] = useState<Database['public']['Tables']['roadmap_steps']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!params.id || !user) return;
      
      try {
        // Fetch the roadmap
        const { data: roadmapData, error: roadmapError } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();

        if (roadmapError) throw roadmapError;
        
        setRoadmap(roadmapData);

        // Fetch the steps for this roadmap
        const { data: stepsData, error: stepsError } = await supabase
          .from('roadmap_steps')
          .select('*')
          .eq('roadmap_id', params.id)
          .order('step_number', { ascending: true });

        if (stepsError) throw stepsError;
        
        setSteps(stepsData || []);
      } catch (error) {
        console.error('Error fetching roadmap:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [params.id, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Roadmap not found</h3>
            <p className="mt-1 text-gray-500">The requested roadmap could not be found or you don't have permission to view it.</p>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{roadmap.topic}</h1>
              <p className="mt-2 text-gray-600">
                Level: <span className="capitalize font-medium">{roadmap.level}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Created: {new Date(roadmap.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {step.step_number}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-gray-600">{step.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={step.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      Watch Tutorial
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}