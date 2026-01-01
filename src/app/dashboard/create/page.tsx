'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/utils/auth';
import { generateRoadmap } from '@/lib/roadmap-service';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const SUGGESTED_TOPICS = [
  'Web Development',
  'JavaScript',
  'Python',
  'Data Science',
  'Machine Learning',
  'Cyber Security',
  'React',
  'DSA',
  'Chess Opening',
  'Mobile Development',
  'DevOps',
  'Cloud Computing',
  'Database Design',
  'UI/UX Design',
  'Game Development'
];

export default function CreateRoadmapPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0);
  const router = useRouter();
  const { user } = useUser();

  // Helper function to check if topic is meaningful
  const isValidTopic = (topic: string): boolean => {
    const words = topic.trim().toLowerCase().split(/\s+/);

    for (const word of words) {
      // Each word must contain at least one vowel
      if (!/[aeiou]/.test(word)) {
        return false;
      }

      // No 3 or more consecutive same letters
      if (/(.)\1{2,}/.test(word)) {
        return false;
      }

      // Check for repeating patterns (like asdasd, ababab)
      const len = word.length;
      if (len >= 6) { // only check longer words for performance
        for (let i = 1; i <= Math.floor(len / 2); i++) {
          if (len % i === 0) {
            const pattern = word.slice(0, i);
            let isRepeating = true;
            for (let j = i; j < len; j += i) {
              if (word.slice(j, j + i) !== pattern) {
                isRepeating = false;
                break;
              }
            }
            if (isRepeating) {
              return false;
            }
          }
        }
      }
    }

    return true;
  };

  // Input validation function
  const validateTopic = (input: string): { isValid: boolean; error?: string } => {
    if (!input.trim()) {
      return { isValid: false, error: 'Topic is required' };
    }
    if (input.trim().length < 3) {
      return { isValid: false, error: 'Topic must be at least 3 characters long' };
    }
    if (!/^[a-zA-Z\s]+$/.test(input.trim())) {
      return { isValid: false, error: 'Topic can only contain letters and spaces' };
    }
    if (!isValidTopic(input)) {
      return { isValid: false, error: 'Please enter a real, meaningful topic.' };
    }
    return { isValid: true };
  };

  // Handle topic input change
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTopic(value);

    // Show suggestions if user is typing
    if (value.length > 0) {
      const filtered = SUGGESTED_TOPICS.filter(topic =>
        topic.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
    setShowSuggestions(false);
  };

  // Rate limiting check
  const canGenerate = (): boolean => {
    const now = Date.now();
    const cooldownMs = 10000; // 10 seconds
    return now - lastGenerationTime >= cooldownMs;
  };

  const getRemainingCooldown = (): number => {
    const now = Date.now();
    const cooldownMs = 10000;
    const elapsed = now - lastGenerationTime;
    return Math.max(0, cooldownMs - elapsed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate topic
    const validation = validateTopic(topic);
    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    // Check rate limiting
    if (!canGenerate()) {
      const remaining = Math.ceil(getRemainingCooldown() / 1000);
      toast.error(`Please wait ${remaining} seconds before generating another roadmap`);
      return;
    }

    setLoading(true);
    setLastGenerationTime(Date.now());

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
          resources: step.resources
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
              <div className="relative">
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={handleTopicChange}
                  onFocus={() => topic.length === 0 && setSuggestions(SUGGESTED_TOPICS.slice(0, 5))}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="e.g., JavaScript, Python, Web Development, Data Science"
                />
                
                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="mt-1 text-sm text-gray-500">
                  Enter the topic you want to learn (minimum 3 characters, letters and spaces only)
                </p>
              </div>

              {/* Suggested Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popular Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.slice(0, 9).map((suggestedTopic) => (
                    <button
                      key={suggestedTopic}
                      type="button"
                      onClick={() => setTopic(suggestedTopic)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {suggestedTopic}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Click any topic above to auto-fill the input
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
                  disabled={loading || !canGenerate()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : !canGenerate() ? `Wait ${Math.ceil(getRemainingCooldown() / 1000)}s` : 'Generate Roadmap'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}