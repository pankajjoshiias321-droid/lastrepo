'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/utils/auth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Roadmap } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useUser();
  const [roadmaps, setRoadmaps] = useState<Database['public']['Tables']['roadmaps']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRoadmaps(data || []);
      } catch (error) {
        console.error('Error fetching roadmaps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Learning Roadmaps</h1>
          <Link
            href="/dashboard/create"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Create New Roadmap
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmaps yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first learning roadmap</p>
            <Link
              href="/dashboard/create"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Create Your First Roadmap
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => (
              <div key={roadmap.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{roadmap.topic}</h3>
                  <p className="mt-1 text-sm text-gray-500">Level: {roadmap.level}</p>
                  <p className="mt-1 text-sm text-gray-500">Created: {new Date(roadmap.created_at).toLocaleDateString()}</p>
                  <div className="mt-4 flex space-x-3">
                    <Link
                      href={`/dashboard/roadmap/${roadmap.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}