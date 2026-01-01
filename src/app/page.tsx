'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useUser } from '@/utils/auth';

export default function HomePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Your Learning <span className="text-blue-600">Roadmap</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Generate personalized learning paths with Google search links and community resources to master any skill
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-md border border-blue-200 hover:bg-gray-50 transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Paths</h3>
            <p className="text-gray-600">
              Generate learning roadmaps tailored to your skill level and learning goals
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-3xl mb-4">📺</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">YouTube Resources</h3>
            <p className="text-gray-600">
              Access the best video tutorials for each learning step
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-3xl mb-4">💾</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Save & Track</h3>
            <p className="text-gray-600">
              Save your roadmaps and track your learning progress over time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}