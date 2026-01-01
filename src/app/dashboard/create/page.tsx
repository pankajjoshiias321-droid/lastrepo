'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/utils/auth';
import { generateRoadmap } from '@/lib/roadmap-service';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function CreateRoadmapPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate the roadmap using our service
      const roadmapData = await generateRoadmap({ topic, level });

      // Save roadmap to database
      if (user) {
        // First, insert the roadmap
        const { data: roadmap, error: roadmapError } = await supabase
          .from('roadmaps')
          .insert({
            user_id: user.id as string,
            topic: roadmapData.topic,
            level: roadmapData.level,
          })
          .select()
          .single();

        if (roadmapError) throw roadmapError;

        // Then insert all the steps
        const stepsWithRoadmapId = roadmapData.steps.map(step => ({
          roadmap_id: roadmap.id,
          step_number: step.step_number,
          title: step.title,
          description: step.description,
          youtube_link: step.youtube_link
        }));

        const { error: stepsError } = await supabase
          .from('roadmap_steps')
          .insert(stepsWithRoadmapId);

        if (stepsError) throw stepsError;

        toast.success('Roadmap created successfully!');
        router.push(`/dashboard/roadmap/${roadmap.id}`);
      } else {
        // For guest users, just show the generated roadmap without saving
        toast.success('Roadmap generated successfully!');
        // In a real app, we might store this temporarily or redirect to a view page
        console.log('Generated roadmap:', roadmapData);
      }
    } catch (error: any) {
      console.error('Error creating roadmap:', error);
      toast.error(error?.message || 'Failed to create roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Learning Roadmap</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., JavaScript, Python, Web Development, Data Science"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the topic you want to learn
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        id={`level-${option}`}
                        name="level"
                        type="radio"
                        checked={level === option}
                        onChange={() => setLevel(option)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor={`level-${option}`}
                        className="ml-3 block text-sm font-medium text-gray-700 capitalize"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Roadmap'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}