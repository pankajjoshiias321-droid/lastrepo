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
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (menuOpen && !target.closest('.menu-container') && !target.closest('[data-menu-trigger]')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
    console.log('toggleFavorite called for roadmap:', roadmap.id);

    if (!user) {
      console.error('No user authenticated');
      toast.error('You must be logged in to perform this action');
      return;
    }

    if (!roadmap.id) {
      console.error('No roadmap ID provided');
      toast.error('Invalid roadmap');
      return;
    }

    const actionKey = `favorite-${roadmap.id}`;
    if (actionLoading[actionKey]) {
      console.log('Action already in progress');
      return;
    }

    setActionLoading(prev => ({ ...prev, [actionKey]: true }));

    try {
      console.log('Updating favorite status in database...');
      const { data, error } = await supabase
        .from('roadmaps')
        .update({ is_favorite: !roadmap.is_favorite })
        .eq('id', roadmap.id)
        .eq('user_id', user.id) // Add user_id check for security
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Database update successful:', data);

      // Update local state
      setRoadmaps(prev =>
        prev.map(r =>
          r.id === roadmap.id ? { ...r, is_favorite: !r.is_favorite } : r
        )
      );

      toast.success(roadmap.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(`Failed to update favorite status: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const shareRoadmap = async (roadmap: RoadmapWithFavorite) => {
    console.log('shareRoadmap called for roadmap:', roadmap.id);

    if (!user) {
      console.error('No user authenticated');
      toast.error('You must be logged in to perform this action');
      return;
    }

    if (!roadmap.id) {
      console.error('No roadmap ID provided');
      toast.error('Invalid roadmap');
      return;
    }

    const actionKey = `share-${roadmap.id}`;
    if (actionLoading[actionKey]) {
      console.log('Action already in progress');
      return;
    }

    setActionLoading(prev => ({ ...prev, [actionKey]: true }));

    try {
      console.log('Checking existing share token...');
      let shareToken = roadmap.share_token;

      if (!shareToken) {
        console.log('Generating new share token...');
        // Generate a unique share token
        shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        console.log('Updating roadmap with share token...');
        const { data, error } = await supabase
          .from('roadmaps')
          .update({ share_token: shareToken })
          .eq('id', roadmap.id)
          .eq('user_id', user.id) // Add user_id check for security
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Share token update successful:', data);

        // Update local state
        setRoadmaps(prev =>
          prev.map(r =>
            r.id === roadmap.id ? { ...r, share_token: shareToken } : r
          )
        );
      }

      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      console.log('Opening share modal with URL:', shareUrl);
      setShareModal({ open: true, roadmap, shareUrl });
    } catch (error: any) {
      console.error('Error sharing roadmap:', error);
      toast.error(`Failed to share roadmap: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const duplicateRoadmap = async (roadmap: RoadmapWithFavorite) => {
    console.log('duplicateRoadmap called for roadmap:', roadmap.id);

    if (!user) {
      console.error('No user authenticated');
      toast.error('You must be logged in to perform this action');
      return;
    }

    if (!roadmap.id) {
      console.error('No roadmap ID provided');
      toast.error('Invalid roadmap');
      return;
    }

    const actionKey = `duplicate-${roadmap.id}`;
    if (actionLoading[actionKey]) {
      console.log('Action already in progress');
      return;
    }

    setActionLoading(prev => ({ ...prev, [actionKey]: true }));

    try {
      console.log('Creating duplicated roadmap...');
      // First, create the duplicated roadmap
      const { data: newRoadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: user.id,
          topic: `${roadmap.topic} (Copy)`,
          level: roadmap.level,
          is_favorite: false
        })
        .select()
        .single();

      if (roadmapError) {
        console.error('Error creating roadmap:', roadmapError);
        throw roadmapError;
      }

      console.log('New roadmap created:', newRoadmap);

      // Then, duplicate all steps
      console.log('Fetching roadmap steps...');
      const { data: steps, error: stepsError } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('roadmap_id', roadmap.id);

      if (stepsError) {
        console.error('Error fetching steps:', stepsError);
        throw stepsError;
      }

      console.log('Found steps:', steps?.length || 0);

      if (steps && steps.length > 0) {
        console.log('Duplicating steps...');
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

        if (insertError) {
          console.error('Error inserting steps:', insertError);
          throw insertError;
        }

        console.log('Steps duplicated successfully');
      }

      // Add the new roadmap to the state
      setRoadmaps(prev => [newRoadmap, ...prev]);
      toast.success('Roadmap duplicated successfully');
    } catch (error: any) {
      console.error('Error duplicating roadmap:', error);
      toast.error(`Failed to duplicate roadmap: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const deleteRoadmap = async (roadmap: RoadmapWithFavorite) => {
    console.log('deleteRoadmap called for roadmap:', roadmap.id);

    if (!user) {
      console.error('No user authenticated');
      toast.error('You must be logged in to perform this action');
      return;
    }

    if (!roadmap.id) {
      console.error('No roadmap ID provided');
      toast.error('Invalid roadmap');
      return;
    }

    const actionKey = `delete-${roadmap.id}`;
    if (actionLoading[actionKey]) {
      console.log('Action already in progress');
      return;
    }

    setActionLoading(prev => ({ ...prev, [actionKey]: true }));

    try {
      console.log('Deleting roadmap from database...');
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmap.id)
        .eq('user_id', user.id); // Add user_id check for security

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Roadmap deleted successfully');

      setRoadmaps(prev => prev.filter(r => r.id !== roadmap.id));
      setDeleteModal({ open: false, roadmap: null });
      toast.success('Roadmap deleted successfully');
    } catch (error: any) {
      console.error('Error deleting roadmap:', error);
      toast.error(`Failed to delete roadmap: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
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
              <div key={roadmap.id} className="bg-white shadow rounded-lg relative">
                <div className="absolute top-4 right-4 z-50">
                  <div className="relative">
                    <button
                      data-menu-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === roadmap.id ? null : roadmap.id);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                    </button>

                    {menuOpen === roadmap.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-gray-200 z-50 menu-container">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(roadmap);
                              setMenuOpen(null);
                            }}
                            disabled={actionLoading[`favorite-${roadmap.id}`]}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[`favorite-${roadmap.id}`] ? (
                              <div className="w-4 h-4 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            ) : roadmap.is_favorite ? (
                              <StarIconSolid className="w-4 h-4 mr-3 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-4 h-4 mr-3" />
                            )}
                            {roadmap.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateRoadmap(roadmap);
                              setMenuOpen(null);
                            }}
                            disabled={actionLoading[`duplicate-${roadmap.id}`]}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[`duplicate-${roadmap.id}`] ? (
                              <div className="w-4 h-4 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            ) : (
                              <DocumentDuplicateIcon className="w-4 h-4 mr-3" />
                            )}
                            Duplicate Roadmap
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareRoadmap(roadmap);
                              setMenuOpen(null);
                            }}
                            disabled={actionLoading[`share-${roadmap.id}`]}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[`share-${roadmap.id}`] ? (
                              <div className="w-4 h-4 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            ) : (
                              <ShareIcon className="w-4 h-4 mr-3" />
                            )}
                            Share Roadmap
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ open: true, roadmap });
                              setMenuOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 mr-3" />
                            Delete Roadmap
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-900"
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
              Are you sure you want to delete &quot;{deleteModal.roadmap.topic}&quot;? This action cannot be undone.
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
                disabled={actionLoading[`delete-${deleteModal.roadmap?.id}`]}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading[`delete-${deleteModal.roadmap?.id}`] && (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}