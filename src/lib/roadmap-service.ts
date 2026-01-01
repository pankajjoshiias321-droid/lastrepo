import { Roadmap, RoadmapStep, GenerateRoadmapRequest } from './types';

// Mock AI service for generating roadmaps
export async function generateRoadmap({ topic, level }: GenerateRoadmapRequest): Promise<Roadmap> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate steps based on topic and level
  const steps: RoadmapStep[] = [];
  const stepCount = level === 'beginner' ? 10 : level === 'intermediate' ? 12 : 15;
  
  // Define base topics for different learning paths
  const baseTopics: Record<string, string[]> = {
    'web development': [
      'HTML & CSS Fundamentals',
      'JavaScript Basics',
      'Responsive Design',
      'Version Control (Git)',
      'Frontend Framework (React/Vue/Angular)',
      'APIs and Fetching Data',
      'State Management',
      'Testing',
      'Deployment',
      'Advanced Patterns'
    ],
    'javascript': [
      'JavaScript Syntax and Basics',
      'Functions and Scope',
      'Objects and Prototypes',
      'DOM Manipulation',
      'Async Programming (Promises, Async/Await)',
      'ES6+ Features',
      'Modules and Bundling',
      'Testing JavaScript',
      'Node.js Introduction',
      'Frameworks (React, Vue, Angular)'
    ],
    'python': [
      'Python Syntax and Basics',
      'Data Structures',
      'Functions and Modules',
      'Object-Oriented Programming',
      'File Handling',
      'Error Handling',
      'Libraries and Packages',
      'Web Development (Django/Flask)',
      'Database Integration',
      'Testing and Best Practices'
    ],
    'data science': [
      'Statistics Fundamentals',
      'Python for Data Science',
      'Data Manipulation (Pandas)',
      'Data Visualization',
      'SQL for Data Analysis',
      'Machine Learning Basics',
      'Data Cleaning',
      'Model Evaluation',
      'Deep Learning Introduction',
      'Big Data Concepts'
    ],
    'ai engineering': [
      'Mathematics for AI',
      'Python Programming',
      'Machine Learning Fundamentals',
      'Neural Networks',
      'Deep Learning',
      'Natural Language Processing',
      'Computer Vision',
      'Reinforcement Learning',
      'MLOps',
      'AI Ethics'
    ],
    'cybersecurity': [
      'Networking Fundamentals',
      'Operating Systems',
      'Cryptography',
      'Security Principles',
      'Vulnerability Assessment',
      'Penetration Testing',
      'Incident Response',
      'Compliance and Standards',
      'Forensics',
      'Cloud Security'
    ]
  };
  
  // Get the base topics for the requested topic, or create a generic path
  let baseSteps: string[];
  const topicKey = Object.keys(baseTopics).find(key => topic.toLowerCase().includes(key));
  if (topicKey) {
    baseSteps = baseTopics[topicKey];
  } else {
    // Create a generic roadmap for unknown topics
    baseSteps = [
      `${topic} Fundamentals`,
      `Introduction to ${topic}`,
      `Core Concepts in ${topic}`,
      `Advanced ${topic} Techniques`,
      `Best Practices for ${topic}`,
      `${topic} Tools and Frameworks`,
      `Building Projects with ${topic}`,
      `${topic} in Real-world Applications`,
      `Debugging and Troubleshooting ${topic}`,
      `Future Trends in ${topic}`
    ];
  }
  
  // Generate steps based on the topic
  for (let i = 0; i < stepCount; i++) {
    const stepIndex = i % baseSteps.length;
    const stepTopic = baseSteps[stepIndex];
    
    // Create a step with a unique title
    const title = `${stepTopic} - ${i + 1}`;
    const description = `Learn the fundamentals of ${stepTopic}. Understand core concepts, best practices, and common patterns.`;
    
    // Determine estimated time based on level
    let estimatedTime = '';
    if (level === 'beginner') {
      estimatedTime = '2-3 weeks';
    } else if (level === 'intermediate') {
      estimatedTime = '1-2 weeks';
    } else {
      estimatedTime = '3-5 days';
    }
    
    // Create YouTube search link
    const searchQuery = encodeURIComponent(`${stepTopic} tutorial`);
    const youtubeLink = `https://www.youtube.com/results?search_query=${searchQuery}`;
    
    steps.push({
      step_number: i + 1,
      title,
      description,
      estimated_time: estimatedTime,
      youtube_link: youtubeLink
    });
  }
  
  return {
    topic,
    level,
    steps
  };
}