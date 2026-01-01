'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import Link from 'next/link';

type Roadmap = Database['public']['Tables']['roadmaps']['Row'];
type RoadmapStep = Database['public']['Tables']['roadmap_steps']['Row'];

export default function SharedRoadmapPage({ params }: { params: { token: string } }) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedRoadmap = async () => {
      try {
        // Find roadmap by share token
        const { data: roadmapData, error: roadmapError } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('share_token', params.token)
          .single();

        if (roadmapError || !roadmapData) {
          setError('Roadmap not found or not shared');
          return;
        }

        setRoadmap(roadmapData);

        // Fetch steps
        const { data: stepsData, error: stepsError } = await supabase
          .from('roadmap_steps')
          .select('*')
          .eq('roadmap_id', roadmapData.id)
          .order('step_number');

        if (stepsError) {
          setError('Failed to load roadmap steps');
          return;
        }

        setSteps(stepsData || []);
      } catch (err) {
        setError('An error occurred while loading the roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedRoadmap();
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Roadmap Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{roadmap.topic}</h1>
              <p className="text-gray-600 mt-2">Level: {roadmap.level}</p>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(roadmap.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Shared Roadmap
              </span>
            </div>
          </div>
          <p className="text-gray-600">
            This is a shared, read-only view of a learning roadmap. To create your own roadmaps,{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              sign up here
            </Link>
            .
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {(step.resources as any[]).map((resource: any, index: number) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          resource.type === 'google_search' ? 'bg-blue-600 hover:bg-blue-700' :
                          resource.type === 'stackoverflow' ? 'bg-orange-600 hover:bg-orange-700' :
                          resource.type === 'github' ? 'bg-gray-800 hover:bg-gray-900' :
                          resource.type === 'reddit' ? 'bg-red-600 hover:bg-red-700' :
                          'bg-gray-600 hover:bg-gray-700'
                        } transition duration-300`}
                      >
                        {resource.label}
                      </a>
                    ))}
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