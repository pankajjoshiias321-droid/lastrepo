'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/utils/auth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Roadmap } from '@/lib/types';
import {
  EllipsisVerticalIcon,
  StarIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

type RoadmapWithFavorite = Database['public']['Tables']['roadmaps']['Row'];

export default function DashboardPage() {
  const { user } = useUser();
  const [roadmaps, setRoadmaps] = useState<RoadmapWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ open: boolean; roadmap: RoadmapWithFavorite | null; shareUrl: string }>({
    open: false,
    roadmap: null,
    shareUrl: ''
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; roadmap: RoadmapWithFavorite | null }>({
    open: false,
    roadmap: null
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && !(event.target as Element).closest('.menu-container')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Fetch roadmaps when user changes
  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching roadmaps for user:', user.id);
        const { data, error } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching roadmaps:', error);
          throw error;
        }

        console.log('Fetched roadmaps:', data?.length || 0);
        setRoadmaps(data || []);
      } catch (error) {
        console.error('Failed to fetch roadmaps:', error);
        toast.error('Failed to load roadmaps');
        setRoadmaps([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [user]);

  const toggleFavorite = async (roadmap: RoadmapWithFavorite) => {
    try {
      const { error } = await supabase
        .from('roadmaps')
        .update({ is_favorite: !roadmap.is_favorite })
        .eq('id', roadmap.id);

      if (error) throw error;

      setRoadmaps(prev =>
        prev.map(r =>
          r.id === roadmap.id ? { ...r, is_favorite: !r.is_favorite } : r
        )
      );

      toast.success(roadmap.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const shareRoadmap = async (roadmap: RoadmapWithFavorite) => {
    try {
      let shareToken = roadmap.share_token;

      if (!shareToken) {
        // Generate a unique share token
        shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const { error } = await supabase
          .from('roadmaps')
          .update({ share_token: shareToken })
          .eq('id', roadmap.id);

        if (error) throw error;

        // Update local state
        setRoadmaps(prev =>
          prev.map(r =>
            r.id === roadmap.id ? { ...r, share_token: shareToken } : r
          )
        );
      }

      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      setShareModal({ open: true, roadmap, shareUrl });
    } catch (error) {
      console.error('Error sharing roadmap:', error);
      toast.error('Failed to share roadmap');
    }
  };

  const duplicateRoadmap = async (roadmap: RoadmapWithFavorite) => {
    try {
      // First, create the duplicated roadmap
      const { data: newRoadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: user!.id,
          topic: `${roadmap.topic} (Copy)`,
          level: roadmap.level,
          is_favorite: false
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      // Then, duplicate all steps
      const { data: steps, error: stepsError } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('roadmap_id', roadmap.id);

      if (stepsError) throw stepsError;

      if (steps && steps.length > 0) {
        const duplicatedSteps = steps.map(step => ({
          roadmap_id: newRoadmap.id,
          step_number: step.step_number,
          title: step.title,
          description: step.description,
          youtube_link: step.youtube_link
        }));

        const { error: insertError } = await supabase
          .from('roadmap_steps')
          .insert(duplicatedSteps);

        if (insertError) throw insertError;
      }

      // Add the new roadmap to the state
      setRoadmaps(prev => [newRoadmap, ...prev]);
      toast.success('Roadmap duplicated successfully');
    } catch (error) {
      console.error('Error duplicating roadmap:', error);
      toast.error('Failed to duplicate roadmap');
    }
  };

  const deleteRoadmap = async (roadmap: RoadmapWithFavorite) => {
    try {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmap.id);

      if (error) throw error;

      setRoadmaps(prev => prev.filter(r => r.id !== roadmap.id));
      setDeleteModal({ open: false, roadmap: null });
      toast.success('Roadmap deleted successfully');
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete roadmap');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareModal.shareUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
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
              <div key={roadmap.id} className="bg-white overflow-hidden shadow rounded-lg relative">
                <div className="absolute top-4 right-4 menu-container">
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === roadmap.id ? null : roadmap.id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                    </button>

                    {menuOpen === roadmap.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 menu-container">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              toggleFavorite(roadmap);
                              setMenuOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {roadmap.is_favorite ? (
                              <StarIconSolid className="w-4 h-4 mr-3 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-4 h-4 mr-3" />
                            )}
                            {roadmap.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                          </button>

                          <button
                            onClick={() => {
                              duplicateRoadmap(roadmap);
                              setMenuOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4 mr-3" />
                            Duplicate Roadmap
                          </button>

                          <button
                            onClick={() => {
                              shareRoadmap(roadmap);
                              setMenuOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <ShareIcon className="w-4 h-4 mr-3" />
                            Share Roadmap
                          </button>

                          <button
                            onClick={() => {
                              setDeleteModal({ open: true, roadmap });
                              setMenuOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="w-4 h-4 mr-3" />
                            Delete Roadmap
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{roadmap.topic}</h3>
                      <p className="text-sm text-gray-500">Level: {roadmap.level}</p>
                      <p className="text-sm text-gray-500">Created: {new Date(roadmap.created_at).toLocaleDateString()}</p>
                      {roadmap.is_favorite && (
                        <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <StarIconSolid className="w-3 h-3 mr-1" />
                          Favorite
                        </span>
                      )}
                    </div>
                  </div>
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

      {/* Share Modal */}
      {shareModal.open && shareModal.roadmap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Roadmap</h3>
            <p className="text-sm text-gray-600 mb-4">
              Anyone with this link can view this roadmap (read-only)
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={shareModal.shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShareModal({ open: false, roadmap: null, shareUrl: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.roadmap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Roadmap</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.roadmap.topic}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ open: false, roadmap: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRoadmap(deleteModal.roadmap!)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}